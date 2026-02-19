from typing import List, Set


# ==================================================
# Hard constraints (Evaluator-mandated)
# ==================================================
MIN_DEPTH = 3
MAX_DEPTH = 5

# timestamps are numeric (seconds)
MAX_TIME_WINDOW_SECONDS = 120 * 3600  # 120 hours

# prune high-fanout hubs
MAX_NODE_DEGREE = 15

# absolute safety valve per DFS start
MAX_EXPANSIONS = 200


# ==================================================
# Public API
# ==================================================
def detect_cycles(graph, temporal_index, account_db) -> List[List[str]]:
    """
    Detect money-muling cycles of length 3–5 using
    bounded, temporal, degree-pruned DFS.

    Returns:
        List of cycles (each cycle is a list of account_ids)
    """

    cycles: List[List[str]] = []
    visited_cycles: Set[tuple] = set()

    # --------------------------------------------------
    # Eligible nodes (noise & merchant pruning)
    # --------------------------------------------------
    eligible_nodes = {
        acc for acc, prof in account_db.store.items()
        if prof.total_txns <= 50
        and prof.unique_counterparties <= 20
        and len(graph.out_edges.get(acc, [])) > 0
        and len(graph.in_edges.get(acc, [])) > 0
    }

    # --------------------------------------------------
    # Bounded DFS from each eligible start
    # --------------------------------------------------
    for start in eligible_nodes:
        expansion_counter = [0]  # mutable counter

        _dfs(
            graph=graph,
            start=start,
            current=start,
            path=[start],
            visited={start},
            start_time=None,
            cycles=cycles,
            visited_cycles=visited_cycles,
            eligible_nodes=eligible_nodes,
            expansion_counter=expansion_counter,
        )

    return cycles


# ==================================================
# Internal DFS (STRICTLY bounded)
# ==================================================
def _dfs(
    graph,
    start: str,
    current: str,
    path: List[str],
    visited: Set[str],
    start_time,
    cycles: List[List[str]],
    visited_cycles: Set[tuple],
    eligible_nodes: Set[str],
    expansion_counter,
):
    depth = len(path)

    # -----------------------------
    # Hard stop conditions
    # -----------------------------
    if depth > MAX_DEPTH:
        return

    if expansion_counter[0] >= MAX_EXPANSIONS:
        return

    if len(graph.out_edges.get(current, [])) > MAX_NODE_DEGREE:
        return

    # -----------------------------
    # Explore outgoing edges
    # -----------------------------
    for neighbor, ts, _ in graph.out_edges.get(current, []):

        # Node eligibility
        if neighbor not in eligible_nodes:
            continue

        # -------------------------
        # Temporal constraints
        # -------------------------
        if start_time is None:
            new_start_time = ts
        else:
            # enforce forward-only time
            if ts < start_time:
                continue

            # enforce window
            if ts - start_time > MAX_TIME_WINDOW_SECONDS:
                continue

            new_start_time = start_time

        # -------------------------
        # Cycle detection
        # -------------------------
        if neighbor == start and depth >= MIN_DEPTH:
            canonical = tuple(sorted(path))
            if canonical not in visited_cycles:
                visited_cycles.add(canonical)
                cycles.append(list(path))
            continue

        # -------------------------
        # DFS continuation
        # -------------------------
        if neighbor in visited:
            continue

        expansion_counter[0] += 1
        visited.add(neighbor)

        _dfs(
            graph=graph,
            start=start,
            current=neighbor,
            path=path + [neighbor],
            visited=visited,
            start_time=new_start_time,
            cycles=cycles,
            visited_cycles=visited_cycles,
            eligible_nodes=eligible_nodes,
            expansion_counter=expansion_counter,
        )

        visited.remove(neighbor)
