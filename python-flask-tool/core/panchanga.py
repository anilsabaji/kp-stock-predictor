"""
core/panchanga.py
=================
The five limbs of the Hindu almanac (Panchanga), required by #5:
    Tithi, Vara (weekday), Nakshatra, Yoga, Karana.

All derived from the sidereal Sun and Moon longitudes.
"""
from __future__ import annotations

import datetime as dt

from config import (INAUSPICIOUS_YOGAS, KARANA_NAMES, NAKSHATRA_LORDS,
                    NAKSHATRAS, TITHI_NAMES, VARA_LORDS, YOGA_NAMES)
from core.ephemeris import planet_state

NAK_SIZE = 360.0 / 27.0


def _vara(when_ist: dt.datetime):
    """Weekday lord. Hindu day starts at sunrise; we approximate with the
    civil date (good enough during market hours, well after sunrise)."""
    # Python weekday(): Mon=0..Sun=6 ; our VARA_LORDS index: Sun=0..Sat=6
    py = when_ist.weekday()
    idx = (py + 1) % 7  # convert Mon=0 -> Sun=0
    names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
             "Friday", "Saturday"]
    return names[idx], VARA_LORDS[idx]


def compute(when_ist: dt.datetime) -> dict:
    sun = planet_state(when_ist, "Sun")["longitude"]
    moon = planet_state(when_ist, "Moon")["longitude"]

    # --- Tithi: 12deg increments of (Moon - Sun) ------------------------
    diff = (moon - sun) % 360.0
    tithi_num = int(diff // 12)            # 0..29
    paksha = "Shukla (waxing)" if tithi_num < 15 else "Krishna (waning)"
    tithi_name = TITHI_NAMES[tithi_num % 15]
    tithi_full = f"{paksha.split()[0]} {tithi_name}"

    # --- Nakshatra (of the Moon) ----------------------------------------
    nak_idx = int(moon // NAK_SIZE)
    nak = NAKSHATRAS[nak_idx]
    nak_lord = NAKSHATRA_LORDS[nak_idx]

    # --- Yoga: (Sun + Moon) / 13deg20' ----------------------------------
    yoga_idx = int(((sun + moon) % 360.0) // NAK_SIZE)
    yoga = YOGA_NAMES[yoga_idx]

    # --- Karana: half-tithi (6deg increments of Moon-Sun) ---------------
    karana_index = int(diff // 6)          # 0..59
    karana = _karana_name(karana_index)

    # --- Vara ------------------------------------------------------------
    vara_name, vara_lord = _vara(when_ist)

    # --- Bias for the prediction model ----------------------------------
    bias = 0.0
    # Waxing moon = growth/optimism (bullish); waning = contraction.
    bias += 0.4 if tithi_num < 15 else -0.4
    # Inauspicious yoga -> bearish.
    if yoga in INAUSPICIOUS_YOGAS:
        bias -= 0.3
    else:
        bias += 0.15
    # Vishti (Bhadra) karana -> inauspicious.
    if karana == "Vishti":
        bias -= 0.3
    bias = max(-1.0, min(1.0, bias))

    return {
        "tithi": tithi_full,
        "tithi_num": tithi_num + 1,
        "paksha": paksha,
        "vara": vara_name,
        "vara_lord": vara_lord,
        "nakshatra": nak,
        "nakshatra_lord": nak_lord,
        "yoga": yoga,
        "yoga_auspicious": yoga not in INAUSPICIOUS_YOGAS,
        "karana": karana,
        "bias": round(bias, 3),
    }


def _karana_name(index: int) -> str:
    """
    There are 11 karanas across the 60 half-tithis of a lunar month.
    The first half of Shukla Pratipada is the fixed karana 'Kimstughna';
    then the 7 movable karanas (Bava..Vishti) repeat 8 times; the last
    three (Shakuni, Chatushpada, Naga) are fixed at the month's end.
    """
    if index == 0:
        return "Kimstughna"
    if index >= 57:
        return ["Shakuni", "Chatushpada", "Naga"][index - 57]
    movable = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"]
    return movable[(index - 1) % 7]
