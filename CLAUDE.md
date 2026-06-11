# Curepay — project context

Funding-carry trading agent for Solana perpetual futures (Drift Protocol).
Read-only + paper-trading only. No signing keys, no on-chain transactions.

## What it is
- Pulls funding rates + open interest from Drift's public Data API (`data.api.drift.trade`).
- Runs a funding-rate **carry** strategy (short crowded longs / long crowded shorts to collect funding).
- Sizes via a risk manager (leverage cap, max positions, drawdown kill-switch).
- Executes in a paper simulator that accrues funding and marks PnL.

## Architecture
- `curepay/agent.py` — tick loop, fully dependency-injected (testable without network).
- `curepay/data/` — `drift.py` (DriftClient), `solana.py` (RPC health), `prices.py` (CoinGecko), `models.py`.
- `curepay/strategy/` — `funding_carry.py` + `signals.py` (Side/Signal).
- `curepay/risk/manager.py` — sizing + limits + kill-switch (pure, no I/O).
- `curepay/execution/` — `portfolio.py` (accounting), `paper.py` (sim fills + exit logic).
- `curepay/utils/` — config, logger (Rich), cache (TTL), rate_limiter (token bucket), helpers.
- `curepay/cli.py` — Rich CLI: `markets`, `funding <MARKET>`, `run [--once|--ticks N]`.

## Conventions
- Config via env (`CUREPAY_*`) loaded in `utils/config.py` → typed `Config` dataclass (validated).
- Only `mode=paper` is supported; `Config` rejects anything else by design.
- Data clients are defensive about Drift's shifting field names (`helpers.first_present`).
- Funding sign convention: longs pay shorts when funding > 0. Position cash flow = `-sign * notional * funding`.

## Testing
- `pytest -m "not network"` — unit tests (fakes/mocks, no I/O). All must stay green.
- `pytest -m network` — live smoke tests; auto-skip when APIs unreachable (don't mock these).
- Don't introduce real `time.sleep` into the agent loop in tests — use `poll_seconds=0`.

## Gotchas
- `data.api.drift.trade` may return 403 from some networks/sandboxes (Cloudflare/geo). The CLI/agent degrade gracefully; it works from normal egress.
- Funding normalisation from `/fundingRates`: `hourly = (fundingRate/1e9)/(oraclePriceTwap/1e6)`.

## Scope discipline
- Keep it read-only + paper. Do **not** add live order placement, key handling, or wallet signing.
