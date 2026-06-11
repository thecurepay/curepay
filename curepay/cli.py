"""Command-line interface for Curepay (Rich-powered)."""

from __future__ import annotations

import argparse
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from curepay import __version__
from curepay.agent import Agent
from curepay.data.drift import DriftClient
from curepay.strategy.funding_carry import FundingCarryStrategy
from curepay.strategy.signals import Side
from curepay.utils.config import load_config
from curepay.utils.helpers import fmt_pct, fmt_usd

console = Console()

_SIDE_STYLE = {Side.LONG: "green", Side.SHORT: "red", Side.FLAT: "dim"}


def _markets_table(agent: Agent) -> Table:
    table = Table(title="Drift perps — funding carry view", expand=True)
    table.add_column("Market")
    table.add_column("Mark", justify="right")
    table.add_column("Funding/h", justify="right")
    table.add_column("Annual", justify="right")
    table.add_column("z", justify="right")
    table.add_column("OI", justify="right")
    table.add_column("Signal", justify="center")
    table.add_column("Conv.", justify="right")

    strat = agent.strategy
    for market in agent.config.markets:
        try:
            snap = agent.snapshot_market(market)
        except Exception as exc:  # API unreachable / blocked — degrade gracefully
            table.add_row(market, "—", "—", "—", "—", "—", "[red]err[/]", f"[dim]{exc}[/]")
            continue
        if snap is None:
            table.add_row(market, "—", "—", "—", "—", "—", "[dim]n/a[/]", "—")
            continue
        sig = strat.evaluate(snap)
        style = _SIDE_STYLE[sig.side]
        table.add_row(
            snap.market,
            f"{snap.mark_price:,.4f}",
            fmt_pct(snap.hourly_funding, 4),
            fmt_pct(snap.annual_funding),
            f"{snap.funding_z:+.2f}",
            f"{snap.open_interest:,.0f}",
            f"[{style}]{sig.side.value}[/]",
            f"{sig.conviction:.2f}",
        )
    return table


def cmd_markets(args: argparse.Namespace) -> int:
    config = load_config(args.env)
    agent = Agent(config)
    try:
        console.print(_markets_table(agent))
    finally:
        agent.close()
    return 0


def cmd_funding(args: argparse.Namespace) -> int:
    config = load_config(args.env)
    with DriftClient(config.drift_api) as drift:
        strat = FundingCarryStrategy(config.min_annual_funding, config.min_funding_z)
        contract = drift.contract(args.market)
        if contract is None:
            console.print(f"[red]market not found:[/] {args.market}")
            return 1
        history = drift.funding_history(args.market)
        snap = strat.build_snapshot(contract, history)
        sig = strat.evaluate(snap)
    body = (
        f"[bold]{snap.market}[/]\n"
        f"mark: {snap.mark_price:,.4f}   index: {snap.index_price:,.4f}   "
        f"basis: {fmt_pct(snap.basis, 4)}\n"
        f"funding/h: {fmt_pct(snap.hourly_funding, 4)}   "
        f"annualised: {fmt_pct(snap.annual_funding)}   z: {snap.funding_z:+.2f}\n"
        f"open interest: {snap.open_interest:,.0f}\n"
        f"history points: {len(history)}\n\n"
        f"[bold]signal:[/] {sig.side.value}  (conviction {sig.conviction:.2f})\n"
        f"{sig.reason}"
    )
    console.print(Panel(body, title="funding carry", border_style="cyan"))
    return 0


def cmd_run(args: argparse.Namespace) -> int:
    config = load_config(args.env)
    agent = Agent(config)
    console.print(
        Panel(
            f"mode=[bold]{config.mode}[/] (paper sim)  equity={fmt_usd(config.equity_usd)}  "
            f"markets={', '.join(config.markets)}  poll={config.poll_seconds}s",
            title="Curepay agent",
            border_style="green",
        )
    )
    try:
        agent.run(once=args.once, max_ticks=args.ticks)
    finally:
        agent.close()
    eq = agent.portfolio.equity
    pnl = eq - config.equity_usd
    console.print(
        f"final equity: {fmt_usd(eq)}  pnl: {fmt_usd(pnl)} ({fmt_pct(pnl / config.equity_usd)})"
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="curepay", description=__doc__)
    parser.add_argument("--version", action="version", version=f"curepay {__version__}")
    parser.add_argument("--env", help="path to a .env file", default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    p_markets = sub.add_parser("markets", help="show the funding-carry view across markets")
    p_markets.set_defaults(func=cmd_markets)

    p_funding = sub.add_parser("funding", help="inspect funding/carry for one market")
    p_funding.add_argument("market", help="market name, e.g. SOL-PERP")
    p_funding.set_defaults(func=cmd_funding)

    p_run = sub.add_parser("run", help="run the paper-trading agent loop")
    p_run.add_argument("--once", action="store_true", help="run a single tick and exit")
    p_run.add_argument("--ticks", type=int, default=None, help="stop after N ticks")
    p_run.set_defaults(func=cmd_run)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except KeyboardInterrupt:  # pragma: no cover
        return 130
    except Exception as exc:  # pragma: no cover - top-level guard
        console.print(f"[red]error:[/] {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
