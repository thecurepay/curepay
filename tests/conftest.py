"""Shared test fixtures and helpers."""

from __future__ import annotations

import httpx

from curepay.data.drift import DriftClient


def make_drift_client(handler) -> DriftClient:
    """Build a DriftClient backed by an httpx MockTransport handler."""
    transport = httpx.MockTransport(handler)
    client = httpx.Client(transport=transport, base_url="https://data.api.drift.trade")
    return DriftClient(client=client)
