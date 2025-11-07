"""Utility helpers for converting USD-denominated amounts to INR for itinerary data."""

from __future__ import annotations

import re
from typing import Any, Dict

USD_TO_INR_RATE = 83.0


def usd_to_inr(amount: float | int | None) -> float:
    """Convert a numeric USD amount to INR using the configured exchange rate."""
    if amount is None:
        return 0.0
    try:
        value = float(amount)
    except (TypeError, ValueError):
        return 0.0
    return round(value * USD_TO_INR_RATE, 2)


def _format_inr_amount(amount: float) -> str:
    """Format a numeric amount into an INR string with thousands separators."""
    rounded = int(round(amount))
    return f"{rounded:,}"


_USD_PATTERN = re.compile(
    r"\$([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?(?:\s*-\s*[0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)?)"
)


def convert_currency_strings(data: Any) -> Any:
    """Recursively convert USD currency strings within nested data structures to INR."""

    if isinstance(data, dict):
        for key, value in list(data.items()):
            data[key] = convert_currency_strings(value)
        return data

    if isinstance(data, list):
        for index, item in enumerate(list(data)):
            data[index] = convert_currency_strings(item)
        return data

    if isinstance(data, str) and "$" in data:
        return _USD_PATTERN.sub(_replace_usd_match, data)

    return data


def _replace_usd_match(match: re.Match[str]) -> str:
    amount_text = match.group(1)
    parts = [part.strip() for part in amount_text.split("-")]
    converted_parts = []

    for part in parts:
        if not part:
            continue
        try:
            numeric_value = float(part.replace(",", ""))
        except ValueError:
            converted_parts.append(part)
            continue
        converted_value = numeric_value * USD_TO_INR_RATE
        converted_parts.append(_format_inr_amount(converted_value))

    if not converted_parts:
        return match.group(0)

    return "₹" + "-".join(converted_parts)


def convert_budget_estimate(itinerary: Dict[str, Any]) -> None:
    """Convert the top-level budget estimate to INR and annotate currency information."""

    if not isinstance(itinerary, dict):
        return

    budget_value = itinerary.get("budget_estimate")
    if isinstance(budget_value, (int, float)):
        itinerary["budget_estimate"] = usd_to_inr(budget_value)

    itinerary["currency"] = "INR"
    itinerary["budget_currency"] = "INR"

    if "budget_breakdown" in itinerary and isinstance(itinerary["budget_breakdown"], dict):
        _convert_budget_breakdown(itinerary["budget_breakdown"])


def _convert_budget_breakdown(breakdown: Dict[str, Any]) -> None:
    for key, value in breakdown.items():
        if isinstance(value, dict):
            _convert_budget_breakdown(value)
        elif isinstance(value, list):
            for index, item in enumerate(list(value)):
                if isinstance(item, (int, float)):
                    value[index] = usd_to_inr(item)
                elif isinstance(item, dict):
                    _convert_budget_breakdown(item)
        elif isinstance(value, (int, float)):
            breakdown[key] = usd_to_inr(value)


def convert_currency_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Convert all relevant currency information within an itinerary payload to INR."""

    if not payload:
        return payload

    convert_currency_strings(payload)

    itinerary = payload.get("itinerary")
    if isinstance(itinerary, dict):
        convert_budget_estimate(itinerary)

    return payload

