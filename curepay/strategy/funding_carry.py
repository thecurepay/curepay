"""Funding-rate carry strategy.

Idea: on a perpetual future, the side that is "crowded" pays funding to the
other side. When funding is persistently positive (longs pay), a short collects
carry; when persistently negative (shorts pay), a long collects carry.

We only act when carry is both *large* (annualised funding above a floor) and
*unusual* relative to the market's own recent history (a funding z-score above a
floor). Conviction blends those two factors. This is a market-neutral-ish carry
view, not a directional momentum bet — risk sizing lives in :mod:`curepay.risk`.
"""

from __future__ import annotations

from curepay.data.drift import MarketContract
from curepay.data.models import FundingPoint, MarketSnapshot
from curepay.strategy.signals import Side, Signal
from curepay.utils.helpers import annualize_hourly_funding, clamp, zscore


class FundingCarryStrategy:
    def __init__(self, min_annual_funding: float = 0.05, min_funding_z: float = 1.0) -> None:
        self.min_annual_funding = min_annual_funding
        self.min_funding_z = min_funding_z

    def build_snapshot(
        self, contract: MarketContract, history: list[FundingPoint]
    ) -> MarketSnapshot:
        hourly = contract.hourly_funding
        hist_rates = [p.hourly_rate for p in history]
        return MarketSnapshot(
            market=contract.market,
            mark_price=contract.mark_price,
            index_price=contract.index_price,
            hourly_funding=hourly,
            annual_funding=annualize_hourly_funding(hourly),
            funding_z=zscore(hourly, hist_rates),
            open_interest=contract.open_interest,
            quote_volume_24h=contract.quote_volume_24h,
        )

    def evaluate(self, snap: MarketSnapshot) -> Signal:
        annual = snap.annual_funding
        z = snap.funding_z

        if abs(annual) < self.min_annual_funding or abs(z) < self.min_funding_z:
            return Signal(
                market=snap.market,
                side=Side.FLAT,
                conviction=0.0,
                annual_funding=annual,
                funding_z=z,
                reason=(
                    f"carry too small/ordinary (annual={annual:.2%}, z={z:.2f}; "
                    f"need >= {self.min_annual_funding:.0%} and |z| >= {self.min_funding_z})"
                ),
            )

        # Positive funding -> longs pay -> short collects carry, and vice versa.
        side = Side.SHORT if annual > 0 else Side.LONG

        # Conviction: blend how far past the funding floor we are with how far
        # past the z floor we are, each capped, then averaged into 0..1.
        mag_factor = clamp(abs(annual) / (self.min_annual_funding * 4), 0.0, 1.0)
        z_factor = clamp(abs(z) / (self.min_funding_z * 3), 0.0, 1.0)
        conviction = round((mag_factor + z_factor) / 2, 4)

        return Signal(
            market=snap.market,
            side=side,
            conviction=conviction,
            annual_funding=annual,
            funding_z=z,
            reason=(
                f"{'short' if side is Side.SHORT else 'long'} to collect carry: "
                f"annual funding {annual:.2%}, z={z:.2f}"
            ),
        )
