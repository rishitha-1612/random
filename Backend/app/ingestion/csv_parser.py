import csv
from app.ingestion.transaction import Transaction
from app.utils.time_utils import parse_timestamp

REQUIRED_COLUMNS = {
    "transaction_id",
    "sender_id",
    "receiver_id",
    "amount",
    "timestamp"
}

def parse_csv(file_path: str) -> list[Transaction]:
    transactions = []

    with open(file_path, "r", newline="") as f:
        reader = csv.DictReader(f)

        if not REQUIRED_COLUMNS.issubset(reader.fieldnames):
            raise ValueError("Invalid CSV schema")

        for row in reader:
            txn = Transaction(
                transaction_id=row["transaction_id"],
                sender_id=row["sender_id"],
                receiver_id=row["receiver_id"],
                amount=float(row["amount"]),
                timestamp=parse_timestamp(row["timestamp"])
            )
            transactions.append(txn)

    # sort once, globally
    transactions.sort(key=lambda x: x.timestamp)
    return transactions
