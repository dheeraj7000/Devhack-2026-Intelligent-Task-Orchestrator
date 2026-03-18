import networkx as nx

from app.services.dag_builder import DAGBuilder


class WaveEngine:
    def __init__(self):
        self.dag_builder = DAGBuilder()

    def compute_waves(self, tasks: list, dependencies: list) -> list[list[str]]:
        """
        Use topological sort to group tasks into execution waves.

        A wave contains tasks whose dependencies have ALL been completed
        in previous waves. Uses networkx topological_generations.

        Args:
            tasks: List of task dicts with at least an 'id' field.
            dependencies: List of [from_task_id, to_task_id] pairs.

        Returns:
            List of waves, where each wave is a list of task_ids.
        """
        graph = self.dag_builder.build_dag(tasks, dependencies)

        waves = []
        for generation in nx.topological_generations(graph):
            waves.append(sorted(list(generation)))

        return waves
