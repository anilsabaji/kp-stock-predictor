"""
core/ephemeris.py
=================
Thin wrapper around the Swiss Ephemeris (pyswisseph) providing KP-style
sidereal positions for all 9 grahas plus the Ascendant and house cusps.

For every body we expose (requirement #5):
    - sidereal longitude (KP / Krishnamurti ayanamsa)
    - latitude
    - longitudinal speed (deg/day)  -> retrograde when negative
    - declination (deg)             -> N/S of celestial equator
    - whether it is gaining or losing declination/speed (momentum)

The module is self-contained: it uses the Moshier analytical ephemeris
(FLG_MOSEPH) so NO external ephemeris data files are required.
"""
from __future__ import annotations

import datetime as dt
import math
from functools import lru_cache

import swisseph as swe

from config import IST_OFFSET_HOURS, MUMBAI_LAT, MUMBAI_LON

# Use Krishnamurti Paddhati ayanamsa for all sidereal calculations.
swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)

# Moshier ephemeris -> no data files needed; accurate to a few arcseconds.
_BASE_FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

_SWE_ID = {
    "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,   # Rahu = mean north node
}


def ist_to_jd(when_ist: dt.datetime) -> float:
    """Convert an IST (naive or aware) datetime to a Julian Day (UT)."""
    # Strip tzinfo and treat the wall-clock as IST.
    naive = when_ist.replace(tzinfo=None)
    ut = naive - dt.timedelta(hours=IST_OFFSET_HOURS)
    hour = ut.hour + ut.minute / 60.0 + ut.second / 3600.0
    return swe.julday(ut.year, ut.month, ut.day, hour)


def _calc(jd: float, swe_id: int, flags: int):
    """
    Call swe.calc_ut and return the position array, tolerating both the
    pyswisseph 2-tuple return (xx, retflag) and the pysweph 3-tuple return
    (xx, retflag, serr). xx is always the first element.
    """
    out = swe.calc_ut(jd, swe_id, flags)
    return out[0]


def _declination(jd: float, swe_id: int) -> float:
    """Equatorial declination of a body in degrees."""
    flags = swe.FLG_MOSEPH | swe.FLG_EQUATORIAL | swe.FLG_SPEED
    res = _calc(jd, swe_id, flags)
    return res[1]  # [RA, declination, dist, ...]


@lru_cache(maxsize=20000)
def _planet_raw(jd: float, name: str):
    """Return (lon, lat, speed_lon, decl) for a single planet at jd."""
    if name == "Ketu":
        # Ketu is exactly opposite Rahu.
        lon, lat, spd, _ = _planet_raw(jd, "Rahu")
        return ((lon + 180.0) % 360.0, -lat, spd, -_declination(jd, swe.MEAN_NODE))
    swe_id = _SWE_ID[name]
    res = _calc(jd, swe_id, _BASE_FLAGS)
    lon, lat, _dist, spd_lon = res[0], res[1], res[2], res[3]
    decl = _declination(jd, swe_id)
    return (lon % 360.0, lat, spd_lon, decl)


def planet_state(when_ist: dt.datetime, name: str, dlt_min: int = 10) -> dict:
    """
    Full state of one planet at an IST datetime.

    dlt_min: small forward step (minutes) used to detect whether declination
             and speed are increasing (momentum building) or decreasing.
    """
    jd = ist_to_jd(when_ist)
    lon, lat, spd, decl = _planet_raw(jd, name)

    jd2 = ist_to_jd(when_ist + dt.timedelta(minutes=dlt_min))
    _, _, spd2, decl2 = _planet_raw(jd2, name)

    return {
        "name": name,
        "longitude": lon,
        "latitude": lat,
        "speed": spd,                          # deg/day
        "retrograde": spd < 0,
        "declination": decl,
        "declination_dir": "North" if decl >= 0 else "South",
        "gaining_declination": abs(decl2) > abs(decl),
        "accelerating": abs(spd2) > abs(spd),
    }


def all_planets(when_ist: dt.datetime) -> dict:
    """State dict for all 9 grahas at an IST datetime."""
    from config import PLANETS
    return {p: planet_state(when_ist, p) for p in PLANETS}


def ascendant_and_cusps(when_ist: dt.datetime,
                        lat: float = MUMBAI_LAT,
                        lon: float = MUMBAI_LON):
    """
    Sidereal Ascendant longitude and the 12 Placidus house cusps (KP uses
    Placidus). Returns (asc_longitude, [cusp1..cusp12]).
    """
    jd = ist_to_jd(when_ist)
    # 'P' = Placidus. swe.houses_ex with SIDEREAL flag returns sidereal cusps.
    result = swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SIDEREAL)
    cusps, ascmc = result[0], result[1]
    asc = ascmc[0] % 360.0
    # pyswisseph returns a 12-item cusp tuple (cusp1..cusp12).
    # pysweph (>=2.10.3.4) returns a 13-item tuple where index 0 is empty and
    # cusps are at indices 1..12. Detect and normalise to exactly 12 values.
    if len(cusps) >= 13:
        cusp_vals = cusps[1:13]
    else:
        cusp_vals = cusps[:12]
    cusp_list = [c % 360.0 for c in cusp_vals]
    return asc, cusp_list


def house_of_longitude(longitude: float, cusps: list[float]) -> int:
    """Return the house number (1..12) that a given longitude falls in."""
    longitude %= 360.0
    for i in range(12):
        start = cusps[i]
        end = cusps[(i + 1) % 12]
        if start <= end:
            in_house = start <= longitude < end
        else:  # wrap around 360
            in_house = longitude >= start or longitude < end
        if in_house:
            return i + 1
    return 1


def angular_separation(a: float, b: float) -> float:
    """Smallest angle (0..180) between two longitudes."""
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)
