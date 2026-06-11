import pytest

from curepay.utils.cache import TTLCache
from curepay.utils.rate_limiter import RateLimiter


def test_ttl_cache_expiry():
    now = [1000.0]
    cache = TTLCache(ttl=10, clock=lambda: now[0])
    cache.set("k", "v")
    assert cache.get("k") == "v"
    now[0] += 11
    assert cache.get("k") is None


def test_ttl_cache_get_or_set():
    calls = []
    cache = TTLCache(ttl=10)

    def factory():
        calls.append(1)
        return 42

    assert cache.get_or_set("k", factory) == 42
    assert cache.get_or_set("k", factory) == 42
    assert len(calls) == 1  # factory only called once


def test_ttl_cache_invalidate_and_len():
    now = [0.0]
    cache = TTLCache(ttl=5, clock=lambda: now[0])
    cache.set("a", 1)
    cache.set("b", 2)
    assert len(cache) == 2
    cache.invalidate("a")
    assert cache.get("a") is None
    assert len(cache) == 1


def test_rate_limiter_rejects_bad_args():
    with pytest.raises(ValueError):
        RateLimiter(0)


def test_rate_limiter_token_math():
    now = [0.0]
    rl = RateLimiter(rate=2, per=1.0, clock=lambda: now[0])
    # capacity == 2; two immediate takes are free.
    assert rl._take(1) == 0.0
    assert rl._take(1) == 0.0
    # third must wait ~0.5s (refill 2 tokens/sec).
    wait = rl._take(1)
    assert 0.4 < wait <= 0.5
