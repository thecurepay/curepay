"""Minimal Solana JSON-RPC client for chain-health checks.

Used by the agent to confirm the cluster is live and reasonably current before
acting on market data. Read-only; no signing keys are ever used.
"""

from __future__ import annotations

import httpx

from curepay.utils.logger import get_logger
from curepay.utils.rate_limiter import RateLimiter

_log = get_logger("curepay.data.solana")


class SolanaRpcClient:
    def __init__(
        self,
        endpoint: str = "https://api.mainnet-beta.solana.com",
        *,
        timeout: float = 15.0,
        client: httpx.Client | None = None,
    ) -> None:
        self.endpoint = endpoint
        self._id = 0
        self._limiter = RateLimiter(rate=5, per=1.0)
        self._client = client or httpx.Client(
            timeout=timeout,
            headers={"Content-Type": "application/json"},
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> SolanaRpcClient:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()

    def _call(self, method: str, params: list | None = None):
        self._limiter.acquire()
        self._id += 1
        body = {"jsonrpc": "2.0", "id": self._id, "method": method, "params": params or []}
        resp = self._client.post(self.endpoint, json=body)
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise RuntimeError(f"Solana RPC error for {method}: {data['error']}")
        return data["result"]

    def get_slot(self) -> int:
        return int(self._call("getSlot"))

    def get_health(self) -> str:
        """Return ``"ok"`` when the node reports healthy."""
        try:
            return str(self._call("getHealth"))
        except RuntimeError:
            return "unhealthy"

    def is_healthy(self) -> bool:
        try:
            return self.get_slot() > 0
        except (httpx.HTTPError, RuntimeError) as exc:
            _log.warning("Solana RPC health check failed: %s", exc)
            return False
