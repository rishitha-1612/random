def compute_account_risk(patterns, ring_risk):
    score = 0

    if any(p.startswith("cycle") for p in patterns):
        score += 40
    if "shell_layering" in patterns:
        score += 30
    if "fan_in" in patterns or "fan_out" in patterns:
        score += 20

    score += int(0.6 * ring_risk)
    return min(score, 100)
