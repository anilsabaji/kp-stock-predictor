"""
data/symbols.py
===============
Loads the full list of NSE-listed equities (requirement #1) and indices
(requirement #10), and provides autocomplete search by symbol code OR company
name (requirement #2).

The official NSE equity master (EQUITY_L.csv) includes the DATE OF LISTING,
which we use as each company's chart "birth" date (requirement #7).
"""
from __future__ import annotations

import csv
import datetime as dt
import os
import threading

import requests

from config import INDEX_BIRTH, INDICES

_HERE = os.path.dirname(__file__)
_CSV = os.path.join(_HERE, "EQUITY_L.csv")
_URL = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv"

_lock = threading.Lock()
_CACHE: list[dict] | None = None


def refresh_csv() -> bool:
    """(Re)download the NSE equity master. Returns True on success."""
    try:
        r = requests.get(_URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
        r.raise_for_status()
        with open(_CSV, "w", encoding="utf-8") as f:
            f.write(r.text)
        global _CACHE
        _CACHE = None
        return True
    except Exception as e:  # pragma: no cover
        print("symbol refresh failed:", e)
        return False


def _parse_date(s: str):
    s = (s or "").strip()
    for fmt in ("%d-%b-%Y", "%d-%m-%Y", "%Y-%m-%d"):
        try:
            return dt.datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _load() -> list[dict]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE
    with _lock:
        if _CACHE is not None:
            return _CACHE
        if not os.path.exists(_CSV):
            refresh_csv()
        rows = []
        # Equities
        if os.path.exists(_CSV):
            with open(_CSV, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                # normalise header keys (strip spaces)
                for raw in reader:
                    r = {k.strip(): (v.strip() if v else "") for k, v in raw.items()}
                    sym = r.get("SYMBOL", "")
                    if not sym:
                        continue
                    listing = _parse_date(r.get("DATE OF LISTING", ""))
                    rows.append({
                        "type": "EQUITY",
                        "symbol": sym,
                        "name": r.get("NAME OF COMPANY", ""),
                        "yahoo": f"{sym}.NS",
                        "listing_date": listing.isoformat() if listing else None,
                        "isin": r.get("ISIN NUMBER", ""),
                    })
        # Indices
        for name, ticker in INDICES.items():
            rows.append({
                "type": "INDEX",
                "symbol": name,
                "name": name,
                "yahoo": ticker,
                "listing_date": INDEX_BIRTH.get(name),
                "isin": "",
            })
        _CACHE = rows
        return _CACHE


def all_symbols() -> list[dict]:
    return _load()


def search(query: str, limit: int = 15) -> list[dict]:
    """Autocomplete: match against symbol code and company name."""
    q = (query or "").strip().lower()
    if not q:
        return []
    rows = _load()
    starts, contains = [], []
    for r in rows:
        sym = r["symbol"].lower()
        name = r["name"].lower()
        if sym.startswith(q) or name.startswith(q):
            starts.append(r)
        elif q in sym or q in name:
            contains.append(r)
    # Indices first when they match, then symbol-prefix, then contains.
    out = starts + contains
    return out[:limit]


def lookup(symbol: str) -> dict | None:
    """Exact lookup by symbol code or index display name (case-insensitive)."""
    s = (symbol or "").strip().lower()
    for r in _load():
        if r["symbol"].lower() == s or r["yahoo"].lower() == s:
            return r
    return None
