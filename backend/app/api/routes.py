import uuid
import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import EpicModel, ValidationModel
from app.models.schemas import (
    RequirementInput,
    TaskSchema,
    EpicSchema,
    ValidationMetrics,
    ValidationResult,
    ValidationHistoryEntry,
    EpicResponse,
    HumanFeedback,
    TaskAssignment,
    WaveResult,
)
from app.services.llm_service import LLMService
from app.services.planning_validator import PlanningValidator
from app.services.dag_builder import DAGBuilder
from app.services.wave_engine import WaveEngine
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

llm_service = LLMService()
validator = PlanningValidator()
dag_builder = DAGBuilder()
wave_engine = WaveEngine()


def _epic_model_to_schema(epic_model: EpicModel) -> EpicSchema:
    """Convert a database EpicModel to an EpicSchema."""
    from app.models.schemas import TechnicalDetail

    tasks_data = epic_model.tasks or []
    tasks = []
    for t in tasks_data:
        td = t.get("technical_details")
        technical_details = TechnicalDetail(**td) if isinstance(td, dict) else None
        tasks.append(TaskSchema(
            id=t.get("id", ""),
            description=t.get("description", ""),
            dependencies=t.get("dependencies", []),
            role=t.get("role"),
            wave=t.get("wave"),
            technical_details=technical_details,
        ))
    return EpicSchema(
        id=epic_model.id,
        goal=epic_model.goal,
        tasks=tasks,
        dependencies=epic_model.dependencies or [],
        success_criteria=epic_model.success_criteria or [],
        status=epic_model.status,
    )


def _get_validation_history(db: Session, epic_id: str) -> list[ValidationHistoryEntry]:
    """Fetch all validation records for an epic, ordered chronologically."""
    records = (
        db.query(ValidationModel)
        .filter(ValidationModel.epic_id == epic_id)
        .order_by(ValidationModel.created_at.asc())
        .all()
    )
    history = []
    for r in records:
        if not r.metrics:
            continue
        history.append(ValidationHistoryEntry(
            attempt_number=r.attempt_number,
            trigger=r.trigger or "manual",
            metrics=ValidationMetrics(**r.metrics),
            average=r.average,
            passed=r.passed,
            low_metrics=r.low_metrics,
            feedback_given=r.feedback_given,
            created_at=r.created_at.isoformat() if r.created_at else None,
        ))
    return history


def _compute_low_metrics(metrics_dict: dict) -> dict:
    """Return metrics that scored below the minimum threshold."""
    return {
        k: v for k, v in metrics_dict.items()
        if v < settings.VALIDATION_MIN_THRESHOLD
    }


def _build_history_feedback(history: list[ValidationHistoryEntry]) -> str:
    """
    Compile the full validation history into structured feedback for the LLM.
    This lets the LLM see every past attempt and what went wrong each time,
    so it can avoid repeating the same mistakes.
    """
    if not history:
        return ""

    lines = [
        f"VALIDATION HISTORY ({len(history)} previous attempt(s)):",
        "The following is a record of all past validation attempts. "
        "Study the patterns of failure carefully and ensure the new plan "
        "addresses ALL recurring weaknesses.\n",
    ]
    for entry in history:
        status = "PASS" if entry.passed else "FAIL"
        lines.append(f"--- Attempt #{entry.attempt_number} [{entry.trigger}] — {status} (avg: {entry.average}) ---")
        if entry.low_metrics:
            lines.append(f"  Weak metrics: {json.dumps(entry.low_metrics)}")
        if entry.feedback_given:
            lines.append(f"  Feedback: {entry.feedback_given}")
        # Show all metric scores for context
        metrics_dict = entry.metrics.model_dump()
        sorted_metrics = sorted(metrics_dict.items(), key=lambda x: x[1])
        bottom_3 = sorted_metrics[:3]
        lines.append(f"  Lowest 3 scores: {', '.join(f'{k}={v}' for k, v in bottom_3)}")
        lines.append("")

    # Add a summary of recurring weak areas
    all_low = {}
    for entry in history:
        if entry.low_metrics:
            for k, v in entry.low_metrics.items():
                all_low.setdefault(k, []).append(v)
    if all_low:
        recurring = {k: round(sum(v)/len(v), 1) for k, v in all_low.items() if len(v) >= 2}
        if recurring:
            lines.append(f"RECURRING WEAK AREAS (failed in 2+ attempts): {json.dumps(recurring)}")
            lines.append("These areas MUST be prioritized in the improved plan.\n")
        once = {k: v[0] for k, v in all_low.items() if len(v) == 1}
        if once:
            lines.append(f"ONE-TIME WEAK AREAS: {json.dumps(once)}")
            lines.append("")

    return "\n".join(lines)


def _store_validation(
    db: Session,
    epic_id: str,
    validation_result: ValidationResult,
    attempt_number: int,
    trigger: str,
    feedback_given: str = None,
) -> ValidationModel:
    """Store a validation record with full context."""
    metrics_dict = validation_result.metrics.model_dump()
    low = _compute_low_metrics(metrics_dict)

    db_validation = ValidationModel(
        epic_id=epic_id,
        attempt_number=attempt_number,
        trigger=trigger,
        metrics=metrics_dict,
        average=validation_result.average,
        passed=validation_result.passed,
        low_metrics=low if low else None,
        feedback_given=feedback_given,
    )
    db.add(db_validation)
    return db_validation


@router.post("/generate-epic", response_model=EpicResponse)
async def generate_epic(req: RequirementInput, db: Session = Depends(get_db)):
    """
    Generate an EPIC from a requirement.
    Automatically validates and replans up to MAX_REPLAN_RETRIES times.
    Each validation attempt is stored with full context for history tracking.
    """
    # Create the epic first so we can track validation history against it
    epic_id = str(uuid.uuid4())
    db_epic = EpicModel(
        id=epic_id,
        goal="",
        tasks=[],
        dependencies=[],
        success_criteria=[],
        status="generating",
    )
    db.add(db_epic)
    db.commit()

    epic_data = None
    validation_result = None
    attempt_count = 0

    for attempt in range(settings.MAX_REPLAN_RETRIES + 1):
        attempt_count = attempt

        # Generate the epic
        if attempt == 0:
            epic_data = await llm_service.generate_epic(req.requirement)
        else:
            # Build feedback from full validation history
            history = _get_validation_history(db, epic_id)
            history_feedback = _build_history_feedback(history)

            enhanced_requirement = (
                f"{req.requirement}\n\n"
                f"{history_feedback}\n"
                f"This is auto-replan attempt {attempt + 1}. "
                f"Please generate an improved plan that addresses ALL the issues above."
            )
            epic_data = await llm_service.generate_epic(enhanced_requirement)

        # Validate the epic
        try:
            validation_response = await llm_service.validate_epic(epic_data)
            validation_result = validator.validate(epic_data, validation_response)
        except Exception as e:
            logger.error(f"Validation failed on attempt {attempt + 1}: {e}")
            continue

        # Build feedback summary for this attempt's record
        metrics_dict = validation_result.metrics.model_dump()
        low = _compute_low_metrics(metrics_dict)
        feedback_summary = None
        if not validation_result.passed:
            parts = [f"Average: {validation_result.average}/100."]
            if low:
                parts.append(f"Low metrics: {json.dumps(low)}")
            else:
                parts.append("All individual scores OK but average below threshold.")
            feedback_summary = " ".join(parts)

        # Store this validation attempt
        _store_validation(
            db, epic_id, validation_result,
            attempt_number=attempt + 1,
            trigger="auto_generate",
            feedback_given=feedback_summary,
        )
        db.commit()

        if validation_result.passed:
            logger.info(f"Epic passed validation on attempt {attempt + 1}")
            break
        else:
            logger.info(
                f"Epic failed validation on attempt {attempt + 1} "
                f"(avg: {validation_result.average})"
            )

    # Update the epic with final data
    db_epic.goal = epic_data.get("goal", "")
    db_epic.tasks = epic_data.get("tasks", [])
    db_epic.dependencies = epic_data.get("dependencies", [])
    db_epic.success_criteria = epic_data.get("success_criteria", [])
    db_epic.status = "draft"
    db.commit()
    db.refresh(db_epic)

    epic_schema = _epic_model_to_schema(db_epic)
    history = _get_validation_history(db, epic_id)

    replan_count = attempt_count if validation_result and validation_result.passed else attempt_count
    return EpicResponse(
        epic=epic_schema,
        validation=validation_result,
        replan_count=replan_count,
        validation_history=history,
    )


@router.post("/validate-epic/{epic_id}", response_model=ValidationResult)
async def validate_epic(epic_id: str, db: Session = Depends(get_db)):
    """Retrieve an epic from DB and validate it using the LLM."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    epic_data = {
        "goal": epic_model.goal,
        "tasks": epic_model.tasks,
        "dependencies": epic_model.dependencies,
        "success_criteria": epic_model.success_criteria,
    }

    validation_response = await llm_service.validate_epic(epic_data)
    validation_result = validator.validate(epic_data, validation_response)

    # Determine attempt number
    existing_count = (
        db.query(ValidationModel)
        .filter(ValidationModel.epic_id == epic_id)
        .count()
    )

    # Build feedback summary
    metrics_dict = validation_result.metrics.model_dump()
    low = _compute_low_metrics(metrics_dict)
    feedback_summary = None
    if not validation_result.passed:
        parts = [f"Average: {validation_result.average}/100."]
        if low:
            parts.append(f"Low metrics: {json.dumps(low)}")
        else:
            parts.append("All individual scores OK but average below threshold.")
        feedback_summary = " ".join(parts)

    _store_validation(
        db, epic_id, validation_result,
        attempt_number=existing_count + 1,
        trigger="manual",
        feedback_given=feedback_summary,
    )
    db.commit()

    return validation_result


@router.post("/replan-epic/{epic_id}", response_model=EpicResponse)
async def replan_epic(epic_id: str, db: Session = Depends(get_db)):
    """
    Manually trigger replanning for an epic.
    Uses the FULL validation history to build comprehensive feedback,
    then regenerates and auto-validates with up to MAX_REPLAN_RETRIES attempts.
    """
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    # Get current attempt count for numbering
    existing_count = (
        db.query(ValidationModel)
        .filter(ValidationModel.epic_id == epic_id)
        .count()
    )

    epic_data = None
    validation_result = None
    replan_count = 0

    for attempt in range(settings.MAX_REPLAN_RETRIES):
        replan_count = attempt + 1
        current_attempt_number = existing_count + replan_count

        # Build feedback from FULL validation history (re-fetch each iteration
        # so it includes the validation we stored in the previous loop iteration)
        history = _get_validation_history(db, epic_id)
        history_feedback = _build_history_feedback(history)

        enhanced_requirement = (
            f"{epic_model.goal}\n\n"
            f"{history_feedback}\n"
            f"This is manual replan attempt {replan_count}. "
            f"Generate an improved plan that corrects ALL issues identified above. "
            f"Pay special attention to any recurring weak areas."
        )

        try:
            epic_data = await llm_service.generate_epic(enhanced_requirement)
        except Exception as e:
            logger.error(f"Replan generation failed on attempt {replan_count}: {e}")
            continue

        # Validate the new plan
        try:
            validation_response = await llm_service.validate_epic(epic_data)
            validation_result = validator.validate(epic_data, validation_response)
        except Exception as e:
            logger.error(f"Replan validation failed on attempt {replan_count}: {e}")
            continue

        # Build feedback summary for this attempt's record
        metrics_dict = validation_result.metrics.model_dump()
        low = _compute_low_metrics(metrics_dict)
        feedback_summary = None
        if not validation_result.passed:
            parts = [f"Average: {validation_result.average}/100."]
            if low:
                parts.append(f"Low metrics: {json.dumps(low)}")
            else:
                parts.append("All individual scores OK but average below threshold.")
            feedback_summary = " ".join(parts)

        # Store this validation attempt
        _store_validation(
            db, epic_id, validation_result,
            attempt_number=current_attempt_number,
            trigger="replan",
            feedback_given=feedback_summary,
        )
        db.commit()

        if validation_result.passed:
            logger.info(f"Replan passed validation on attempt {replan_count}")
            break
        else:
            logger.info(
                f"Replan failed validation on attempt {replan_count} "
                f"(avg: {validation_result.average})"
            )

    # Update epic in DB with the best plan we got
    if epic_data:
        epic_model.tasks = epic_data.get("tasks", epic_model.tasks)
        epic_model.dependencies = epic_data.get("dependencies", epic_model.dependencies)
        epic_model.success_criteria = epic_data.get("success_criteria", epic_model.success_criteria)
        epic_model.goal = epic_data.get("goal", epic_model.goal)
        epic_model.status = "replanned"

    db.commit()
    db.refresh(epic_model)

    epic_schema = _epic_model_to_schema(epic_model)
    history = _get_validation_history(db, epic_id)

    return EpicResponse(
        epic=epic_schema,
        validation=validation_result,
        replan_count=replan_count,
        validation_history=history,
    )


@router.post("/approve-epic/{epic_id}", response_model=EpicResponse)
async def approve_epic(
    epic_id: str, feedback: HumanFeedback, db: Session = Depends(get_db)
):
    """Approve or reject an epic with optional human feedback."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    if feedback.approved:
        epic_model.status = "approved"
        db.commit()
        db.refresh(epic_model)
        epic_schema = _epic_model_to_schema(epic_model)
        return EpicResponse(epic=epic_schema, validation=None)
    else:
        # Rejected: optionally trigger replan with feedback
        if feedback.feedback:
            enhanced_requirement = (
                f"{epic_model.goal}\n\n"
                f"HUMAN FEEDBACK: {feedback.feedback}\n"
                f"Please regenerate the plan addressing the above feedback."
            )
            new_epic_data = await llm_service.generate_epic(enhanced_requirement)

            # Update the epic with new plan
            epic_model.tasks = new_epic_data.get("tasks", [])
            epic_model.dependencies = new_epic_data.get("dependencies", [])
            epic_model.success_criteria = new_epic_data.get("success_criteria", [])
            epic_model.goal = new_epic_data.get("goal", epic_model.goal)
            epic_model.status = "replanned"
        else:
            epic_model.status = "rejected"

        db.commit()
        db.refresh(epic_model)

        # Run validation on updated plan
        validation_result = None
        if feedback.feedback:
            try:
                epic_data = {
                    "goal": epic_model.goal,
                    "tasks": epic_model.tasks,
                    "dependencies": epic_model.dependencies,
                    "success_criteria": epic_model.success_criteria,
                }
                validation_response = await llm_service.validate_epic(epic_data)
                validation_result = validator.validate(epic_data, validation_response)

                existing_count = (
                    db.query(ValidationModel)
                    .filter(ValidationModel.epic_id == epic_id)
                    .count()
                )
                metrics_dict = validation_result.metrics.model_dump()
                low = _compute_low_metrics(metrics_dict)
                feedback_summary = None
                if not validation_result.passed:
                    parts = [f"Average: {validation_result.average}/100."]
                    if low:
                        parts.append(f"Low metrics: {json.dumps(low)}")
                    feedback_summary = " ".join(parts)

                _store_validation(
                    db, epic_id, validation_result,
                    attempt_number=existing_count + 1,
                    trigger="replan",
                    feedback_given=feedback_summary,
                )
                db.commit()
            except Exception as e:
                logger.error(f"Validation after replan failed: {e}")

        epic_schema = _epic_model_to_schema(epic_model)
        history = _get_validation_history(db, epic_id)
        return EpicResponse(epic=epic_schema, validation=validation_result, validation_history=history)


@router.post("/enrich-tasks/{epic_id}", response_model=EpicResponse)
async def enrich_tasks(epic_id: str, db: Session = Depends(get_db)):
    """
    Generate brief technical requirements per task using the LLM.
    Adds tech_stack, approach, inputs, outputs, and estimated_hours to each task.
    """
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    tasks = epic_model.tasks or []
    if not tasks:
        raise HTTPException(status_code=400, detail="Epic has no tasks")

    enrichments = await llm_service.enrich_tasks(epic_model.goal, tasks)

    # Build lookup from task_id -> enrichment
    enrichment_map = {}
    if isinstance(enrichments, list):
        for e in enrichments:
            if isinstance(e, dict):
                tid = e.get("task_id", "")
                if tid:
                    enrichment_map[tid] = e

    # Update tasks with technical details
    updated_tasks = []
    for task in tasks:
        task_copy = dict(task)
        tid = task_copy.get("id", "")
        if tid in enrichment_map:
            e = enrichment_map[tid]
            task_copy["technical_details"] = {
                "tech_stack": e.get("tech_stack", []),
                "approach": e.get("approach", ""),
                "inputs": e.get("inputs", []),
                "outputs": e.get("outputs", []),
                "estimated_hours": e.get("estimated_hours"),
            }
        updated_tasks.append(task_copy)

    epic_model.tasks = updated_tasks
    epic_model.status = "enriched"
    db.commit()
    db.refresh(epic_model)

    epic_schema = _epic_model_to_schema(epic_model)
    history = _get_validation_history(db, epic_id)
    return EpicResponse(epic=epic_schema, validation=None, validation_history=history)


@router.post("/assign-tasks/{epic_id}", response_model=list[TaskAssignment])
async def assign_tasks(epic_id: str, db: Session = Depends(get_db)):
    """Assign roles to each task in an epic using the LLM."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    tasks = epic_model.tasks or []
    if not tasks:
        raise HTTPException(status_code=400, detail="Epic has no tasks")

    assignments = await llm_service.assign_tasks(tasks)

    # Build a lookup from task_id -> role
    assignment_map = {}
    for assignment in assignments:
        task_id = assignment.get("task_id", "")
        role = assignment.get("role", "")
        assignment_map[task_id] = role

    # Update tasks with assigned roles
    updated_tasks = []
    for task in tasks:
        task_copy = dict(task)
        if task_copy.get("id") in assignment_map:
            task_copy["role"] = assignment_map[task_copy["id"]]
        updated_tasks.append(task_copy)

    epic_model.tasks = updated_tasks
    db.commit()

    return [
        TaskAssignment(task_id=a.get("task_id", ""), role=a.get("role", ""))
        for a in assignments
    ]


@router.post("/compute-waves/{epic_id}", response_model=WaveResult)
async def compute_waves(epic_id: str, db: Session = Depends(get_db)):
    """Compute execution waves for an epic's tasks."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    tasks = epic_model.tasks or []
    dependencies = epic_model.dependencies or []

    if not tasks:
        raise HTTPException(status_code=400, detail="Epic has no tasks")

    try:
        waves = wave_engine.compute_waves(tasks, dependencies)
    except (ValueError, TypeError, KeyError) as e:
        logger.error(f"Wave computation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    # Update tasks with wave numbers
    task_wave_map = {}
    for wave_idx, wave_tasks in enumerate(waves):
        for task_id in wave_tasks:
            task_wave_map[task_id] = wave_idx + 1  # 1-indexed waves

    updated_tasks = []
    for task in tasks:
        task_copy = dict(task)
        if task_copy.get("id") in task_wave_map:
            task_copy["wave"] = task_wave_map[task_copy["id"]]
        updated_tasks.append(task_copy)

    epic_model.tasks = updated_tasks
    db.commit()

    return WaveResult(waves=waves, total_waves=len(waves))


@router.get("/epic/{epic_id}", response_model=EpicResponse)
async def get_epic(epic_id: str, db: Session = Depends(get_db)):
    """Return full epic with tasks, roles, waves, and validation history."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    epic_schema = _epic_model_to_schema(epic_model)

    # Get latest validation if any
    latest_validation = (
        db.query(ValidationModel)
        .filter(ValidationModel.epic_id == epic_id)
        .order_by(ValidationModel.created_at.desc())
        .first()
    )

    validation_result = None
    if latest_validation and latest_validation.metrics:
        validation_result = ValidationResult(
            metrics=ValidationMetrics(**latest_validation.metrics),
            average=latest_validation.average,
            passed=latest_validation.passed,
        )

    history = _get_validation_history(db, epic_id)

    return EpicResponse(
        epic=epic_schema,
        validation=validation_result,
        validation_history=history,
    )


@router.get("/epic/{epic_id}/validation-history", response_model=list[ValidationHistoryEntry])
async def get_validation_history(epic_id: str, db: Session = Depends(get_db)):
    """Return the full validation history for an epic."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")
    return _get_validation_history(db, epic_id)


@router.get("/epic/{epic_id}/dag")
async def get_epic_dag(epic_id: str, db: Session = Depends(get_db)):
    """Return adjacency list for DAG visualization."""
    epic_model = db.query(EpicModel).filter(EpicModel.id == epic_id).first()
    if not epic_model:
        raise HTTPException(status_code=404, detail="Epic not found")

    tasks = epic_model.tasks or []
    dependencies = epic_model.dependencies or []

    if not tasks:
        raise HTTPException(status_code=400, detail="Epic has no tasks")

    try:
        graph = dag_builder.build_dag(tasks, dependencies)
        adjacency = dag_builder.get_adjacency_list(graph)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"adjacency_list": adjacency, "nodes": [t.get("id", "") for t in tasks]}
