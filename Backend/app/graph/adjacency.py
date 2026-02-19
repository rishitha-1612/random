from collections import defaultdict
from app.ingestion.transaction import Transaction

class Graph:
    def __init__(self):
        self.out_edges = defaultdict(list)  # sender → receivers
        self.in_edges = defaultdict(list)   # receiver → senders

    def add_transaction(self, txn: Transaction):
        # ✅ order = (neighbor, amount, timestamp)
        self.out_edges[txn.sender_id].append(
            (txn.receiver_id, txn.amount, txn.timestamp)
        )
        self.in_edges[txn.receiver_id].append(
            (txn.sender_id, txn.amount, txn.timestamp)
        )

    def build(self, transactions: list[Transaction]):
        for txn in transactions:
            self.add_transaction(txn)
