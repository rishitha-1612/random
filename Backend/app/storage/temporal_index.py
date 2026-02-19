from collections import defaultdict

class TemporalIndex:
    def __init__(self):
        self.index = defaultdict(list)

    def add(self, account_id, timestamp, counterparty, direction):
        self.index[account_id].append(
            (timestamp, counterparty, direction)
        )

    def build(self, transactions):
        for txn in transactions:
            self.add(txn.sender_id, txn.timestamp, txn.receiver_id, "out")
            self.add(txn.receiver_id, txn.timestamp, txn.sender_id, "in")

        # sort for binary search / windows
        for acc in self.index:
            self.index[acc].sort(key=lambda x: x[0])
