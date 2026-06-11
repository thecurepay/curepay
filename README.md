# Curepay

**A funding-carry trading agent for Solana perpetual futures (Drift Protocol).**

Curepay watches perpetual markets on [Drift Protocol](https://drift.trade), reads
their funding rates and open interest from Drift's public Data API, and runs a
**funding-rate carry** strategy: it leans against the crowded side of a perp to
collect funding, sized by a risk manager and executed in a **paper-trading
simulator**. It ships read-only — no signing keys, no on-chain transactions.

> ⚠️ Curepay is research/educational software for simulated (paper) trading. It
> does not place real orders and is **not financial advice**. Funding-carry is a
> real strategy with real risks (gap risk, funding flips, liquidations). Do your
> own research before trading anything live.

---

## How it works

```
Drift Data API ─┐
Solana RPC ─────┼─►  Agent loop  ─►  Funding-carry strategy  ─►  Risk manager  ─►  Paper executor
CoinGecko ──────┘     (each tick)      (signal + conviction)      (sizing/limits)    (sim fills + PnL)
```

Each tick the agent:

1. checks the Solana cluster is healthy,
2. pulls current contract stats (`/contracts`) and funding history (`/fundingRates`) per market,
3. marks open positions and accrues funding for the elapsed interval,
4. exits positions whose carry edge has decayed or flipped,
5. evaluates fresh carry signals, risk-gates them, and opens approved paper trades.

### The strategy

On a perp, the crowded side pays funding to the other side. Curepay acts only
when carry is **both large and unusual**:

- annualised funding above a floor (`CUREPAY_MIN_ANNUAL_FUNDING`), and
- a funding **z-score** above a floor vs the market's own recent history (`CUREPAY_MIN_FUNDING_Z`).

Positive funding → short to collect; negative funding → long to collect.
Conviction blends how far past each floor the reading is.

### Risk

The risk manager sizes notional from equity × risk-per-trade × conviction, caps
total exposure at `max_leverage`, limits concurrent positions, and trips a
**drawdown kill-switch** when equity falls too far from its peak.

---

## Install

```bash
pip install curepay          # from PyPI (once published)
# or, from source:
git clone https://github.com/nujar00t/curepay
cd curepay
pip install -e ".[dev]"
```

Requires Python 3.10+.

## Configure

```bash
cp .env.example .env
# edit .env — markets, thresholds, equity, risk knobs
```

All settings have sane defaults; `.env` is optional. Key knobs:

| Variable | Meaning | Default |
|---|---|---|
| `CUREPAY_MARKETS` | Drift perp markets to watch | `SOL-PERP,BTC-PERP,ETH-PERP` |
| `CUREPAY_MIN_ANNUAL_FUNDING` | min annualised funding to act | `0.05` |
| `CUREPAY_MIN_FUNDING_Z` | min funding z-score to act | `1.0` |
| `CUREPAY_EQUITY_USD` | starting (simulated) equity | `10000` |
| `CUREPAY_MAX_LEVERAGE` | max gross notional / equity | `3` |
| `CUREPAY_RISK_PER_TRADE` | risk budget per trade | `0.02` |
| `CUREPAY_MAX_DRAWDOWN` | kill-switch drawdown from peak | `0.2` |
| `CUREPAY_POLL_SECONDS` | loop interval | `60` |

## Usage

```bash
# Funding-carry view across all watched markets
curepay markets

# Inspect one market in detail
curepay funding SOL-PERP

# Run the paper-trading agent (Ctrl-C to stop)
curepay run

# One tick and exit (useful for cron / smoke tests)
curepay run --once

# Stop after N ticks
curepay run --ticks 10
```

You can also run it as a module: `python -m curepay markets`.

## Data sources

- **Drift Data API** — `https://data.api.drift.trade` (read-only, no key). Primary source for funding & open interest.
- **Solana RPC** — cluster health check before acting.
- **CoinGecko** — independent spot price used as an index-price sanity fallback.

## Project layout

```
curepay/
  agent.py            # orchestration loop
  cli.py              # Rich CLI (markets / funding / run)
  data/               # Drift, Solana RPC, CoinGecko clients + models
  strategy/           # funding-carry signal generation
  risk/               # position sizing, limits, kill-switch
  execution/          # portfolio accounting + paper executor
  utils/              # config, logger, cache, rate_limiter, helpers
tests/                # unit tests + live (network-marked) smoke tests
```

## Development

```bash
pip install -e ".[dev]"
pytest -m "not network"   # fast unit tests
pytest -m network         # live smoke tests (auto-skip if APIs unreachable)
ruff check .
```

## License

MIT © nujar00t
