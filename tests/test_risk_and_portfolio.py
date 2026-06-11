from curepay.execution.portfolio import Portfolio, Position
from curepay.risk.manager import RiskManager
from curepay.strategy.signals import Side, Signal


def _signal(conviction=0.5, market="SOL-PERP", side=Side.SHORT) -> Signal:
    return Signal(
        market=market,
        side=side,
        conviction=conviction,
        annual_funding=0.5,
        funding_z=2.0,
        reason="test",
    )


def test_position_pnl_long():
    pos = Position("SOL-PERP", Side.LONG, notional_usd=1000.0, entry_price=100.0)
    pos.mark(110.0)
    # +10% on 1000 notional == +100
    assert round(pos.unrealized_pnl, 2) == 100.0


def test_position_pnl_short():
    pos = Position("SOL-PERP", Side.SHORT, notional_usd=1000.0, entry_price=100.0)
    pos.mark(110.0)
    assert round(pos.unrealized_pnl, 2) == -100.0


def test_funding_accrual_short_collects_on_positive_funding():
    pos = Position("SOL-PERP", Side.SHORT, notional_usd=1000.0, entry_price=100.0)
    cash = pos.accrue_funding(0.001, hours=1)  # +0.1%/h, short receives
    assert cash > 0
    assert round(cash, 4) == 1.0


def test_portfolio_open_close_realises_pnl():
    pf = Portfolio(starting_equity=10_000.0)
    pf.open(Position("SOL-PERP", Side.LONG, 1000.0, 100.0))
    pf.mark_all({"SOL-PERP": 110.0})
    assert round(pf.equity, 2) == 10_100.0
    realised = pf.close("SOL-PERP")
    assert round(realised, 2) == 100.0
    assert round(pf.equity, 2) == 10_100.0
    assert pf.open_count == 0


def test_risk_sizes_and_caps_leverage():
    rm = RiskManager(max_leverage=3, risk_per_trade=0.02, max_positions=3, max_drawdown=0.2)
    pf = Portfolio(starting_equity=10_000.0)
    decision = rm.assess(_signal(conviction=1.0), pf)
    assert decision.approved
    # risk_budget = 10000 * 0.02 * 1.0 = 200; notional = 200*10 = 2000, under 30k cap.
    assert decision.notional_usd == 2000.0


def test_risk_blocks_duplicate_market():
    rm = RiskManager()
    pf = Portfolio(starting_equity=10_000.0)
    pf.open(Position("SOL-PERP", Side.SHORT, 1000.0, 100.0))
    decision = rm.assess(_signal(market="SOL-PERP"), pf)
    assert not decision.approved
    assert "already holding" in decision.reason


def test_risk_max_positions():
    rm = RiskManager(max_positions=1)
    pf = Portfolio(starting_equity=10_000.0)
    pf.open(Position("BTC-PERP", Side.SHORT, 1000.0, 100.0))
    decision = rm.assess(_signal(market="SOL-PERP"), pf)
    assert not decision.approved
    assert "max positions" in decision.reason


def test_risk_drawdown_kill_switch():
    rm = RiskManager(max_drawdown=0.2)
    pf = Portfolio(starting_equity=10_000.0)
    pf.peak_equity = 10_000.0
    pf.realized_equity = 7_000.0  # 30% drawdown
    decision = rm.assess(_signal(), pf)
    assert not decision.approved
    assert "kill-switch" in decision.reason
