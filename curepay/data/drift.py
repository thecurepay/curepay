"""Client for the Drift Protocol public Data API.

Drift exposes read-only indexed data over HTTP at ``https://data.api.drift.trade``
(no API key required). We use two endpoints:

* ``/contracts``    — current per-market funding, open interest, mark/index price.
* ``/fundingRates`` — up to ~30 days of historical funding records per market.

Field names follow Drift's CoinGecko-style derivatives ticker schema. Because
that schema has shifted over time we parse defensively via ``first_present``.

See: https://docs.drift.trade/developers/data-api
"""

from __future__ import annotations

import httpx

from curepay.data.models import FundingPoint
from curepay.utils.cache import TTLCache
from curepay.utils.helpers import first_present, safe_float
from curepay.utils.logger import get_logger
from curepay.utils.rate_limiter import RateLimiter

# Drift on-chain fixed-point precisions, used to normalise raw funding records.
FUNDING_RATE_PRECISION = 1e9
PRICE_PRECISION = 1e6

_log = get_logger("curepay.data.drift")


class DriftClient:
    """Thin synchronous client over the Drift Data API."""

    def __init__(
        self,
        base_url: str = "https://data.api.drift.trade",
        *,
        timeout: float = 15.0,
        cache_ttl: float = 20.0,
        client: httpx.Client | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._cache = TTLCache(ttl=cache_ttl)
        self._limiter = RateLimiter(rate=5, per=1.0)
        self._client = client or httpx.Client(
            timeout=timeout,
            headers={
                "User-Agent": "curepay/0.1 (+https://github.com/nujar00t/curepay)",
                "Accept": "application/json",
            },
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> DriftClient:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()

    def _get(self, path: str, params: dict | None = None) -> dict | list:
        self._limiter.acquire()
        url = f"{self.base_url}{path}"
        resp = self._client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

    # -- contracts -------------------------------------------------------

    def contracts(self) -> list[MarketContract]:
        """All markets' current contract stats (cached briefly)."""
        cached = self._cache.get("contracts")
        if cached is not None:
            return cached
        payload = self._get("/contracts")
        rows = payload.get("contracts", payload) if isinstance(payload, dict) else payload
        contracts = [MarketContract.from_api(row) for row in rows]
        self._cache.set("contracts", contracts)
        return contracts

    def contract(self, market: str) -> MarketContract | None:
        """Current contract stats for a single market name (e.g. ``SOL-PERP``)."""
        target = market.upper()
        for c in self.contracts():
            if c.market.upper() == target:
                return c
        return None

    # -- funding history -------------------------------------------------

    def funding_history(self, market: str, limit: int = 168) -> list[FundingPoint]:
        """Recent hourly funding points for ``market`` (newest last).

        ``limit`` defaults to 168 (one week of hourly funding).
        """
        key = ("funding", market.upper())
        cached = self._cache.get(key)
        if cached is None:
            payload = self._get("/fundingRates", params={"marketName": market})
            rows = (
                payload.get("fundingRates", payload.get("data", []))
                if isinstance(payload, dict)
                else payload
            )
            cached = [self._normalize_funding(row) for row in rows]
            cached = [p for p in cached if p is not None]
            cached.sort(key=lambda p: p.ts)
            self._cache.set(key, cached)
        return cached[-limit:]

    @staticmethod
    def _normalize_funding(row: dict) -> FundingPoint | None:
        """Convert a raw funding record into an hourly-rate FundingPoint.

        Preferred path: derive the hourly rate fraction from the raw on-chain
        ``fundingRate`` and ``oraclePriceTwap`` fixed-point values:

            hourly_rate = (fundingRate / 1e9) / (oraclePriceTwap / 1e6)

        Fallback: a pre-computed percentage field if the API supplies one.
        """
        ts = first_present(row, ["ts", "timestamp", "slot", "fundingRateTs"])
        if ts is None:
            return None
        ts_int = int(safe_float(ts))

        raw_rate = first_present(row, ["fundingRate", "funding_rate"])
        twap = first_present(row, ["oraclePriceTwap", "oracle_price_twap", "oraclePriceTwapH"])
        if raw_rate is not None and twap not in (None, 0):
            hourly = (safe_float(raw_rate) / FUNDING_RATE_PRECISION) / (
                safe_float(twap) / PRICE_PRECISION
            )
            return FundingPoint(ts=ts_int, hourly_rate=hourly)

        pct = first_present(row, ["fundingRatePct", "funding_rate_pct"])
        if pct is not None:
            return FundingPoint(ts=ts_int, hourly_rate=safe_float(pct) / 100.0)
        return None


class MarketContract:
    """Normalised ``/contracts`` row for one perp market."""

    __slots__ = (
        "market",
        "mark_price",
        "index_price",
        "hourly_funding",
        "open_interest",
        "quote_volume_24h",
        "raw",
    )

    def __init__(
        self,
        market: str,
        mark_price: float,
        index_price: float,
        hourly_funding: float,
        open_interest: float,
        quote_volume_24h: float,
        raw: dict | None = None,
    ) -> None:
        self.market = market
        self.mark_price = mark_price
        self.index_price = index_price
        self.hourly_funding = hourly_funding
        self.open_interest = open_interest
        self.quote_volume_24h = quote_volume_24h
        self.raw = raw or {}

    @classmethod
    def from_api(cls, row: dict) -> MarketContract:
        market = str(
            first_present(row, ["ticker_id", "tickerId", "market", "symbol", "marketName"], "?")
        )
        mark = safe_float(first_present(row, ["last_price", "lastPrice", "mark_price", "markPrice"]))
        index = safe_float(
            first_present(row, ["index_price", "indexPrice", "oracle_price", "oraclePrice"])
        )
        funding = safe_float(
            first_present(row, ["funding_rate", "fundingRate", "next_funding_rate"])
        )
        oi = safe_float(first_present(row, ["open_interest", "openInterest", "oi"]))
        qv = safe_float(first_present(row, ["quote_volume", "quoteVolume", "quote_volume_24h"]))
        return cls(market, mark, index, funding, oi, qv, raw=row)

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        return (
            f"MarketContract({self.market}, mark={self.mark_price}, "
            f"funding/h={self.hourly_funding:.6f}, oi={self.open_interest})"
        )
