"""Paper-trading executor.

Simulates fills at the current mark price with a configurable taker fee and
slippage, and exits a carry position when its funding edge decays or flips. No
private keys, no on-chain transactions — this is a simulation harness only.
"""

from __future__ import annotations

from dataclasses import dataclass

from curepay.data.models import MarketSnapshot
from curepay.execution.portfolio import Portfolio, Position
from curepay.strategy.signals import Side, Signal
from curepay.utils.logger import get_logger

_log = get_logger("curepay.execution.paper")


@dataclass(slots=True, frozen=True)
class Fill:
    market: str
    side: Side
    notional_usd: float
    price: float
    fee_usd: float


class PaperExecutor:
    def __init__(self, *, taker_fee: float = 0.0005, slippage: float = 0.0005) -> None:
        self.taker_fee = taker_fee
        self.slippage = slippage

    def _fill_price(self, side: Side, mark: float) -> float:
        # Pay the spread: buys fill a touch higher, sells a touch lower.
        return mark * (1 + side.sign * self.slippage)

    def open(
        self, portfolio: Portfolio, signal: Signal, notional_usd: float, snap: MarketSnapshot
    ) -> Fill:
        price = self._fill_price(signal.side, snap.mark_price)
        fee = notional_usd * self.taker_fee
        portfolio.realized_equity -= fee
        portfolio.open(
            Position(
                market=signal.market,
                side=signal.side,
                notional_usd=notional_usd,
                entry_price=price,
                current_price=snap.mark_price,
            )
        )
        _log.info(
            "OPEN %s %s %.2f USD @ %.4f (fee %.2f)",
            signal.side.value,
            signal.market,
            notional_usd,
            price,
            fee,
        )
        return Fill(signal.market, signal.side, notional_usd, price, fee)

    def close(self, portfolio: Portfolio, market: str, snap: MarketSnapshot) -> float:
        pos = portfolio.positions[market]
        exit_side = Side.SHORT if pos.side is Side.LONG else Side.LONG
        price = self._fill_price(exit_side, snap.mark_price)
        pos.mark(price)
        fee = pos.notional_usd * self.taker_fee
        realised = portfolio.close(market) - fee
        portfolio.realized_equity -= fee
        _log.info("CLOSE %s @ %.4f -> realised %.2f USD (fee %.2f)", market, price, realised, fee)
        return realised

    def should_exit(self, position_side: Side, snap: MarketSnapshot, min_annual_funding: float) -> bool:
        """Exit when carry no longer favours the position.

        We hold a short while funding is positive (we get paid) and a long while
        funding is negative. Exit when funding decays below half the entry floor
        or flips against the position.
        """
        annual = snap.annual_funding
        favourable = (position_side is Side.SHORT and annual > 0) or (
            position_side is Side.LONG and annual < 0
        )
        if not favourable:
            return True
        return abs(annual) < (min_annual_funding * 0.5)
