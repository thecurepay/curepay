from curepay.utils.helpers import (
    FUNDING_HOURS_PER_YEAR,
    annualize_hourly_funding,
    clamp,
    first_present,
    mean,
    safe_float,
    stdev,
    zscore,
)


def test_annualize_hourly_funding():
    assert annualize_hourly_funding(0.0001) == 0.0001 * FUNDING_HOURS_PER_YEAR


def test_mean_and_stdev():
    assert mean([]) == 0.0
    assert mean([2, 4, 6]) == 4.0
    assert stdev([5]) == 0.0
    assert round(stdev([2, 4, 6]), 4) == round((8 / 3) ** 0.5, 4)


def test_zscore():
    assert zscore(4, [4, 4, 4]) == 0.0  # no spread
    z = zscore(6, [2, 4, 6])
    assert z > 0


def test_clamp():
    assert clamp(5, 0, 10) == 5
    assert clamp(-1, 0, 10) == 0
    assert clamp(99, 0, 10) == 10


def test_safe_float():
    assert safe_float("1.5") == 1.5
    assert safe_float(None) == 0.0
    assert safe_float("nope", default=-1) == -1


def test_first_present():
    row = {"a": None, "b": 2, "c": 3}
    assert first_present(row, ["a", "b"]) == 2
    assert first_present(row, ["x", "y"], default="z") == "z"
