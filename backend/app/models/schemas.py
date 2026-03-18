from typing import Optional
from pydantic import BaseModel


class RequirementInput(BaseModel):
    requirement: str


class TechnicalDetail(BaseModel):
    tech_stack: list[str] = []
    approach: str = ""
    inputs: list[str] = []
    outputs: list[str] = []
    estimated_hours: Optional[float] = None


class TaskSchema(BaseModel):
    id: str
    description: str
    dependencies: list[str] = []
    role: Optional[str] = None
    wave: Optional[int] = None
    technical_details: Optional[TechnicalDetail] = None


class EpicSchema(BaseModel):
    id: str
    goal: str
    tasks: list[TaskSchema]
    dependencies: list[list[str]]
    success_criteria: list[str]
    status: str = "draft"


class ValidationMetrics(BaseModel):
    vision_clarity: int
    architecture_quality: int
    task_decomposition: int
    dependency_graph: int
    coverage_completeness: int
    phase_ordering: int
    scope_coherence: int
    success_criteria_quality: int
    risk_identification: int
    integration_strategy: int


class ValidationResult(BaseModel):
    metrics: ValidationMetrics
    average: float
    passed: bool


class ValidationHistoryEntry(BaseModel):
    attempt_number: int
    trigger: str  # "auto_generate", "manual", "replan"
    metrics: ValidationMetrics
    average: float
    passed: bool
    low_metrics: Optional[dict] = None
    feedback_given: Optional[str] = None
    created_at: Optional[str] = None


class TaskAssignment(BaseModel):
    task_id: str
    role: str


class WaveResult(BaseModel):
    waves: list[list[str]]
    total_waves: int


class EpicResponse(BaseModel):
    epic: EpicSchema
    validation: Optional[ValidationResult] = None
    replan_count: int = 0
    validation_history: list[ValidationHistoryEntry] = []


class HumanFeedback(BaseModel):
    approved: bool
    feedback: Optional[str] = None
