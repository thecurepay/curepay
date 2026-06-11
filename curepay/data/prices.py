"""CoinGecko spot-price client used as an index-price sanity fallback.

If Drift's index price for a market looks stale or zero, the agent can compare
against an independent spot reference before sizing a position.
"""

from __future__ import annotations

import httpx

from curepay.utils.cache import TTLCache
from curepay.utils.rate_limiter import RateLimiter

# Map Drift perp market base symbols to CoinGecko ids.
COINGECKO_IDS: dict[str, str] = {
    "SOL": "solana",
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BONK": "bonk",
    "JUP": "jupiter-exchange-solana",
    "JTO": "jito-governance-token",
    "W": "wormhole",
    "PYTH": "pyth-network",
    "RNDR": "render-token",
    "WIF": "dogwifcoin",
}


def base_symbol(market: str) -> str:
    """Extract the base symbol from a market name like ``SOL-PERP``."""
    return market.upper().split("-")[0].split("/")[0]


class CoinGeckoClient:
    def __init__(
        self,
        base_url: str = "https://api.coingecko.com/api/v3",
        *,
        timeout: float = 15.0,
        cache_ttl: float = 60.0,
        client: httpx.Client | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._cache = TTLCache(ttl=cache_ttl)
        self._limiter = RateLimiter(rate=1, per=2.0)  # CoinGecko free tier is strict
        self._client = client or httpx.Client(
            timeout=timeout,
            headers={"Accept": "application/json", "User-Agent": "curepay/0.1"},
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> CoinGeckoClient:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()

    def spot_price(self, market: str) -> float | None:
        """USD spot price for the base asset of ``market``, or None if unknown."""
        symbol = base_symbol(market)
        coin_id = COINGECKO_IDS.get(symbol)
        if coin_id is None:
            return None

        cached = self._cache.get(coin_id)
        if cached is not None:
            return cached

        self._limiter.acquire()
        resp = self._client.get(
            f"{self.base_url}/simple/price",
            params={"ids": coin_id, "vs_currencies": "usd"},
        )
        resp.raise_for_status()
        data = resp.json()
        price = data.get(coin_id, {}).get("usd")
        if price is None:
            return None
        price = float(price)
        self._cache.set(coin_id, price)
        return price
