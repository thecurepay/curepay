"""Small numeric/format helpers shared across modules."""

from __future__ import annotations

import math
from collections.abc import Iterable, Sequence

# Drift reports funding as an hourly rate. There are 24 * 365 funding hours/year.
FUNDING_HOURS_PER_YEAR = 24 * 365


def annualize_hourly_funding(hourly_rate: float) -> float:
    """Convert an hourly funding rate to a simple annualised rate."""
    return hourly_rate * FUNDING_HOURS_PER_YEAR


def mean(values: Sequence[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def stdev(values: Sequence[float]) -> float:
    """Population standard deviation (0.0 for fewer than two points)."""
    n = len(values)
    if n < 2:
        return 0.0
    mu = mean(values)
    variance = sum((v - mu) ** 2 for v in values) / n
    return math.sqrt(variance)


def zscore(value: float, history: Sequence[float]) -> float:
    """Z-score of ``value`` against ``history``. 0.0 when history has no spread."""
    sd = stdev(history)
    if sd == 0:
        return 0.0
    return (value - mean(history)) / sd


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def safe_float(value: object, default: float = 0.0) -> float:
    """Parse a value to float, tolerating strings, None and bad input."""
    if value is None:
        return default
    try:
        return float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return default


def first_present(mapping: dict, keys: Iterable[str], default: object = None) -> object:
    """Return the first key present (and non-None) in ``mapping``."""
    for key in keys:
        if key in mapping and mapping[key] is not None:
            return mapping[key]
    return default


def fmt_usd(amount: float) -> str:
    sign = "-" if amount < 0 else ""
    return f"{sign}${abs(amount):,.2f}"


def fmt_pct(fraction: float, decimals: int = 2) -> str:
    return f"{fraction * 100:.{decimals}f}%"
