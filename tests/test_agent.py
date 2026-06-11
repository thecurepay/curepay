"""Agent integration test with in-memory fakes (no network)."""

from __future__ import annotations

from curepay.agent import Agent
from curepay.data.drift import MarketContract
from curepay.data.models import FundingPoint
from curepay.execution.paper import PaperExecutor
from curepay.execution.portfolio import Portfolio
from curepay.risk.manager import RiskManager
from curepay.strategy.funding_carry import FundingCarryStrategy
from curepay.utils.config import Config


class FakeDrift:
    def __init__(self, hourly_funding: float):
        self.hourly_funding = hourly_funding

    def contract(self, market: str):
        return MarketContract(
            market=market,
            mark_price=150.0,
            index_price=150.0,
            hourly_funding=self.hourly_funding,
            open_interest=1000.0,
            quote_volume_24h=5_000_000.0,
        )

    def funding_history(self, market: str, limit: int = 168):
        # near-zero history so a funding spike has a high z-score
        return [FundingPoint(ts=i, hourly_rate=0.000001 * (i % 2)) for i in range(50)]

    def close(self):
        pass


class FakeSolana:
    def is_healthy(self):
        return True

    def close(self):
        pass


class FakePrices:
    def spot_price(self, market: str):
        return 150.0

    def close(self):
        pass


def _config(**kw) -> Config:
    base = dict(
        markets=["SOL-PERP"],
        min_annual_funding=0.05,
        min_funding_z=1.0,
        equity_usd=10_000.0,
        max_leverage=3.0,
        risk_per_trade=0.02,
        max_positions=3,
        max_drawdown=0.2,
        poll_seconds=0,
    )
    base.update(kw)
    return Config(**base)


def _agent(hourly_funding: float, config: Config | None = None) -> Agent:
    config = config or _config()
    return Agent(
        config,
        drift=FakeDrift(hourly_funding),
        solana=FakeSolana(),
        prices=FakePrices(),
        strategy=FundingCarryStrategy(config.min_annual_funding, config.min_funding_z),
        risk=RiskManager(
            max_leverage=config.max_leverage,
            risk_per_trade=config.risk_per_trade,
            max_positions=config.max_positions,
            max_drawdown=config.max_drawdown,
        ),
        executor=PaperExecutor(taker_fee=0.0, slippage=0.0),
        portfolio=Portfolio(starting_equity=config.equity_usd),
    )


def test_tick_opens_short_on_positive_funding():
    agent = _agent(hourly_funding=0.0005)  # strong positive funding
    report = agent.tick()
    assert "SOL-PERP" in report.opened
    assert agent.portfolio.has_position("SOL-PERP")
    assert agent.portfolio.positions["SOL-PERP"].side.value == "short"


def test_position_collects_funding_then_exits_when_carry_decays():
    agent = _agent(hourly_funding=0.0005)
    agent.tick()  # opens short
    assert agent.portfolio.has_position("SOL-PERP")

    # Funding collapses toward zero -> carry decays -> position should exit.
    agent.drift = FakeDrift(hourly_funding=0.0)
    report = agent.tick()
    assert "SOL-PERP" in report.closed
    assert not agent.portfolio.has_position("SOL-PERP")


def test_run_max_ticks_terminates():
    agent = _agent(hourly_funding=0.0005)
    agent.run(max_ticks=2)
    assert not agent._running
