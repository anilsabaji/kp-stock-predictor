"""
core/prediction.py
===================
The composite minute-by-minute prediction engine.

For each minute of an NSE session it computes a transparent "astro score"
in [-100, +100] (positive = bullish bias) by combining eight weighted
components (see config.SCORE_WEIGHTS):

    1. asc_sublord   - market polarity of the *moving* Ascendant sub-lord
                       (KP intraday driver; ascendant moves ~1deg / 4 min)
    2. moon_sublord  - polarity of the Moon's sub-lord (sentiment)
    3. transit_house - natal house occupied by transiting Moon (+fast planets)
    4. aspects       - net polarity of mundane aspects between transit planets
    5. dignity       - strength of fast planets (exalt/debil/combust/retro)
    6. panchanga     - tithi/yoga/karana bias
    7. dasha         - company Vimshottari maha/antar/pratyantar lord nature
    8. hora          - planetary hour + weekday (vara) lord polarity

The minute scores are then integrated into a synthetic "projected price path"
anchored at the day's opening price, so it can be overlaid directly on the
real price chart (requirement #4).

Each component returns a value in [-1, 1]. Combinations researched from KP /
financial-astrology literature are encoded as explicit rules and documented in
TECHNICAL_MANUAL.md.
"""
from __future__ import annotations

import datetime as dt
import itertools

from config import (ASPECTS, HOUSE_POLARITY, MARKET_CLOSE, MARKET_OPEN,
                    PLANET_POLARITY, PLANET_VOLATILITY, SCORE_WEIGHTS)
from core import dasha as dasha_mod
from core import dignity as dignity_mod
from core import panchanga as panchanga_mod
from core.ephemeris import (all_planets, angular_separation,
                            ascendant_and_cusps, house_of_longitude,
                            planet_state)
from core.kp import resolve

FAST_PLANETS = ["Moon", "Mercury", "Venus", "Sun", "Mars"]


# ---------------------------------------------------------------------------
# Individual scoring components (each returns float in [-1, 1])
# ---------------------------------------------------------------------------
def _polarity(planet: str) -> float:
    return PLANET_POLARITY.get(planet, 0.0)


def _asc_sublord_score(asc_lon: float) -> tuple[float, dict]:
    kp = resolve(asc_lon)
    # KP hierarchy weighting: sub lord decisive, then star lord, then sign lord.
    score = (0.55 * _polarity(kp["sub_lord"])
             + 0.30 * _polarity(kp["star_lord"])
             + 0.15 * _polarity(kp["sign_lord"]))
    return max(-1, min(1, score)), kp


def _moon_sublord_score(moon_lon: float) -> tuple[float, dict]:
    kp = resolve(moon_lon)
    score = (0.6 * _polarity(kp["sub_lord"])
             + 0.4 * _polarity(kp["star_lord"]))
    return max(-1, min(1, score)), kp


def _transit_house_score(planets: dict, cusps: list) -> float:
    """Natal/transit house occupancy of fast planets, weighted by speed."""
    total = 0.0
    wsum = 0.0
    for p in FAST_PLANETS:
        h = house_of_longitude(planets[p]["longitude"], cusps)
        w = PLANET_VOLATILITY.get(p, 0.5)
        total += HOUSE_POLARITY[h] * w
        wsum += w
    return (total / wsum) if wsum else 0.0


def _aspect_score(planets: dict) -> tuple[float, list]:
    """Net polarity of mundane aspects among the planets."""
    names = list(planets.keys())
    score = 0.0
    n = 0
    hits = []
    for a, b in itertools.combinations(names, 2):
        sep = angular_separation(planets[a]["longitude"], planets[b]["longitude"])
        for asp, cfg in ASPECTS.items():
            if abs(sep - cfg["angle"]) <= cfg["orb"]:
                pol = cfg["polarity"]
                if asp == "conjunction":
                    # conjunction polarity = average market nature of the pair
                    pol = (_polarity(a) + _polarity(b)) / 2.0
                # weight by closeness to exact
                tight = 1 - abs(sep - cfg["angle"]) / max(cfg["orb"], 1e-6)
                score += pol * tight
                n += 1
                hits.append({"a": a, "b": b, "aspect": asp,
                             "sep": round(sep, 2)})
                break
    avg = (score / n) if n else 0.0
    return max(-1, min(1, avg)), hits


def _dignity_score(planets: dict) -> tuple[float, list]:
    sun_lon = planets["Sun"]["longitude"]
    reports = []
    total = 0.0
    wsum = 0.0
    for p in FAST_PLANETS:
        st = planets[p]
        rep = dignity_mod.dignity(p, st["longitude"], sun_lon,
                                  st["retrograde"], st["declination"])
        reports.append(rep)
        w = PLANET_VOLATILITY.get(p, 0.5)
        # strength signed by the planet's market polarity sign
        total += rep["strength"] * (1 if _polarity(p) >= 0 else -1) * w
        wsum += w
    return (total / wsum if wsum else 0.0), reports


def _hora_score(when: dt.datetime, planets: dict) -> tuple[float, str]:
    """
    Planetary hour (hora). The day is split from sunrise; we approximate the
    hora using equal 60-min hours from market open, sequencing planets in the
    classical Chaldean order starting with the weekday lord.
    """
    from config import VARA_LORDS
    chaldean = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
    py = when.weekday()
    day_idx = (py + 1) % 7
    day_lord = VARA_LORDS[day_idx]
    # start hora at day lord, then follow Chaldean order
    start = chaldean.index(day_lord)
    # hours since ~06:00 sunrise approximation
    sunrise = when.replace(hour=6, minute=0, second=0, microsecond=0)
    hours = int((when - sunrise).total_seconds() // 3600)
    hora_lord = chaldean[(start + hours) % 7]
    score = 0.6 * _polarity(hora_lord) + 0.4 * _polarity(day_lord)
    return max(-1, min(1, score)), hora_lord


# ---------------------------------------------------------------------------
# Per-minute composite
# ---------------------------------------------------------------------------
def minute_score(when: dt.datetime, birth: dt.datetime,
                 detail: bool = False) -> dict:
    planets = all_planets(when)
    asc, cusps = ascendant_and_cusps(when)

    s_asc, asc_kp = _asc_sublord_score(asc)
    s_moon, moon_kp = _moon_sublord_score(planets["Moon"]["longitude"])
    s_house = _transit_house_score(planets, cusps)
    s_aspect, aspect_hits = _aspect_score(planets)
    s_dignity, dignity_reports = _dignity_score(planets)
    pan = panchanga_mod.compute(when)
    s_pan = pan["bias"]
    dsh = dasha_mod.current(birth, when)
    s_dasha = dsh["bias"]
    s_hora, hora_lord = _hora_score(when, planets)

    w = SCORE_WEIGHTS
    composite = (w["asc_sublord"] * s_asc
                 + w["moon_sublord"] * s_moon
                 + w["transit_house"] * s_house
                 + w["aspects"] * s_aspect
                 + w["dignity"] * s_dignity
                 + w["panchanga"] * s_pan
                 + w["dasha"] * s_dasha
                 + w["hora"] * s_hora)
    # weights sum to ~1; scale to [-100, 100]
    score = max(-100, min(100, composite * 100))

    # Expected intraday volatility from malefic/nodal volatility signatures.
    vol = sum(PLANET_VOLATILITY[p] for p in ["Mars", "Rahu", "Ketu"]
              if planets[p]["retrograde"] or True) / 3.0

    out = {
        "time": when.strftime("%H:%M"),
        "datetime": when.isoformat(),
        "score": round(score, 2),
        "ascendant": round(asc, 3),
        "asc_sub_lord": asc_kp["sub_lord"],
        "asc_star_lord": asc_kp["star_lord"],
        "asc_sign": asc_kp["sign"],
        "moon_sub_lord": moon_kp["sub_lord"],
        "hora_lord": hora_lord,
        "volatility": round(vol, 3),
        "components": {
            "asc_sublord": round(s_asc, 3),
            "moon_sublord": round(s_moon, 3),
            "transit_house": round(s_house, 3),
            "aspects": round(s_aspect, 3),
            "dignity": round(s_dignity, 3),
            "panchanga": round(s_pan, 3),
            "dasha": round(s_dasha, 3),
            "hora": round(s_hora, 3),
        },
    }
    if detail:
        out["aspect_hits"] = aspect_hits
        out["dignity_reports"] = dignity_reports
        out["panchanga"] = pan
        out["dasha"] = dsh
    return out


def _session_minutes(day: dt.date, step: int = 5):
    oh, om = map(int, MARKET_OPEN.split(":"))
    ch, cm = map(int, MARKET_CLOSE.split(":"))
    start = dt.datetime.combine(day, dt.time(oh, om))
    end = dt.datetime.combine(day, dt.time(ch, cm))
    t = start
    while t <= end:
        yield t
        t += dt.timedelta(minutes=step)


def predict_day(birth: dt.datetime, day: dt.date, step: int = 5,
                anchor_price: float = 100.0) -> dict:
    """
    Produce the full intraday prediction for one session.

    Returns a series of minute scores plus a synthetic projected price path
    (a normalised curve anchored at `anchor_price`) suitable for overlay on
    real prices.
    """
    series = [minute_score(t, birth) for t in _session_minutes(day, step)]

    # Build projected price path: integrate score into cumulative drift.
    # Scale chosen so a full session of max score ~= a few % move.
    price = anchor_price
    proj = []
    k = 0.00025  # drift sensitivity per score-unit per step
    for pt in series:
        price = price * (1 + k * (pt["score"] / 100.0) * step)
        proj.append(round(price, 4))

    # Daily summary
    avg = sum(p["score"] for p in series) / len(series)
    trend = "Bullish" if avg > 8 else "Bearish" if avg < -8 else "Sideways/Neutral"
    # Identify the strongest turning windows (local sign changes)
    turns = []
    for i in range(1, len(series)):
        if (series[i - 1]["score"] >= 0) != (series[i]["score"] >= 0):
            turns.append(series[i]["time"])

    return {
        "date": day.isoformat(),
        "step_minutes": step,
        "series": series,
        "projection": proj,
        "summary": {
            "avg_score": round(avg, 2),
            "trend": trend,
            "max_score": round(max(p["score"] for p in series), 2),
            "min_score": round(min(p["score"] for p in series), 2),
            "reversal_times": turns,
        },
    }
