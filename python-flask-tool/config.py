"""
config.py
=========
Central configuration for the KP + Mundane Astrology Stock Prediction engine.

EVERY astrological constant, weight and rule used by the prediction model lives
here so it is fully transparent and tunable. The Technical Manual
(TECHNICAL_MANUAL.md) documents the meaning of each table below.

IMPORTANT DISCLAIMER
--------------------
Astrology-based market forecasting has NO scientific or statistical validity.
This software is an educational / astrological-research tool. Nothing it
produces is financial advice. Use the built-in back-tester to judge for
yourself how (poorly or otherwise) the astrological signal tracks real prices.
"""

# ---------------------------------------------------------------------------
# Birth-chart defaults for every NSE listing (requirement #7)
# ---------------------------------------------------------------------------
DEFAULT_BIRTH_TIME = "09:15"          # NSE market open
DEFAULT_PLACE = "Mumbai"
MUMBAI_LAT = 18.9388
MUMBAI_LON = 72.8354
IST_OFFSET_HOURS = 5.5                 # India Standard Time (UTC+5:30)

# NSE trading session (IST)
MARKET_OPEN = "09:15"
MARKET_CLOSE = "15:30"

# ---------------------------------------------------------------------------
# Planets
# ---------------------------------------------------------------------------
# The 9 grahas used in Vedic / KP astrology. (Rahu/Ketu are the lunar nodes.)
PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter",
           "Venus", "Saturn", "Rahu", "Ketu"]

# Vimshottari dasha years -> also define the proportional KP sub-divisions.
VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
VIMSHOTTARI_TOTAL = 120
# The fixed Vimshottari cycle order (used for nakshatra lords and sub-lords).
VIMSHOTTARI_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars",
                     "Rahu", "Jupiter", "Saturn", "Mercury"]

# ---------------------------------------------------------------------------
# Market polarity of each planet  (the heart of the prediction model)
# ---------------------------------------------------------------------------
# Range roughly -1 (strongly bearish) .. +1 (strongly bullish).
# Based on classical benefic/malefic nature applied to financial astrology:
#   Jupiter, Venus  -> expansion, optimism, liquidity  (bullish)
#   Mercury         -> trade/volume, mildly bullish
#   Moon            -> sentiment, neutral-positive (modulated by waxing/waning)
#   Sun             -> authority, mildly contracting intraday
#   Mars            -> volatility / sharp moves (treated mildly bearish trigger)
#   Saturn          -> contraction, fear, decline (bearish)
#   Rahu            -> speculation/mania then crash (net bearish, high volatility)
#   Ketu            -> sudden drops, detachment (bearish)
PLANET_POLARITY = {
    "Jupiter": 1.00,
    "Venus":   0.80,
    "Mercury": 0.45,
    "Moon":    0.35,
    "Sun":    -0.15,
    "Mars":   -0.55,
    "Saturn": -0.80,
    "Rahu":   -0.70,
    "Ketu":   -0.60,
}

# How strongly each planet's *volatility* signature contributes (0..1).
# Used to widen the predicted intraday range.
PLANET_VOLATILITY = {
    "Sun": 0.3, "Moon": 0.5, "Mars": 1.0, "Mercury": 0.6, "Jupiter": 0.3,
    "Venus": 0.3, "Saturn": 0.5, "Rahu": 1.0, "Ketu": 0.9,
}

# ---------------------------------------------------------------------------
# Signs (Rasi) and their lords
# ---------------------------------------------------------------------------
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

SIGN_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn",
    "Pisces": "Jupiter",
}

# ---------------------------------------------------------------------------
# Exaltation / Debilitation (requirement #5)
# Values are the exact sidereal degree of deep exaltation.
# Debilitation is exactly 180 degrees opposite.
# ---------------------------------------------------------------------------
EXALTATION_DEG = {
    "Sun": 10.0,        # Aries 10
    "Moon": 33.0,       # Taurus 3
    "Mars": 298.0,      # Capricorn 28
    "Mercury": 165.0,   # Virgo 15
    "Jupiter": 95.0,    # Cancer 5
    "Venus": 357.0,     # Pisces 27
    "Saturn": 200.0,    # Libra 20
    # Rahu/Ketu exaltation is debated; commonly Taurus/Scorpio.
    "Rahu": 50.0,       # Taurus 20 (one common convention)
    "Ketu": 230.0,      # Scorpio 20
}

# Own-sign rulership reuses SIGN_LORDS. Moolatrikona handled approximately
# via own sign in dignity.py.

# ---------------------------------------------------------------------------
# 27 Nakshatras and their ruling planets (Vimshottari lords)
# ---------------------------------------------------------------------------
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
    "Revati",
]
# Nakshatra lords cycle through the Vimshottari order, starting Ketu.
NAKSHATRA_LORDS = [VIMSHOTTARI_ORDER[i % 9] for i in range(27)]

# ---------------------------------------------------------------------------
# Tithi / Karana / Yoga reference tables (Panchanga)
# ---------------------------------------------------------------------------
TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima/Amavasya",
]
YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
]
# Auspicious (benefic) yogas lend a bullish bias, inauspicious a bearish bias.
INAUSPICIOUS_YOGAS = {"Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata",
                      "Vajra", "Vyatipata", "Parigha", "Vaidhriti"}

KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija",
                "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]
# Vishti (Bhadra) karana is considered inauspicious -> bearish bias.

VARA_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
# index 0 = Sunday ... 6 = Saturday  (Python weekday(): Mon=0 -> handled in code)

# ---------------------------------------------------------------------------
# House significations for speculation / markets (KP)
# ---------------------------------------------------------------------------
# Houses counted from the chart ascendant. Positive houses favour rising
# prices, negative houses favour falling prices.
BULLISH_HOUSES = {2, 5, 9, 10, 11}     # wealth, speculation, fortune, gains
BEARISH_HOUSES = {6, 8, 12}            # debt, loss, expenditure
# Houses 1,3,4,7 are treated as neutral/contextual.

HOUSE_POLARITY = {}
for _h in range(1, 13):
    if _h in BULLISH_HOUSES:
        HOUSE_POLARITY[_h] = 1.0
    elif _h in BEARISH_HOUSES:
        HOUSE_POLARITY[_h] = -1.0
    else:
        HOUSE_POLARITY[_h] = 0.0

# ---------------------------------------------------------------------------
# Aspects (mundane) — angular separations between transiting planets.
# orb = allowed deviation in degrees. polarity = effect on market mood.
# ---------------------------------------------------------------------------
ASPECTS = {
    "conjunction": {"angle": 0,   "orb": 8, "polarity": 0.0},   # depends on planets
    "sextile":     {"angle": 60,  "orb": 4, "polarity": 0.6},   # harmonious
    "square":      {"angle": 90,  "orb": 6, "polarity": -0.8},  # tension
    "trine":       {"angle": 120, "orb": 6, "polarity": 1.0},   # very harmonious
    "opposition":  {"angle": 180, "orb": 8, "polarity": -0.7},  # conflict
}

# ---------------------------------------------------------------------------
# Weights for the composite minute-by-minute score.
# Each component returns a value in [-1, 1]; final score = weighted sum,
# then scaled to [-100, 100]. Tunable; documented in the manual.
# ---------------------------------------------------------------------------
SCORE_WEIGHTS = {
    "asc_sublord":     0.26,   # KP moving-ascendant sub-lord (primary intraday)
    "moon_sublord":    0.16,   # Moon's sub-lord (sentiment)
    "transit_house":   0.12,   # which natal house transiting Moon/fast planets hit
    "aspects":         0.12,   # mundane aspects between transiting planets
    "dignity":         0.10,   # exaltation/debilitation/retro of fast planets
    "panchanga":       0.08,   # tithi/yoga/karana bias
    "dasha":           0.10,   # company Vimshottari dasha-bhukti lord nature
    "hora":            0.06,   # planetary hour (mundane day/hour lord)
}

# Combustion orb (degrees from Sun) — planet considered "combust" / weakened.
COMBUSTION_ORB = {
    "Moon": 12.0, "Mars": 17.0, "Mercury": 14.0, "Jupiter": 11.0,
    "Venus": 10.0, "Saturn": 15.0,
}

# 8 cardinal/intercardinal directions associated with planets (Vastu/dik).
PLANET_DIRECTION = {
    "Sun": "East", "Venus": "Southeast", "Mars": "South", "Rahu": "Southwest",
    "Saturn": "West", "Moon": "Northwest", "Mercury": "North",
    "Jupiter": "Northeast", "Ketu": "Center",
}

# Major Indices (requirement #10). Maps display name -> Yahoo Finance ticker.
INDICES = {
    "NIFTY 50": "^NSEI",
    "NIFTY BANK (Bank Nifty)": "^NSEBANK",
    "NIFTY NEXT 50": "^NSMIDCP",
    "NIFTY 100": "^CNX100",
    "NIFTY 500": "^CRSLDX",
    "NIFTY MIDCAP 50": "^NSEMDCP50",
    "NIFTY IT": "^CNXIT",
    "NIFTY FMCG": "^CNXFMCG",
    "NIFTY PHARMA": "^CNXPHARMA",
    "NIFTY AUTO": "^CNXAUTO",
    "NIFTY METAL": "^CNXMETAL",
    "NIFTY REALTY": "^CNXREALTY",
    "NIFTY ENERGY": "^CNXENERGY",
    "NIFTY FIN SERVICE": "NIFTY_FIN_SERVICE.NS",
    "INDIA VIX": "^INDIAVIX",
}
# Listing/inception dates for indices used as their "birth" chart.
INDEX_BIRTH = {
    "NIFTY 50": "1996-04-22",
    "NIFTY BANK (Bank Nifty)": "2000-09-15",
    "NIFTY NEXT 50": "1996-11-04",
    "NIFTY 100": "2003-01-01",
    "NIFTY 500": "1999-06-07",
    "NIFTY MIDCAP 50": "2004-09-01",
    "NIFTY IT": "1996-01-01",
    "NIFTY FMCG": "1996-01-01",
    "NIFTY PHARMA": "2001-01-01",
    "NIFTY AUTO": "2004-01-01",
    "NIFTY METAL": "2004-01-01",
    "NIFTY REALTY": "2007-01-01",
    "NIFTY ENERGY": "2001-01-01",
    "NIFTY FIN SERVICE": "2004-01-01",
    "INDIA VIX": "2008-03-03",
}
