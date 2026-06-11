"""A tiny thread-safe in-memory TTL cache."""

from __future__ import annotations

import threading
import time
from collections.abc import Callable
from typing import Any


class TTLCache:
    """Key/value store where entries expire after ``ttl`` seconds.

    Used to avoid hammering public APIs that already cache responses for a few
    seconds anyway (e.g. the Drift Data API).
    """

    def __init__(self, ttl: float = 30.0, *, clock: Callable[[], float] = time.monotonic) -> None:
        if ttl <= 0:
            raise ValueError("ttl must be positive")
        self._ttl = ttl
        self._clock = clock
        self._store: dict[Any, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: Any) -> Any | None:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if self._clock() >= expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: Any, value: Any, ttl: float | None = None) -> None:
        with self._lock:
            self._store[key] = (self._clock() + (ttl or self._ttl), value)

    def get_or_set(self, key: Any, factory: Callable[[], Any], ttl: float | None = None) -> Any:
        cached = self.get(key)
        if cached is not None:
            return cached
        value = factory()
        self.set(key, value, ttl)
        return value

    def invalidate(self, key: Any) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            now = self._clock()
            return sum(1 for expires_at, _ in self._store.values() if now < expires_at)
