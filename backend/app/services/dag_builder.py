import logging

import networkx as nx

logger = logging.getLogger(__name__)


class DAGBuilder:
    def build_dag(self, tasks: list, dependencies: list) -> nx.DiGraph:
        """
        Create a directed graph from tasks and dependencies.
        Validates that no cycles exist.

        Handles two dependency sources:
        1. Epic-level dependencies: list of [from_id, to_id] pairs
        2. Per-task dependencies: each task dict may have a 'dependencies' list
           of task IDs it depends on

        Args:
            tasks: List of task dicts with at least an 'id' field.
            dependencies: List of [from_task_id, to_task_id] pairs.

        Returns:
            A networkx DiGraph.

        Raises:
            ValueError: If the resulting graph contains a cycle.
        """
        graph = nx.DiGraph()

        # Collect all valid task IDs
        task_ids = set()
        for task in tasks:
            task_id = task.get("id", "") if isinstance(task, dict) else getattr(task, "id", "")
            if task_id:
                task_ids.add(task_id)
                graph.add_node(task_id)

        # Source 1: Epic-level dependency pairs [from, to]
        if isinstance(dependencies, list):
            for dep in dependencies:
                if isinstance(dep, (list, tuple)) and len(dep) >= 2:
                    from_id, to_id = str(dep[0]), str(dep[1])
                    if from_id in task_ids and to_id in task_ids:
                        graph.add_edge(from_id, to_id)
                elif isinstance(dep, dict):
                    # Handle {"from": "task-1", "to": "task-2"} format
                    from_id = str(dep.get("from", dep.get("source", "")))
                    to_id = str(dep.get("to", dep.get("target", "")))
                    if from_id in task_ids and to_id in task_ids:
                        graph.add_edge(from_id, to_id)

        # Source 2: Per-task dependencies (task.dependencies = ["task-1", ...])
        # These mean "this task depends on task-1", so edge is task-1 -> this_task
        for task in tasks:
            if not isinstance(task, dict):
                continue
            task_id = task.get("id", "")
            task_deps = task.get("dependencies", [])
            if not task_id or not isinstance(task_deps, list):
                continue
            for dep_id in task_deps:
                dep_id = str(dep_id)
                if dep_id in task_ids and dep_id != task_id:
                    # dep_id -> task_id (task_id depends on dep_id)
                    graph.add_edge(dep_id, task_id)

        # Validate no cycles
        if not nx.is_directed_acyclic_graph(graph):
            cycles = list(nx.simple_cycles(graph))
            raise ValueError(
                f"Dependency graph contains cycles: {cycles}. "
                "Dependencies must form a valid DAG."
            )

        logger.info(
            f"Built DAG with {graph.number_of_nodes()} nodes "
            f"and {graph.number_of_edges()} edges"
        )

        return graph

    def validate_dag(self, graph: nx.DiGraph) -> bool:
        """Check if the graph is a valid DAG."""
        return nx.is_directed_acyclic_graph(graph)

    def get_adjacency_list(self, graph: nx.DiGraph) -> dict:
        """
        Return adjacency list representation for frontend visualization.

        Returns:
            Dict mapping each node to its list of successors.
        """
        adjacency = {}
        for node in graph.nodes():
            adjacency[node] = list(graph.successors(node))
        return adjacency
