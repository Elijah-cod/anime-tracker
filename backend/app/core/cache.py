from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, Optional


@dataclass
class CacheEntry:
    value: Any
    expires_at: datetime


class TrendingAnimeCache:
    def __init__(self, ttl_seconds: int) -> None:
        self.ttl_seconds = ttl_seconds
        self._values: Dict[str, CacheEntry] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._values.get(key)
        if not entry:
            return None

        if datetime.utcnow() >= entry.expires_at:
            self._values.pop(key, None)
            return None

        return entry.value

    def set(self, key: str, value: Any) -> None:
        self._values[key] = CacheEntry(
            value=value,
            expires_at=datetime.utcnow() + timedelta(seconds=self.ttl_seconds),
        )
