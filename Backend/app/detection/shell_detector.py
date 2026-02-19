from collections import deque


# -------------------------------
# Shell candidate definition
# -------------------------------
def is_shell_candidate(profile):
    return (
        profile.total_txns <= 4          # relaxed for recall
        and profile.active_days <= 3
        and profile.unique_counterparties <= 2
    )


# -------------------------------
# Shell network detection
# -------------------------------
MAX_DEPTH = 4  # SRC -> S1 -> S2 -> DEST


def detect_shell_networks(graph, account_db):
    """
    Detect layered shell networks using bounded BFS.
    Returns:
        List of shell paths (each path is a list of account_ids)
    """
    shell_paths = []
    visited_paths = set()

    for profile in account_db.all_accounts():
        start = profile.account_id

        queue = deque()
        queue.append((start, [start]))

        while queue:
            current, path = queue.popleft()

            if len(path) > MAX_DEPTH:
                continue

            for neighbor, _, _ in graph.out_edges.get(current, []):
                if neighbor in path:
                    continue  # avoid cycles

                new_path = path + [neighbor]

                # Intermediates only (exclude src and dest)
                intermediates = new_path[1:-1]

                # Require at least TWO shell intermediates
                if len(intermediates) >= 2:
                    if all(
                        is_shell_candidate(account_db.get_or_create(acc))
                        for acc in intermediates
                    ):
                        path_key = tuple(new_path)
                        if path_key not in visited_paths:
                            visited_paths.add(path_key)
                            shell_paths.append(new_path)

                queue.append((neighbor, new_path))

    return shell_paths
