import json
import re
import logging

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

MAX_RETRIES = 2


def _extract_json(text: str):
    """Extract JSON from LLM response text, handling markdown code blocks
    and multiple JSON objects returned without a wrapping array."""
    # Try to find JSON in ```json ... ``` blocks
    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return _parse_json_safe(match.group(1))

    # Try to find JSON in ``` ... ``` blocks
    match = re.search(r"```\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return _parse_json_safe(match.group(1))

    # Try to find JSON array directly
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Try to find a single JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Last resort: try parsing the whole text
    return _parse_json_safe(text)


def _parse_json_safe(text: str):
    """Try to parse JSON. If it fails due to multiple JSON objects,
    collect them into an array."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Handle multiple JSON objects separated by newlines/commas
    # (LLMs sometimes return {obj1}\n{obj2}\n{obj3} instead of [{obj1},{obj2},{obj3}])
    objects = []
    decoder = json.JSONDecoder()
    idx = 0
    while idx < len(text):
        # Skip whitespace and commas between objects
        while idx < len(text) and text[idx] in ' \t\n\r,':
            idx += 1
        if idx >= len(text):
            break
        try:
            obj, end_idx = decoder.raw_decode(text, idx)
            objects.append(obj)
            idx = end_idx
        except json.JSONDecodeError:
            idx += 1

    if objects:
        # If we got a single object, return it directly
        if len(objects) == 1:
            return objects[0]
        return objects

    raise json.JSONDecodeError("No valid JSON found", text, 0)


class LLMService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.NVIDIA_NIM_API_KEY,
            base_url=settings.NVIDIA_NIM_BASE_URL,
        )
        self.model = settings.NVIDIA_NIM_MODEL

    async def generate_epic(self, requirement: str) -> dict:
        """Generate an EPIC plan from a requirement using the LLM."""
        system_prompt = (
            "You are an expert software architect. Given a project requirement, "
            "generate a detailed EPIC plan as a JSON object.\n\n"
            "The JSON must have this exact structure:\n"
            "{\n"
            '  "goal": "High-level goal description",\n'
            '  "tasks": [\n'
            "    {\n"
            '      "id": "task-1",\n'
            '      "description": "Atomic task description (1-4 hours of work)",\n'
            '      "dependencies": []\n'
            "    },\n"
            "    {\n"
            '      "id": "task-2",\n'
            '      "description": "Another atomic task",\n'
            '      "dependencies": ["task-1"]\n'
            "    }\n"
            "  ],\n"
            '  "dependencies": [["task-1", "task-2"]],\n'
            '  "success_criteria": [\n'
            '    "Criterion 1",\n'
            '    "Criterion 2"\n'
            "  ]\n"
            "}\n\n"
            "Rules:\n"
            "- Each task must be atomic and completable in 1-4 hours\n"
            "- Dependencies must form a valid DAG (no cycles)\n"
            "- The dependencies field is a list of [from, to] pairs\n"
            "- Task IDs should be like task-1, task-2, etc.\n"
            "- Include 5-15 tasks depending on complexity\n"
            "- Success criteria should be measurable\n"
            "- Respond ONLY with the JSON, no extra text"
        )

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Requirement: {requirement}"},
                    ],
                    temperature=0.7,
                    max_tokens=4096,
                )
                content = response.choices[0].message.content
                return _extract_json(content)
            except Exception as e:
                logger.error(f"generate_epic attempt {attempt + 1} failed: {e}")
                if attempt == MAX_RETRIES:
                    raise RuntimeError(
                        f"Failed to generate epic after {MAX_RETRIES + 1} attempts: {e}"
                    )

    async def validate_epic(self, epic: dict) -> dict:
        """Validate an EPIC plan using the LLM, scoring it on 10 metrics."""
        system_prompt = (
            "You are an expert software project evaluator. Evaluate the given EPIC plan "
            "and score it on 10 metrics, each from 0 to 100.\n\n"
            "Return a JSON object with this exact structure:\n"
            "{\n"
            '  "vision_clarity": <0-100>,\n'
            '  "architecture_quality": <0-100>,\n'
            '  "task_decomposition": <0-100>,\n'
            '  "dependency_graph": <0-100>,\n'
            '  "coverage_completeness": <0-100>,\n'
            '  "phase_ordering": <0-100>,\n'
            '  "scope_coherence": <0-100>,\n'
            '  "success_criteria_quality": <0-100>,\n'
            '  "risk_identification": <0-100>,\n'
            '  "integration_strategy": <0-100>\n'
            "}\n\n"
            "Scoring guidelines:\n"
            "- vision_clarity: How clear and well-defined is the goal?\n"
            "- architecture_quality: Is the implied architecture sound?\n"
            "- task_decomposition: Are tasks properly atomic (1-4h each)?\n"
            "- dependency_graph: Are dependencies logical and complete?\n"
            "- coverage_completeness: Does the plan cover all aspects?\n"
            "- phase_ordering: Is the execution order logical?\n"
            "- scope_coherence: Is the scope well-defined and consistent?\n"
            "- success_criteria_quality: Are success criteria measurable?\n"
            "- risk_identification: Are risks implicitly addressed?\n"
            "- integration_strategy: Is there a clear integration approach?\n\n"
            "Respond ONLY with the JSON, no extra text."
        )

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": f"EPIC Plan:\n{json.dumps(epic, indent=2)}",
                        },
                    ],
                    temperature=0.3,
                    max_tokens=1024,
                )
                content = response.choices[0].message.content
                return _extract_json(content)
            except Exception as e:
                logger.error(f"validate_epic attempt {attempt + 1} failed: {e}")
                if attempt == MAX_RETRIES:
                    raise RuntimeError(
                        f"Failed to validate epic after {MAX_RETRIES + 1} attempts: {e}"
                    )

    async def enrich_tasks(self, goal: str, tasks: list) -> list:
        """Generate brief technical requirements per task with implementation details."""
        system_prompt = (
            "You are a senior software architect. For each task in the EPIC, generate "
            "brief technical requirements and implementation details.\n\n"
            "Return a JSON array with this exact structure:\n"
            "[\n"
            "  {\n"
            '    "task_id": "task-1",\n'
            '    "tech_stack": ["Python", "FastAPI", "PostgreSQL"],\n'
            '    "approach": "Brief 1-2 sentence implementation approach",\n'
            '    "inputs": ["What this task needs from other tasks or external sources"],\n'
            '    "outputs": ["What this task produces for downstream tasks"],\n'
            '    "estimated_hours": 3\n'
            "  }\n"
            "]\n\n"
            "Guidelines:\n"
            "- tech_stack: specific technologies, libraries, or frameworks needed\n"
            "- approach: concise implementation strategy (1-2 sentences max)\n"
            "- inputs: data, APIs, or artifacts this task consumes\n"
            "- outputs: deliverables, APIs, artifacts, or data this task produces\n"
            "- estimated_hours: realistic estimate between 1-4 hours\n"
            "- Focus on details that help determine parallelism and dependencies\n"
            "- Respond ONLY with the JSON array, no extra text"
        )

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": (
                                f"Project Goal: {goal}\n\n"
                                f"Tasks:\n{json.dumps(tasks, indent=2)}"
                            ),
                        },
                    ],
                    temperature=0.3,
                    max_tokens=4096,
                )
                content = response.choices[0].message.content
                result = _extract_json(content)
                if isinstance(result, dict) and "tasks" in result:
                    return result["tasks"]
                if isinstance(result, dict) and "enrichments" in result:
                    return result["enrichments"]
                return result
            except Exception as e:
                logger.error(f"enrich_tasks attempt {attempt + 1} failed: {e}")
                if attempt == MAX_RETRIES:
                    raise RuntimeError(
                        f"Failed to enrich tasks after {MAX_RETRIES + 1} attempts: {e}"
                    )

    async def assign_tasks(self, tasks: list) -> list:
        """Assign roles to tasks using the LLM."""
        system_prompt = (
            "You are an expert engineering manager. Assign each task to the most "
            "appropriate role.\n\n"
            "Available roles:\n"
            "- UI/UX Engineer\n"
            "- Frontend Engineer\n"
            "- Backend Engineer\n"
            "- Data Engineer\n"
            "- DevOps Engineer\n"
            "- ML Engineer\n"
            "- Test Engineer\n\n"
            "Return a JSON array with this structure:\n"
            "[\n"
            "  {\n"
            '    "task_id": "task-1",\n'
            '    "role": "Backend Engineer"\n'
            "  }\n"
            "]\n\n"
            "Assign exactly one role per task. "
            "Respond ONLY with the JSON array, no extra text."
        )

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": f"Tasks:\n{json.dumps(tasks, indent=2)}",
                        },
                    ],
                    temperature=0.3,
                    max_tokens=2048,
                )
                content = response.choices[0].message.content
                result = _extract_json(content)
                if isinstance(result, dict) and "assignments" in result:
                    return result["assignments"]
                return result
            except Exception as e:
                logger.error(f"assign_tasks attempt {attempt + 1} failed: {e}")
                if attempt == MAX_RETRIES:
                    raise RuntimeError(
                        f"Failed to assign tasks after {MAX_RETRIES + 1} attempts: {e}"
                    )
