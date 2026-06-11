"""The Curepay agent: ties data, strategy, risk and execution into a loop.

One ``tick`` does:
  1. (optionally) confirm the Solana cluster is healthy
  2. pull current contracts + funding history for each watched market
  3. mark open positions and accrue funding for the elapsed interval
  4. exit positions whose carry edge has decayed/flipped
  5. evaluate fresh carry signals, risk-gate them, and open approved trades

The agent is fully dependency-injected so it can be unit-tested without network.
Only paper (simulated) execution is shipped.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

from curepay.data.drift import DriftClient
from curepay.data.models import MarketSnapshot
from curepay.data.prices import CoinGeckoClient
from curepay.data.solana import SolanaRpcClient
from curepay.execution.paper import PaperExecutor
from curepay.execution.portfolio import Portfolio
from curepay.risk.manager import RiskManager
from curepay.strategy.funding_carry import FundingCarryStrategy
from curepay.strategy.signals import Signal
from curepay.utils.config import Config
from curepay.utils.logger import get_logger


@dataclass(slots=True)
class TickReport:
    snapshots: list[MarketSnapshot] = field(default_factory=list)
    signals: list[Signal] = field(default_factory=list)
    opened: list[str] = field(default_factory=list)
    closed: list[str] = field(default_factory=list)
    funding_collected: float = 0.0
    errors: list[str] = field(default_factory=list)


class Agent:
    def __init__(
        self,
        config: Config,
        *,
        drift: DriftClient | None = None,
        solana: SolanaRpcClient | None = None,
        prices: CoinGeckoClient | None = None,
        strategy: FundingCarryStrategy | None = None,
        risk: RiskManager | None = None,
        executor: PaperExecutor | None = None,
        portfolio: Portfolio | None = None,
    ) -> None:
        self.config = config
        self.log = get_logger("curepay.agent", config.log_level)

        self.drift = drift or DriftClient(config.drift_api)
        self.solana = solana or SolanaRpcClient(config.solana_rpc)
        self.prices = prices or CoinGeckoClient(config.coingecko_api)
        self.strategy = strategy or FundingCarryStrategy(
            config.min_annual_funding, config.min_funding_z
        )
        self.risk = risk or RiskManager(
            max_leverage=config.max_leverage,
            risk_per_trade=config.risk_per_trade,
            max_positions=config.max_positions,
            max_drawdown=config.max_drawdown,
        )
        self.executor = executor or PaperExecutor()
        self.portfolio = portfolio or Portfolio(starting_equity=config.equity_usd)
        self._running = False

    # -- snapshots -------------------------------------------------------

    def snapshot_market(self, market: str) -> MarketSnapshot | None:
        contract = self.drift.contract(market)
        if contract is None:
            return None
        history = self.drift.funding_history(market)
        snap = self.strategy.build_snapshot(contract, history)
        # Sanity-check the index price against an independent spot reference.
        if snap.index_price <= 0:
            spot = self.prices.spot_price(market)
            if spot:
                snap = MarketSnapshot(
                    market=snap.market,
                    mark_price=snap.mark_price or spot,
                    index_price=spot,
                    hourly_funding=snap.hourly_funding,
                    annual_funding=snap.annual_funding,
                    funding_z=snap.funding_z,
                    open_interest=snap.open_interest,
                    quote_volume_24h=snap.quote_volume_24h,
                )
        return snap

    # -- one cycle -------------------------------------------------------

    def tick(self) -> TickReport:
        report = TickReport()
        hours_elapsed = self.config.poll_seconds / 3600.0

        snapshots: dict[str, MarketSnapshot] = {}
        for market in self.config.markets:
            try:
                snap = self.snapshot_market(market)
            except Exception as exc:  # network/parse failures shouldn't kill the loop
                report.errors.append(f"{market}: {exc}")
                self.log.warning("snapshot failed for %s: %s", market, exc)
                continue
            if snap is not None:
                snapshots[market] = snap
                report.snapshots.append(snap)

        # Mark open positions and accrue funding for the elapsed interval.
        self.portfolio.mark_all({m: s.mark_price for m, s in snapshots.items()})
        for market, pos in list(self.portfolio.positions.items()):
            snap = snapshots.get(market)
            if snap is None:
                continue
            report.funding_collected += pos.accrue_funding(snap.hourly_funding, hours_elapsed)
            if self.executor.should_exit(pos.side, snap, self.config.min_annual_funding):
                self.executor.close(self.portfolio, market, snap)
                report.closed.append(market)

        # Evaluate fresh entries.
        signals = [self.strategy.evaluate(s) for s in snapshots.values()]
        signals.sort(key=lambda s: s.conviction, reverse=True)
        report.signals = signals

        for sig in signals:
            decision = self.risk.assess(sig, self.portfolio)
            if decision.approved:
                self.executor.open(self.portfolio, sig, decision.notional_usd, snapshots[sig.market])
                report.opened.append(sig.market)
            elif sig.is_actionable:
                self.log.debug("skip %s: %s", sig.market, decision.reason)

        return report

    # -- loop ------------------------------------------------------------

    def run(self, *, once: bool = False, max_ticks: int | None = None) -> None:
        self._running = True
        ticks = 0
        self.log.info(
            "Curepay agent starting (mode=%s, markets=%s, equity=%.2f)",
            self.config.mode,
            ",".join(self.config.markets),
            self.portfolio.equity,
        )
        try:
            while self._running:
                if not self.solana.is_healthy():
                    self.log.warning("Solana RPC unhealthy; skipping tick")
                else:
                    report = self.tick()
                    self.log.info(
                        "tick: equity=%.2f open=%d opened=%s closed=%s funding=%.4f",
                        self.portfolio.equity,
                        self.portfolio.open_count,
                        report.opened,
                        report.closed,
                        report.funding_collected,
                    )
                ticks += 1
                if once or (max_ticks is not None and ticks >= max_ticks):
                    break
                if self.config.poll_seconds > 0:
                    time.sleep(self.config.poll_seconds)
        except KeyboardInterrupt:  # pragma: no cover - interactive
            self.log.info("interrupted; shutting down")
        finally:
            self.stop()

    def stop(self) -> None:
        self._running = False

    def close(self) -> None:
        self.drift.close()
        self.solana.close()
        self.prices.close()
