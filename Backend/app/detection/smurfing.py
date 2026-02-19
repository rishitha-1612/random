from datetime import timedelta
from collections import defaultdict

WINDOW = timedelta(hours=72)

MIN_COUNTERPARTIES = 10
MAX_TOTAL_TXNS = 20        # merchant / payroll exclusion
MAX_AVG_AMOUNT = 200       # smurfing = small-value txns


def smurfing_candidates(account_db, min_degree=8):
    """
    Pre-filter candidates by degree, but NOT merchants.
    """
    for profile in account_db.all_accounts():
        if profile.total_txns > MAX_TOTAL_TXNS:
            continue  # 🚫 merchant / payroll

        if profile.total_in >= min_degree or profile.total_out >= min_degree:
            yield profile.account_id


def detect_smurfing(account_db, temporal_index):
    suspicious_accounts = {}

    for account_id in smurfing_candidates(account_db):
        profile = account_db.get_or_create(account_id)

        # 🚫 Large average amount → not smurfing
        if profile.amounts:
            avg_amount = sum(profile.amounts) / len(profile.amounts)
            if avg_amount > MAX_AVG_AMOUNT:
                continue

        events = temporal_index.index.get(account_id, [])
        if not events:
            continue

        left = 0
        in_counterparties = defaultdict(int)
        out_counterparties = defaultdict(int)

        for right in range(len(events)):
            ts, counterparty, direction = events[right]

            if direction == "in":
                in_counterparties[counterparty] += 1
            else:
                out_counterparties[counterparty] += 1

            # Slide window
            while ts - events[left][0] > WINDOW:
                old_ts, old_cp, old_dir = events[left]
                if old_dir == "in":
                    in_counterparties[old_cp] -= 1
                    if in_counterparties[old_cp] == 0:
                        del in_counterparties[old_cp]
                else:
                    out_counterparties[old_cp] -= 1
                    if out_counterparties[old_cp] == 0:
                        del out_counterparties[old_cp]
                left += 1

            # ✅ Fan-in: many unique senders → one account
            if len(in_counterparties) >= MIN_COUNTERPARTIES:
                suspicious_accounts[account_id] = "fan_in"
                break

            # ✅ Fan-out: one account → many receivers
            if len(out_counterparties) >= MIN_COUNTERPARTIES:
                suspicious_accounts[account_id] = "fan_out"
                break

    return suspicious_accounts
