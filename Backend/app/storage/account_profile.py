from collections import defaultdict
from datetime import datetime

class AccountProfile:
    def __init__(self, account_id: str):
        self.account_id = account_id

        self.total_txns = 0
        self.total_in = 0
        self.total_out = 0

        self.first_seen: datetime | None = None
        self.last_seen: datetime | None = None

        self.counterparties = set()
        self.amounts = []

    def update_sender(self, amount: float, ts: datetime, receiver: str):
        self.total_txns += 1
        self.total_out += 1
        self.counterparties.add(receiver)
        self.amounts.append(amount)
        self._update_time(ts)

    def update_receiver(self, amount: float, ts: datetime, sender: str):
        self.total_txns += 1
        self.total_in += 1
        self.counterparties.add(sender)
        self.amounts.append(amount)
        self._update_time(ts)

    def _update_time(self, ts: datetime):
        if self.first_seen is None or ts < self.first_seen:
            self.first_seen = ts
        if self.last_seen is None or ts > self.last_seen:
            self.last_seen = ts

    @property
    def active_days(self) -> int:
        if not self.first_seen or not self.last_seen:
            return 0
        return (self.last_seen - self.first_seen).days + 1

    @property
    def unique_counterparties(self) -> int:
        return len(self.counterparties)
class AccountProfileStore:
    def __init__(self):
        self.store = {}

    def get_or_create(self, account_id: str) -> AccountProfile:
        if account_id not in self.store:
            self.store[account_id] = AccountProfile(account_id)
        return self.store[account_id]

    def all_accounts(self):
        return self.store.values()
from app.ingestion.transaction import Transaction

def build_account_profiles(transactions: list[Transaction]) -> AccountProfileStore:
    db = AccountProfileStore()

    for txn in transactions:
        sender = db.get_or_create(txn.sender_id)
        receiver = db.get_or_create(txn.receiver_id)

        sender.update_sender(txn.amount, txn.timestamp, txn.receiver_id)
        receiver.update_receiver(txn.amount, txn.timestamp, txn.sender_id)

    return db
