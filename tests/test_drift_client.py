import httpx

from curepay.data.drift import FUNDING_RATE_PRECISION, PRICE_PRECISION
from tests.conftest import make_drift_client


def _handler(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/contracts":
        return httpx.Response(
            200,
            json={
                "contracts": [
                    {
                        "ticker_id": "SOL-PERP",
                        "last_price": "150.5",
                        "index_price": "150.0",
                        "funding_rate": "0.0001",
                        "open_interest": "12345.6",
                        "quote_volume": "9000000",
                    }
                ]
            },
        )
    if request.url.path == "/fundingRates":
        twap = 150.0 * PRICE_PRECISION
        # hourly rate of 0.0002 -> raw fundingRate = 0.0002 * twap_scaled * 1e9 / 1e6 ...
        # construct so that (raw/1e9)/(twap/1e6) == 0.0002
        raw = 0.0002 * (twap / PRICE_PRECISION) * FUNDING_RATE_PRECISION
        return httpx.Response(
            200,
            json={
                "fundingRates": [
                    {"ts": 1000, "fundingRate": str(raw), "oraclePriceTwap": str(twap)},
                    {"ts": 900, "fundingRate": str(raw / 2), "oraclePriceTwap": str(twap)},
                ]
            },
        )
    return httpx.Response(404)


def test_contracts_parsing():
    drift = make_drift_client(_handler)
    contract = drift.contract("SOL-PERP")
    assert contract is not None
    assert contract.market == "SOL-PERP"
    assert contract.mark_price == 150.5
    assert contract.index_price == 150.0
    assert contract.hourly_funding == 0.0001
    assert contract.open_interest == 12345.6


def test_contract_lookup_case_insensitive():
    drift = make_drift_client(_handler)
    assert drift.contract("sol-perp") is not None
    assert drift.contract("DOGE-PERP") is None


def test_funding_history_normalisation():
    drift = make_drift_client(_handler)
    history = drift.funding_history("SOL-PERP")
    assert len(history) == 2
    # newest last, normalised back to hourly fraction.
    assert history[-1].ts == 1000
    assert round(history[-1].hourly_rate, 6) == 0.0002
