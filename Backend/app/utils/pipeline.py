import time

from app.ingestion.csv_parser import parse_csv
from app.storage.account_profile import build_account_profiles
from app.storage.temporal_index import TemporalIndex
from app.graph.adjacency import Graph

from app.detection.smurfing import detect_smurfing
from app.detection.shell_detector import detect_shell_networks
from app.detection.cycle_detector import detect_cycles

from app.scoring.ring_builder import build_fraud_rings
from app.output.json_builder import build_json_output


def run_pipeline(csv_path: str):
    start = time.time()

    # -----------------------------------
    # 1. Parse transactions
    # -----------------------------------
    transactions = parse_csv(csv_path)

    # -----------------------------------
    # 2. Build account profiles
    # -----------------------------------
    account_db = build_account_profiles(transactions)

    # -----------------------------------
    # 3. Build temporal index
    # -----------------------------------
    temporal_index = TemporalIndex()
    temporal_index.build(transactions)

    # -----------------------------------
    # 4. Build transaction graph
    # -----------------------------------
    graph = Graph()
    graph.build(transactions)

    # -----------------------------------
    # 5. Pattern detection
    # -----------------------------------
    smurfing_hits = detect_smurfing(account_db, temporal_index)
    shell_paths = detect_shell_networks(graph, account_db)
    cycles = detect_cycles(graph, temporal_index, account_db)

    # -----------------------------------
    # 6. Build fraud rings (GRAPH REQUIRED)
    # -----------------------------------
    rings, account_to_ring = build_fraud_rings(
        cycles=cycles,
        shell_paths=shell_paths,
        smurfing_hits=smurfing_hits,
        graph=graph,
    )

    # -----------------------------------
    # 7. Final JSON output
    # (NO smurfing_hits passed here)
    # -----------------------------------
    output = build_json_output(
        rings=rings,
        account_to_ring=account_to_ring,
        account_db=account_db,
        processing_time=round(time.time() - start, 2),
    )

    return output
