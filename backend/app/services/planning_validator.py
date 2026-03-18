from app.config import settings
from app.models.schemas import ValidationMetrics, ValidationResult


class PlanningValidator:
    def validate(self, epic: dict, validation_response: dict) -> ValidationResult:
        """
        Take the raw LLM validation response, extract metrics,
        compute the average, and determine pass/fail.
        """
        metrics = ValidationMetrics(
            vision_clarity=int(validation_response.get("vision_clarity", 0)),
            architecture_quality=int(validation_response.get("architecture_quality", 0)),
            task_decomposition=int(validation_response.get("task_decomposition", 0)),
            dependency_graph=int(validation_response.get("dependency_graph", 0)),
            coverage_completeness=int(validation_response.get("coverage_completeness", 0)),
            phase_ordering=int(validation_response.get("phase_ordering", 0)),
            scope_coherence=int(validation_response.get("scope_coherence", 0)),
            success_criteria_quality=int(validation_response.get("success_criteria_quality", 0)),
            risk_identification=int(validation_response.get("risk_identification", 0)),
            integration_strategy=int(validation_response.get("integration_strategy", 0)),
        )

        scores = [
            metrics.vision_clarity,
            metrics.architecture_quality,
            metrics.task_decomposition,
            metrics.dependency_graph,
            metrics.coverage_completeness,
            metrics.phase_ordering,
            metrics.scope_coherence,
            metrics.success_criteria_quality,
            metrics.risk_identification,
            metrics.integration_strategy,
        ]

        average = sum(scores) / len(scores)

        all_above_min = all(s >= settings.VALIDATION_MIN_THRESHOLD for s in scores)
        passed = average >= settings.VALIDATION_AVG_THRESHOLD and all_above_min

        return ValidationResult(
            metrics=metrics,
            average=round(average, 2),
            passed=passed,
        )
