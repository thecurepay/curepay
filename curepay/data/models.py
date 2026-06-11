"""Plain data containers passed between the data, strategy and risk layers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True, frozen=True)
class FundingPoint:
    """A single historical funding observation for a market."""

    ts: int  # unix seconds
    hourly_rate: float  # funding rate over the hour, as a fraction


@dataclass(slots=True, frozen=True)
class MarketSnapshot:
    """A normalised view of one perp market at a point in time.

    Fields are derived from the Drift Data API ``/contracts`` payload and
    enriched with funding history. ``hourly_funding`` is a fraction (e.g.
    0.00125 == 0.125%/h).
    """

    market: str
    mark_price: float
    index_price: float
    hourly_funding: float
    annual_funding: float
    funding_z: float
    open_interest: float
    quote_volume_24h: float

    @property
    def basis(self) -> float:
        """Mark/index basis as a fraction of index price."""
        if self.index_price <= 0:
            return 0.0
        return (self.mark_price - self.index_price) / self.index_price
