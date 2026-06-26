"""
core/dasha.py
=============
Vimshottari Dasha (requirement #8).

The 120-year Vimshottari cycle is anchored on the Moon's nakshatra at the
chart's birth (for a stock: NSE listing date, 09:15 IST, Mumbai). We compute
the running Mahadasha (major period) and Antardasha/Bhukti (sub-period) for any
later date, and expose the nature of the period lords to the prediction model.
"""
from __future__ import annotations

import datetime as dt

from config import VIMSHOTTARI_ORDER, VIMSHOTTARI_TOTAL, VIMSHOTTARI_YEARS
from core.ephemeris import planet_state

NAK_SIZE = 360.0 / 27.0
DAYS_PER_YEAR = 365.25


def _moon_nakshatra_fraction(birth_ist: dt.datetime):
    """Return (nakshatra_lord, fraction_elapsed_in_nakshatra)."""
    moon = planet_state(birth_ist, "Moon")["longitude"]
    nak_idx = int(moon // NAK_SIZE)
    lord = VIMSHOTTARI_ORDER[nak_idx % 9]
    frac = (moon - nak_idx * NAK_SIZE) / NAK_SIZE
    return lord, frac


def _maha_sequence(start_lord: str):
    idx = VIMSHOTTARI_ORDER.index(start_lord)
    return [VIMSHOTTARI_ORDER[(idx + i) % 9] for i in range(9)]


def timeline(birth_ist: dt.datetime):
    """
    Build the list of Mahadasha periods as
    [(lord, start_datetime, end_datetime), ...] spanning 120 years.
    """
    lord, frac = _moon_nakshatra_fraction(birth_ist)
    seq = _maha_sequence(lord)

    periods = []
    # The first mahadasha is already partly elapsed at birth.
    first_years = VIMSHOTTARI_YEARS[lord]
    balance = first_years * (1 - frac)
    cursor = birth_ist
    # Record first (balance) period.
    end = cursor + dt.timedelta(days=balance * DAYS_PER_YEAR)
    periods.append((lord, cursor, end))
    cursor = end
    for l in seq[1:]:
        yrs = VIMSHOTTARI_YEARS[l]
        end = cursor + dt.timedelta(days=yrs * DAYS_PER_YEAR)
        periods.append((l, cursor, end))
        cursor = end
    return periods


def _antardashas(maha_lord: str, start: dt.datetime, end: dt.datetime):
    """Sub-periods within a mahadasha, proportional to Vimshottari years."""
    total_days = (end - start).total_seconds() / 86400.0
    seq = _maha_sequence(maha_lord)
    out = []
    cursor = start
    for l in seq:
        portion = VIMSHOTTARI_YEARS[l] / VIMSHOTTARI_TOTAL
        d = total_days * portion
        e = cursor + dt.timedelta(days=d)
        out.append((l, cursor, e))
        cursor = e
    return out


def current(birth_ist: dt.datetime, when_ist: dt.datetime) -> dict:
    """
    Return the running Mahadasha / Antardasha (Bhukti) / Pratyantardasha lords
    at `when_ist`, with a combined market-nature bias.
    """
    from config import PLANET_POLARITY

    tl = timeline(birth_ist)
    maha = None
    for lord, s, e in tl:
        if s <= when_ist < e:
            maha = (lord, s, e)
            break
    if maha is None:
        # beyond 120y -> wrap by recomputing from a shifted birth (rare)
        maha = tl[-1]

    maha_lord, ms, me = maha
    antars = _antardashas(maha_lord, ms, me)
    antar = next((a for a in antars if a[1] <= when_ist < a[2]), antars[-1])
    antar_lord, as_, ae = antar

    praty = _antardashas(antar_lord, as_, ae)
    praty_lord = next((p[0] for p in praty if p[1] <= when_ist < p[2]),
                      praty[-1][0])

    # Composite nature: maha dominates, then antar, then pratyantar.
    bias = (0.5 * PLANET_POLARITY[maha_lord]
            + 0.3 * PLANET_POLARITY[antar_lord]
            + 0.2 * PLANET_POLARITY[praty_lord])

    return {
        "maha_lord": maha_lord,
        "maha_start": ms.date().isoformat(),
        "maha_end": me.date().isoformat(),
        "antar_lord": antar_lord,
        "antar_start": as_.date().isoformat(),
        "antar_end": ae.date().isoformat(),
        "pratyantar_lord": praty_lord,
        "bias": round(max(-1.0, min(1.0, bias)), 3),
    }
