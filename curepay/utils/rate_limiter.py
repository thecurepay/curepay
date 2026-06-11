"""Token-bucket rate limiter, usable from sync and async code."""

from __future__ import annotations

import asyncio
import threading
import time
from collections.abc import Callable


class RateLimiter:
    """Token bucket allowing ``rate`` operations per ``per`` seconds.

    A burst of up to ``capacity`` (default = rate) is permitted. ``acquire``
    blocks; ``aacquire`` awaits without blocking the event loop.
    """

    def __init__(
        self,
        rate: float,
        per: float = 1.0,
        *,
        capacity: float | None = None,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        if rate <= 0 or per <= 0:
            raise ValueError("rate and per must be positive")
        self._fill_rate = rate / per
        self._capacity = capacity if capacity is not None else rate
        self._tokens = self._capacity
        self._clock = clock
        self._updated = clock()
        self._lock = threading.Lock()

    def _take(self, tokens: float) -> float:
        """Deduct a token if available; else return seconds to wait."""
        with self._lock:
            now = self._clock()
            self._tokens = min(self._capacity, self._tokens + (now - self._updated) * self._fill_rate)
            self._updated = now
            if self._tokens >= tokens:
                self._tokens -= tokens
                return 0.0
            return (tokens - self._tokens) / self._fill_rate

    def acquire(self, tokens: float = 1.0) -> None:
        while True:
            wait = self._take(tokens)
            if wait <= 0:
                return
            time.sleep(wait)

    async def aacquire(self, tokens: float = 1.0) -> None:
        while True:
            wait = self._take(tokens)
            if wait <= 0:
                return
            await asyncio.sleep(wait)
