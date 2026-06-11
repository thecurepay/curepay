"""Risk gate between strategy signals and execution.

Responsibilities:
* Size a position from account equity, risk-per-trade and conviction.
* Enforce a max-leverage notional cap and a max-open-positions cap.
* Trip a kill-switch when drawdown from the equity peak exceeds the limit.

The manager is pure: it reads portfolio state and a signal, returns a decision.
"""

from __future__ import annotations

from dataclasses import dataclass

from curepay.execution.portfolio import Portfolio
from curepay.strategy.signals import Signal
from curepay.utils.helpers import clamp
from curepay.utils.logger import get_logger

_log = get_logger("curepay.risk")


@dataclass(slots=True, frozen=True)
class RiskDecision:
    approved: bool
    notional_usd: float
    reason: str


class RiskManager:
    def __init__(
        self,
        *,
        max_leverage: float = 3.0,
        risk_per_trade: float = 0.02,
        max_positions: int = 3,
        max_drawdown: float = 0.2,
    ) -> None:
        self.max_leverage = max_leverage
        self.risk_per_trade = risk_per_trade
        self.max_positions = max_positions
        self.max_drawdown = max_drawdown

    def drawdown_breached(self, portfolio: Portfolio) -> bool:
        peak = portfolio.peak_equity
        if peak <= 0:
            return False
        drawdown = (peak - portfolio.equity) / peak
        return drawdown >= self.max_drawdown

    def assess(self, signal: Signal, portfolio: Portfolio) -> RiskDecision:
        if not signal.is_actionable:
            return RiskDecision(False, 0.0, "no actionable signal")

        if self.drawdown_breached(portfolio):
            return RiskDecision(
                False, 0.0, f"kill-switch: drawdown >= {self.max_drawdown:.0%} from peak"
            )

        # Already in this market? Don't stack — managed as a hold elsewhere.
        if portfolio.has_position(signal.market):
            return RiskDecision(False, 0.0, f"already holding {signal.market}")

        if portfolio.open_count >= self.max_positions:
            return RiskDecision(
                False, 0.0, f"at max positions ({self.max_positions})"
            )

        equity = portfolio.equity
        if equity <= 0:
            return RiskDecision(False, 0.0, "no equity available")

        # Base risk budget scaled by conviction, then capped by leverage limit.
        risk_budget = equity * self.risk_per_trade * clamp(signal.conviction, 0.0, 1.0)
        max_notional = equity * self.max_leverage
        free_notional = max(0.0, max_notional - portfolio.gross_notional)

        # Convert risk budget into notional. With carry trades we treat the
        # per-trade risk budget as an order of magnitude on notional exposure,
        # scaled up modestly (10x) but always bounded by free leverage room.
        notional = min(risk_budget * 10.0, free_notional)

        if notional <= 0:
            return RiskDecision(False, 0.0, "no free leverage room")

        return RiskDecision(
            True,
            round(notional, 2),
            f"sized {notional:.2f} USD notional (conviction {signal.conviction:.2f})",
        )
