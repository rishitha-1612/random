def compute_risk_score(patterns, cycle_len=None, profile=None):
    risk = 0.0

    if "cycle" in patterns:
        if cycle_len == 3:
            risk += 55
        elif cycle_len == 4:
            risk += 70
        elif cycle_len == 5:
            risk += 85

    if "shell_layering" in patterns:
        risk += 30

    if "fan_in" in patterns or "fan_out" in patterns:
        risk += 25

    # Benign suppression
    if profile:
        if profile.active_days > 30:
            risk -= 10
        if profile.unique_counterparties > 20:
            risk -= 10

    return max(min(round(risk, 1), 95.0), 0.0)
