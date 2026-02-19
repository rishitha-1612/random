from collections import defaultdict
from app.scoring.risk_model import compute_risk_score


def build_fraud_rings(cycles, shell_paths, smurfing_hits, graph):
    rings = {}
    account_to_ring = {}
    ring_counter = 1

    def new_ring_id():
        nonlocal ring_counter
        rid = f"RING_{ring_counter:03d}"
        ring_counter += 1
        return rid

    # -------------------------
    # 1️⃣ Merge cycle rings
    # -------------------------
    merged_cycles = []

    for cycle in cycles:
        merged = False
        for group in merged_cycles:
            if set(cycle) & set(group):
                group.update(cycle)
                merged = True
                break
        if not merged:
            merged_cycles.append(set(cycle))

    for group in merged_cycles:
        ring_id = new_ring_id()
        rings[ring_id] = {
            "pattern_type": "cycle",
            "members": list(group),
        }
        for acc in group:
            account_to_ring[acc] = ring_id

    # -------------------------
    # 2️⃣ Shell layering rings
    # -------------------------
    shell_members = set()
    for path in shell_paths:
        for acc in path[1:-1]:
            if acc not in account_to_ring:
                shell_members.add(acc)

    if shell_members:
        ring_id = new_ring_id()
        rings[ring_id] = {
            "pattern_type": "shell_layering",
            "members": list(shell_members),
        }
        for acc in shell_members:
            account_to_ring[acc] = ring_id

    # -------------------------
    # 3️⃣ Smurfing (single-node)
    # -------------------------
    for acc, pattern in smurfing_hits.items():
        if acc in account_to_ring:
            continue

        ring_id = new_ring_id()
        rings[ring_id] = {
            "pattern_type": pattern,
            "members": [acc],
        }
        account_to_ring[acc] = ring_id

    return rings, account_to_ring
