"""
core/dignity.py
===============
Planetary dignity & strength assessment (requirement #5):
    - exaltation / debilitation (with proximity to deep-exaltation degree)
    - own sign
    - combustion (too close to the Sun)
    - retrograde
    - declination direction & "out of bounds"
    - cardinal direction (dik) associated with the planet

These feed the prediction model's "dignity" component.
"""
from __future__ import annotations

from config import (COMBUSTION_ORB, EXALTATION_DEG, PLANET_DIRECTION,
                    SIGN_LORDS, SIGNS)
from core.ephemeris import angular_separation


def sign_of(longitude: float) -> str:
    return SIGNS[int((longitude % 360.0) // 30)]


def dignity(name: str, longitude: float, sun_longitude: float | None = None,
            retrograde: bool = False, declination: float = 0.0) -> dict:
    """
    Return a dignity report and a strength score in [-1, 1] where positive
    means the planet is strong/benefic in expression.
    """
    longitude %= 360.0
    sign = sign_of(longitude)
    score = 0.0
    flags = []

    # Exaltation / Debilitation -------------------------------------------
    state = "neutral"
    if name in EXALTATION_DEG:
        exalt = EXALTATION_DEG[name] % 360.0
        debil = (exalt + 180.0) % 360.0
        d_ex = angular_separation(longitude, exalt)
        d_de = angular_separation(longitude, debil)
        # within 15deg of the exact degree counts as exalted/debilitated zone
        if d_ex <= 15:
            state = "exalted"
            score += 0.8 * (1 - d_ex / 15.0) + 0.2
            flags.append("exalted")
        elif d_de <= 15:
            state = "debilitated"
            score -= 0.8 * (1 - d_de / 15.0) + 0.2
            flags.append("debilitated")

    # Own sign -------------------------------------------------------------
    own = SIGN_LORDS.get(sign) == name
    if own and state == "neutral":
        score += 0.4
        flags.append("own-sign")

    # Combustion -----------------------------------------------------------
    combust = False
    if sun_longitude is not None and name in COMBUSTION_ORB and name != "Sun":
        if angular_separation(longitude, sun_longitude) <= COMBUSTION_ORB[name]:
            combust = True
            score -= 0.35
            flags.append("combust")

    # Retrograde -----------------------------------------------------------
    if retrograde:
        # Retrograde planets give results in a delayed/reversed manner; we
        # dampen and slightly invert their expression.
        score *= 0.6
        score -= 0.15
        flags.append("retrograde")

    # Declination ----------------------------------------------------------
    out_of_bounds = abs(declination) > 23.45
    if out_of_bounds:
        flags.append("out-of-bounds")

    score = max(-1.0, min(1.0, score))

    return {
        "name": name,
        "sign": sign,
        "state": state,
        "own_sign": own,
        "combust": combust,
        "retrograde": retrograde,
        "declination": round(declination, 3),
        "declination_dir": "North" if declination >= 0 else "South",
        "out_of_bounds": out_of_bounds,
        "direction": PLANET_DIRECTION.get(name, "-"),
        "strength": round(score, 3),
        "flags": flags,
    }
