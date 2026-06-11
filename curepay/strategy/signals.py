"""Strategy signal types."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Side(str, Enum):
    LONG = "long"
    SHORT = "short"
    FLAT = "flat"

    @property
    def sign(self) -> int:
        return {Side.LONG: 1, Side.SHORT: -1, Side.FLAT: 0}[self]


@dataclass(slots=True, frozen=True)
class Signal:
    """A directional view on one market with a 0..1 conviction score."""

    market: str
    side: Side
    conviction: float  # 0..1
    annual_funding: float
    funding_z: float
    reason: str

    @property
    def is_actionable(self) -> bool:
        return self.side is not Side.FLAT and self.conviction > 0
