"""Portfolio accounting for simulated perp positions.

Tracks signed base size, entry price, mark-to-market PnL and accrued funding.
Funding convention: with funding rate ``f`` over a period, longs pay shorts when
``f > 0``. A position's funding cash flow per period is ``-sign * notional * f``
(short receives when ``f > 0``).
"""

from __future__ import annotations

from dataclasses import dataclass, field

from curepay.strategy.signals import Side


@dataclass(slots=True)
class Position:
    market: str
    side: Side
    notional_usd: float
    entry_price: float
    current_price: float = 0.0
    accrued_funding: float = 0.0

    def __post_init__(self) -> None:
        if self.current_price <= 0:
            self.current_price = self.entry_price

    @property
    def base_size(self) -> float:
        """Signed base-asset size implied by entry notional."""
        if self.entry_price <= 0:
            return 0.0
        return self.side.sign * (self.notional_usd / self.entry_price)

    @property
    def unrealized_pnl(self) -> float:
        return self.base_size * (self.current_price - self.entry_price)

    @property
    def equity_contribution(self) -> float:
        return self.unrealized_pnl + self.accrued_funding

    def mark(self, price: float) -> None:
        if price > 0:
            self.current_price = price

    def accrue_funding(self, hourly_funding: float, hours: float = 1.0) -> float:
        cash = -self.side.sign * self.notional_usd * hourly_funding * hours
        self.accrued_funding += cash
        return cash


@dataclass(slots=True)
class Portfolio:
    starting_equity: float
    realized_equity: float = 0.0
    peak_equity: float = 0.0
    positions: dict[str, Position] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.realized_equity == 0.0:
            self.realized_equity = self.starting_equity
        if self.peak_equity == 0.0:
            self.peak_equity = self.starting_equity

    @property
    def open_count(self) -> int:
        return len(self.positions)

    @property
    def gross_notional(self) -> float:
        return sum(p.notional_usd for p in self.positions.values())

    @property
    def unrealized_pnl(self) -> float:
        return sum(p.equity_contribution for p in self.positions.values())

    @property
    def equity(self) -> float:
        return self.realized_equity + self.unrealized_pnl

    def has_position(self, market: str) -> bool:
        return market in self.positions

    def open(self, position: Position) -> None:
        if position.market in self.positions:
            raise ValueError(f"position already open for {position.market}")
        self.positions[position.market] = position
        self._update_peak()

    def close(self, market: str) -> float:
        """Close a position, realising its PnL + funding. Returns realised cash."""
        pos = self.positions.pop(market)
        realised = pos.equity_contribution
        self.realized_equity += realised
        self._update_peak()
        return realised

    def mark_all(self, prices: dict[str, float]) -> None:
        for market, pos in self.positions.items():
            if market in prices:
                pos.mark(prices[market])
        self._update_peak()

    def _update_peak(self) -> None:
        self.peak_equity = max(self.peak_equity, self.equity)
