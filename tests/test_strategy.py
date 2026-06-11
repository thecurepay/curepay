from curepay.data.drift import MarketContract
from curepay.data.models import FundingPoint
from curepay.strategy.funding_carry import FundingCarryStrategy
from curepay.strategy.signals import Side


def _contract(hourly_funding: float) -> MarketContract:
    return MarketContract(
        market="SOL-PERP",
        mark_price=150.0,
        index_price=150.0,
        hourly_funding=hourly_funding,
        open_interest=1000.0,
        quote_volume_24h=5_000_000.0,
    )


def _history(rate: float, n: int = 100) -> list[FundingPoint]:
    return [FundingPoint(ts=i, hourly_rate=rate) for i in range(n)]


def test_positive_funding_yields_short():
    strat = FundingCarryStrategy(min_annual_funding=0.05, min_funding_z=1.0)
    # Big positive hourly funding spike vs a near-zero history -> short to collect.
    hist = [FundingPoint(ts=i, hourly_rate=0.00001 * (i % 3)) for i in range(100)]
    snap = strat.build_snapshot(_contract(0.0005), hist)
    sig = strat.evaluate(snap)
    assert sig.side is Side.SHORT
    assert sig.conviction > 0
    assert sig.is_actionable


def test_negative_funding_yields_long():
    strat = FundingCarryStrategy(min_annual_funding=0.05, min_funding_z=1.0)
    hist = [FundingPoint(ts=i, hourly_rate=-0.00001 * (i % 3)) for i in range(100)]
    snap = strat.build_snapshot(_contract(-0.0005), hist)
    sig = strat.evaluate(snap)
    assert sig.side is Side.LONG


def test_small_funding_is_flat():
    strat = FundingCarryStrategy(min_annual_funding=0.20, min_funding_z=1.0)
    snap = strat.build_snapshot(_contract(0.000001), _history(0.000001))
    sig = strat.evaluate(snap)
    assert sig.side is Side.FLAT
    assert not sig.is_actionable


def test_ordinary_funding_below_z_is_flat():
    # Funding is large but perfectly ordinary vs history -> z == 0 -> flat.
    strat = FundingCarryStrategy(min_annual_funding=0.05, min_funding_z=1.0)
    snap = strat.build_snapshot(_contract(0.0005), _history(0.0005))
    sig = strat.evaluate(snap)
    assert sig.funding_z == 0.0
    assert sig.side is Side.FLAT
