from datetime import datetime

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"

def parse_timestamp(ts: str) -> datetime:
    return datetime.strptime(ts, TIMESTAMP_FORMAT)
