"""Live smoke tests against public APIs.

Marked ``network`` and skipped automatically when the endpoints are unreachable
(CI without egress, geo-blocked sandboxes, etc.). Per project policy these hit
real data rather than mocks.
"""

from __future__ import annotations

import httpx
import pytest

from curepay.data.drift import DriftClient
from curepay.data.solana import SolanaRpcClient

pytestmark = pytest.mark.network


def _reachable(client_call) -> bool:
    try:
        client_call()
        return True
    except (httpx.HTTPError, RuntimeError):
        return False


def test_solana_rpc_live():
    rpc = SolanaRpcClient()
    try:
        if not _reachable(rpc.get_slot):
            pytest.skip("Solana RPC unreachable from this environment")
        assert rpc.get_slot() > 0
    finally:
        rpc.close()


def test_drift_contracts_live():
    drift = DriftClient()
    try:
        if not _reachable(drift.contracts):
            pytest.skip("Drift Data API unreachable from this environment")
        contracts = drift.contracts()
        assert len(contracts) > 0
        assert any(c.market.endswith("PERP") for c in contracts)
    finally:
        drift.close()
