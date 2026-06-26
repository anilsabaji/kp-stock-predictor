"""
data/market_data.py
====================
Real-time & historical price access (requirements #4, #6).

Primary source: Yahoo Finance via yfinance (reliable worldwide; NSE equities
use the `SYMBOL.NS` suffix, indices use `^NSEI` etc.). Yahoo serves 1-minute
intraday bars for roughly the last 7 trading days, and daily bars for years of
history (used by the back-tester).

A best-effort direct NSE quote fetch is also provided for the latest price.
"""
from __future__ import annotations

import datetime as dt

import pandas as pd
import requests
import yfinance as yf


def _flatten(df: pd.DataFrame) -> pd.DataFrame:
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    return df


_INTRADAY_CACHE: dict = {}        # ticker -> (timestamp, dataframe)
_INTRADAY_TTL = 60                # seconds


def _intraday_df(yahoo_ticker: str):
    """Download (and briefly cache) the 7-day 1-minute frame, IST-localised."""
    import time
    now = time.time()
    hit = _INTRADAY_CACHE.get(yahoo_ticker)
    if hit and now - hit[0] < _INTRADAY_TTL:
        return hit[1]
    df = yf.download(yahoo_ticker, period="7d", interval="1m",
                     progress=False, auto_adjust=True)
    if df is None or len(df) == 0:
        _INTRADAY_CACHE[yahoo_ticker] = (now, None)
        return None
    df = _flatten(df).copy()
    try:
        df.index = df.index.tz_convert("Asia/Kolkata")
    except Exception:
        pass
    _INTRADAY_CACHE[yahoo_ticker] = (now, df)
    return df


def intraday(yahoo_ticker: str, day: dt.date | None = None) -> list[dict]:
    """
    1-minute bars for a given day (defaults to the most recent session
    available). Returns [{time, datetime, price, open, high, low, volume}].
    Only available for ~last 7 days from Yahoo.
    """
    df = _intraday_df(yahoo_ticker)
    if df is None or len(df) == 0:
        return []
    if day is not None:
        df = df[df.index.date == day]
    else:
        df = df[df.index.date == df.index.date.max()]

    out = []
    for ts, row in df.iterrows():
        out.append({
            "time": ts.strftime("%H:%M"),
            "datetime": ts.isoformat(),
            "price": float(row["Close"]),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0,
        })
    return out


def available_intraday_days(yahoo_ticker: str) -> list[str]:
    df = _intraday_df(yahoo_ticker)
    if df is None or len(df) == 0:
        return []
    return sorted({d.isoformat() for d in df.index.date})


def daily_history(yahoo_ticker: str, start: dt.date, end: dt.date) -> list[dict]:
    """Daily OHLC bars between start and end (inclusive) for back-testing."""
    df = yf.download(yahoo_ticker, start=start.isoformat(),
                     end=(end + dt.timedelta(days=1)).isoformat(),
                     interval="1d", progress=False, auto_adjust=True)
    if df is None or len(df) == 0:
        return []
    df = _flatten(df)
    out = []
    for ts, row in df.iterrows():
        out.append({
            "date": ts.date().isoformat(),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0,
        })
    return out


def latest_quote(symbol_row: dict) -> dict:
    """
    Best-effort latest price. Tries direct NSE first (most timely for Indian
    equities), then falls back to Yahoo's fast_info.
    """
    # Direct NSE (works from Indian IPs; gracefully degrades otherwise).
    if symbol_row.get("type") == "EQUITY":
        try:
            s = requests.Session()
            h = {"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9",
                 "Referer": "https://www.nseindia.com/"}
            s.get("https://www.nseindia.com", headers=h, timeout=4)
            url = ("https://www.nseindia.com/api/quote-equity?symbol="
                   + symbol_row["symbol"])
            r = s.get(url, headers=h, timeout=4)
            if r.ok:
                j = r.json()
                p = j.get("priceInfo", {})
                if p.get("lastPrice"):
                    return {"source": "NSE", "price": float(p["lastPrice"]),
                            "change": p.get("change"),
                            "pChange": p.get("pChange")}
        except Exception:
            pass
    # Yahoo fallback
    try:
        t = yf.Ticker(symbol_row["yahoo"])
        fi = t.fast_info
        return {"source": "Yahoo", "price": float(fi["last_price"]),
                "change": None, "pChange": None}
    except Exception as e:
        return {"source": "none", "price": None, "error": str(e)}
