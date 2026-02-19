import time

from app.ingestion.csv_parser import parse_csv
from app.storage.account_profile import build_account_profiles
from app.storage.temporal_index import TemporalIndex
from app.graph.adjacency import Graph
from app.detection.smurfing import detect_smurfing
from app.detection.cycle_detector import detect_cycles
from app.detection.shell_detector import detect_shell_networks
from app.scoring.ring_builder import build_fraud_rings
from app.output.json_builder import build_json_output


def run_analysis(csv_path: str):
    start = time.time()

    # -----------------------------
    # Load & preprocess transactions
    # -----------------------------
    txns = parse_csv(csv_path)
    account_db = build_account_profiles(txns)

    # -----------------------------
    # Build temporal index
    # -----------------------------
    temporal_index = TemporalIndex()
    temporal_index.build(txns)

    # -----------------------------
    # Build transaction graph
    # -----------------------------
    graph = Graph()
    graph.build(txns)

    # -----------------------------
    # Run detection algorithms
    # -----------------------------
    smurfing_hits = detect_smurfing(account_db, temporal_index)
    cycles = detect_cycles(graph, temporal_index, account_db)
    shell_paths = detect_shell_networks(graph, account_db)

    # -----------------------------
    # Build fraud rings
    # -----------------------------
    rings, account_to_ring = build_fraud_rings(
        cycles,
        shell_paths,
        smurfing_hits,
        graph
    )

    # -----------------------------
    # Build JSON output (FIXED)
    # -----------------------------
    return build_json_output(
        rings=rings,
        account_to_ring=account_to_ring,
        smurfing_hits=smurfing_hits,   # ✅ REQUIRED
        cycles=cycles,
        shell_paths=shell_paths,
        total_accounts=len(account_db.store),
        processing_time=time.time() - start
    )
