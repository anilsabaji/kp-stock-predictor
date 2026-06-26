"""
core/kp.py
==========
Krishnamurti Paddhati (KP) stellar system.

The defining feature of KP is the *sub-lord*: each 13deg20' nakshatra is split
into 9 unequal "subs" whose sizes are proportional to the Vimshottari dasha
years of the 9 planets, starting from the nakshatra (star) lord and following
the Vimshottari order. This yields 27 x 9 = 243 (commonly called the 249)
sub-divisions across the zodiac.

For any longitude we resolve the KP hierarchy (the "L1-L5" levels):
    sign lord  ->  star/nakshatra lord  ->  sub lord  ->  sub-sub lord
The sub lord is treated as the deciding planet in KP prediction.
"""
from __future__ import annotations

from config import (NAKSHATRA_LORDS, NAKSHATRAS, SIGN_LORDS, SIGNS,
                    VIMSHOTTARI_ORDER, VIMSHOTTARI_TOTAL, VIMSHOTTARI_YEARS)

NAK_SIZE = 360.0 / 27.0           # 13deg 20' = 13.3333 deg
PADA_SIZE = NAK_SIZE / 4.0


def _sub_divisions(start_lord: str):
    """
    Yield (lord, span_deg) for the 9 subs inside a nakshatra, starting from
    start_lord and following the Vimshottari order, each span proportional to
    the lord's dasha years.
    """
    idx = VIMSHOTTARI_ORDER.index(start_lord)
    for k in range(9):
        lord = VIMSHOTTARI_ORDER[(idx + k) % 9]
        span = VIMSHOTTARI_YEARS[lord] / VIMSHOTTARI_TOTAL * NAK_SIZE
        yield lord, span


def resolve(longitude: float) -> dict:
    """
    Full KP resolution of a sidereal longitude.

    Returns sign, sign_lord, nakshatra, star_lord (nakshatra lord), pada,
    sub_lord and sub_sub_lord.
    """
    longitude %= 360.0

    # Sign / Rasi
    sign_index = int(longitude // 30)
    sign = SIGNS[sign_index]
    sign_lord = SIGN_LORDS[sign]

    # Nakshatra & star lord
    nak_index = int(longitude // NAK_SIZE)
    nakshatra = NAKSHATRAS[nak_index]
    star_lord = NAKSHATRA_LORDS[nak_index]

    # Pada (quarter) 1..4
    pos_in_nak = longitude - nak_index * NAK_SIZE
    pada = int(pos_in_nak // PADA_SIZE) + 1

    # Sub lord
    sub_lord = None
    sub_start = 0.0
    acc = 0.0
    for lord, span in _sub_divisions(star_lord):
        if pos_in_nak < acc + span or abs(acc + span - NAK_SIZE) < 1e-9:
            sub_lord = lord
            sub_start = acc
            sub_span = span
            break
        acc += span
    else:  # numerical edge
        sub_lord, sub_start, sub_span = star_lord, 0.0, NAK_SIZE

    # Sub-sub lord (further subdivide the sub by Vimshottari proportions)
    pos_in_sub = pos_in_nak - sub_start
    sub_sub_lord = sub_lord
    acc2 = 0.0
    for lord, frac_span in _sub_divisions(sub_lord):
        span2 = frac_span * (sub_span / NAK_SIZE)
        if pos_in_sub < acc2 + span2:
            sub_sub_lord = lord
            break
        acc2 += span2

    return {
        "longitude": longitude,
        "sign": sign,
        "sign_lord": sign_lord,
        "nakshatra": nakshatra,
        "star_lord": star_lord,
        "pada": pada,
        "sub_lord": sub_lord,
        "sub_sub_lord": sub_sub_lord,
    }


def deg_to_dms(longitude: float) -> str:
    """Format a longitude as sign + deg/min/sec, e.g. 'Leo 12\u00b034\\'56\"'."""
    longitude %= 360.0
    sign = SIGNS[int(longitude // 30)]
    within = longitude % 30
    d = int(within)
    m_f = (within - d) * 60
    m = int(m_f)
    s = int((m_f - m) * 60)
    return f"{sign} {d:02d}\u00b0{m:02d}'{s:02d}\""
