import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ingestion.csv_parser import parse_csv
from app.storage.account_profile import build_account_profiles
from app.storage.temporal_index import TemporalIndex
from app.graph.adjacency import Graph
from app.detection.smurfing import detect_smurfing
from app.detection.cycle_detector import detect_cycles
from app.detection.shell_detector import detect_shell_networks
from app.scoring.ring_builder import build_fraud_rings
from app.output.json_builder import build_json_output

from app.api.upload import router as upload_router
from app.api.analysis import router as analysis_router


app = FastAPI(
    title="Financial Forensics Engine",
    description="Money Muling Detection via Graph Analysis",
    version="1.0"
)

# -----------------------------------
# CORS (required for React frontend)
# -----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# Routers
# -----------------------------------
app.include_router(upload_router)
app.include_router(analysis_router)

# -----------------------------------
# YOUR ORIGINAL LOGIC — exposed safely
# -----------------------------------
@app.get("/api/analyze")
def analyze():
    start = time.time()

    txns = parse_csv("data/sample_transactions.csv")
    account_db = build_account_profiles(txns)

    temporal_index = TemporalIndex()
    temporal_index.build(txns)

    graph = Graph()
    graph.build(txns)

    smurfing_hits = detect_smurfing(account_db, temporal_index)
    cycles = detect_cycles(graph, temporal_index, account_db)
    shell_paths = detect_shell_networks(graph, account_db)

    rings, account_to_ring = build_fraud_rings(
        cycles, shell_paths, smurfing_hits
    )

    output = build_json_output(
        rings=rings,
        account_to_ring=account_to_ring,
        smurfing_hits=smurfing_hits,
        cycles=cycles,
        shell_paths=shell_paths,
        total_accounts=len(account_db.store),
        processing_time=time.time() - start
    )

    return output


# -----------------------------------
# Health check (optional)
# -----------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Financial Forensics Engine"
    }
