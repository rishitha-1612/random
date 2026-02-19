from typing import Any, Dict, List


def build_json_output(
    rings: List[Any],
    account_to_ring: Dict[str, Any],
    smurfing_hits: List[Any],
    cycles: List[Any],
    shell_paths: List[Any],
    total_accounts: int,
    processing_time: float
) -> Dict[str, Any]:
    """
    Build a stable JSON response for FastAPI / React.

    This function is intentionally explicit and defensive so
    future pipeline changes do NOT cause runtime errors.
    """

    return {
        "summary": {
            "total_accounts": total_accounts,
            "total_rings": len(rings),
            "processing_time_seconds": round(processing_time, 3),
            "smurfing_hits_count": len(smurfing_hits),
            "cycle_count": len(cycles),
            "shell_network_count": len(shell_paths),
        },
        "rings": rings,
        "account_to_ring": account_to_ring,
        "detections": {
            "smurfing_hits": smurfing_hits,
            "cycles": cycles,
            "shell_paths": shell_paths,
        }
    }
