"""Typed configuration loaded from environment / .env."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv


def _get_float(key: str, default: float) -> float:
    raw = os.getenv(key)
    if raw is None or raw.strip() == "":
        return default
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError(f"{key} must be a number, got {raw!r}") from exc


def _get_int(key: str, default: int) -> int:
    return int(_get_float(key, float(default)))


def _get_str(key: str, default: str) -> str:
    raw = os.getenv(key)
    return raw if raw is not None and raw.strip() else default


def _get_list(key: str, default: list[str]) -> list[str]:
    raw = os.getenv(key)
    if not raw:
        return list(default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(slots=True)
class Config:
    """All runtime knobs for the agent. Validated on construction."""

    drift_api: str = "https://data.api.drift.trade"
    solana_rpc: str = "https://api.mainnet-beta.solana.com"
    coingecko_api: str = "https://api.coingecko.com/api/v3"

    markets: list[str] = field(default_factory=lambda: ["SOL-PERP", "BTC-PERP", "ETH-PERP"])

    min_annual_funding: float = 0.05
    min_funding_z: float = 1.0

    equity_usd: float = 10_000.0
    max_leverage: float = 3.0
    risk_per_trade: float = 0.02
    max_positions: int = 3
    max_drawdown: float = 0.2

    mode: str = "paper"
    poll_seconds: int = 60
    log_level: str = "INFO"

    def __post_init__(self) -> None:
        if self.mode != "paper":
            raise ValueError(
                f"unsupported mode {self.mode!r}: only 'paper' (simulation) is shipped"
            )
        if not 0 < self.risk_per_trade <= 1:
            raise ValueError("risk_per_trade must be in (0, 1]")
        if not 0 < self.max_drawdown <= 1:
            raise ValueError("max_drawdown must be in (0, 1]")
        if self.max_leverage <= 0:
            raise ValueError("max_leverage must be positive")
        if self.equity_usd <= 0:
            raise ValueError("equity_usd must be positive")
        if self.max_positions < 1:
            raise ValueError("max_positions must be >= 1")
        if not self.markets:
            raise ValueError("at least one market is required")


def load_config(env_file: str | None = None) -> Config:
    """Build a :class:`Config` from the environment (loading ``.env`` first)."""
    load_dotenv(dotenv_path=env_file, override=False)
    return Config(
        drift_api=_get_str("CUREPAY_DRIFT_API", "https://data.api.drift.trade").rstrip("/"),
        solana_rpc=_get_str("CUREPAY_SOLANA_RPC", "https://api.mainnet-beta.solana.com"),
        coingecko_api=_get_str("CUREPAY_COINGECKO_API", "https://api.coingecko.com/api/v3").rstrip("/"),
        markets=_get_list("CUREPAY_MARKETS", ["SOL-PERP", "BTC-PERP", "ETH-PERP"]),
        min_annual_funding=_get_float("CUREPAY_MIN_ANNUAL_FUNDING", 0.05),
        min_funding_z=_get_float("CUREPAY_MIN_FUNDING_Z", 1.0),
        equity_usd=_get_float("CUREPAY_EQUITY_USD", 10_000.0),
        max_leverage=_get_float("CUREPAY_MAX_LEVERAGE", 3.0),
        risk_per_trade=_get_float("CUREPAY_RISK_PER_TRADE", 0.02),
        max_positions=_get_int("CUREPAY_MAX_POSITIONS", 3),
        max_drawdown=_get_float("CUREPAY_MAX_DRAWDOWN", 0.2),
        mode=_get_str("CUREPAY_MODE", "paper"),
        poll_seconds=_get_int("CUREPAY_POLL_SECONDS", 60),
        log_level=_get_str("CUREPAY_LOG_LEVEL", "INFO"),
    )
