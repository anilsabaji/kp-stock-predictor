═══════════════════════════════════════════════════════════════════
          KP ASTROLOGY STOCK PREDICTOR - NSE INDIA
       COMPLETE TECHNICAL & USER MANUAL (v1.0.0)
═══════════════════════════════════════════════════════════════════

Document Version: 1.0.0
Date: June 2026
Platform: Web Application + Android App (PWA / React Native)



═══════════════════════════════════════════════════════════════════
                    TABLE OF CONTENTS
═══════════════════════════════════════════════════════════════════

PART I   - INTRODUCTION & OVERVIEW
  1.1  About This Application
  1.2  System Architecture
  1.3  Data Sources

PART II  - KP ASTROLOGY FUNDAMENTALS
  2.1  What is Krishnamurti Paddhati (KP)?
  2.2  The 5-Level Sub-Division System
  2.3  Vimshottari Dasha Proportions
  2.4  Zodiac Signs and Their Rulers
  2.5  27 Nakshatras (Lunar Mansions)
  2.6  Placidus House System
  2.7  Lahiri Ayanamsa

PART III - PREDICTION PARAMETERS & SIGNIFICATIONS
  3.1  Nine Planets - Market Natures & Weights
  3.2  KP Level Weights in Composite Score
  3.3  Moon House Position Scoring
  3.4  Transit Aspect Scoring
  3.5  Signal Generation Logic
  3.6  House Significations for Stock Market

PART IV  - MUMBAI TRANSIT ENGINE
  4.1  NSE Location Coordinates
  4.2  Ascendant (Lagna) Calculation
  4.3  Sidereal Time & Local Mean Time
  4.4  Daily Transit Report Structure
  4.5  Key Market Transit Identification

PART V   - COMPANY HOROSCOPE SYSTEM
  5.1  Incorporation Date as Birth Time
  5.2  Natal Chart Generation
  5.3  Transit-to-Natal Aspect Analysis
  5.4  Aspect Types and Orbs

PART VI  - USER GUIDE
  6.1  Web Application Usage
  6.2  Android App Installation
  6.3  Reading the Prediction Chart
  6.4  Understanding Signals
  6.5  Best Practices for Trading

PART VII - TECHNICAL REFERENCE
  7.1  API Endpoints
  7.2  Calculation Formulas
  7.3  Data Update Frequency
  7.4  Limitations & Disclaimer




═══════════════════════════════════════════════════════════════════
     PART I - INTRODUCTION & OVERVIEW
═══════════════════════════════════════════════════════════════════

1.1 ABOUT THIS APPLICATION
───────────────────────────────────────────────────────────────────

The KP Stock Predictor is a financial analysis tool that applies
Krishnamurti Paddhati (KP) Astrology methodology to predict
intraday stock market movements on the National Stock Exchange
(NSE) of India.

The system generates minute-level buy/sell/neutral signals by
analyzing planetary transit positions calculated specifically for
Mumbai (the location of NSE) using the Placidus house system
and Lahiri Ayanamsa as prescribed by the KP method.

Key Capabilities:
  • 5-Level KP analysis (Planet → Sign Lord → Star Lord → Sub Lord → Prana Lord)
  • Real-time stock prices from NSE via Yahoo Finance
  • Company horoscopes based on incorporation dates
  • Transit-to-natal aspect analysis
  • Mumbai-specific Ascendant and house calculations
  • Live news feed with sentiment analysis
  • Minute-level prediction timeline (5-minute intervals)


1.2 SYSTEM ARCHITECTURE
───────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────┐
│                    USER INTERFACE                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Stock List│  │KP Chart/Pred │  │  News Panel  │  │
│  │(Left)    │  │(Center)      │  │  (Right)     │  │
│  └──────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────┐
│                   API LAYER (Express.js)              │
│  /api/nse/*  │  /api/kp/*  │  /api/news/*           │
└──────┬───────────────┬──────────────┬───────────────┘
       │               │              │
┌──────┴───┐   ┌───────┴──────┐  ┌───┴─────────┐
│Yahoo Fin.│   │  KP Engine   │  │Google News  │
│  (NSE)   │   │(Calculations)│  │   RSS       │
└──────────┘   └──────────────┘  └─────────────┘


1.3 DATA SOURCES
───────────────────────────────────────────────────────────────────

┌────────────────────┬──────────────────────────────────────────┐
│ Data Type          │ Source                                   │
├────────────────────┼──────────────────────────────────────────┤
│ Stock Prices       │ Yahoo Finance API (*.NS suffix)          │
│ Intraday Data      │ Yahoo Finance (1-min intervals)          │
│ Company Info       │ Curated database (50 NSE companies)      │
│ Incorporation Dates│ NSE/MCA filings (manually verified)      │
│ Planetary Positions│ Calculated (Astronomical formulas)       │
│ News Articles      │ Google News RSS (India edition)          │
│ Ayanamsa           │ Lahiri (computed from Julian Day)        │
└────────────────────┴──────────────────────────────────────────┘




═══════════════════════════════════════════════════════════════════
     PART II - KP ASTROLOGY FUNDAMENTALS
═══════════════════════════════════════════════════════════════════

2.1 WHAT IS KRISHNAMURTI PADDHATI (KP)?
───────────────────────────────────────────────────────────────────

Krishnamurti Paddhati (KP) is a system of Vedic astrology developed
by Prof. K.S. Krishnamurti (1908-1972). It refines traditional
Vedic astrology by introducing a precise sub-division system
based on the Vimshottari Dasha proportions.

Key innovations of KP over traditional Vedic astrology:
  • Uses Placidus house system (not Equal houses)
  • Uses Lahiri Ayanamsa for sidereal corrections
  • Introduces Sub-Lord as the decisive factor
  • Focuses on cuspal sub-lords for predictions
  • Provides more precise timing of events

In stock market context, KP is used to:
  • Determine bullish/bearish periods based on planetary rulers
  • Time entry/exit points using finest sub-divisions
  • Assess company strength via natal chart analysis
  • Identify key transit influences on market days


2.2 THE 5-LEVEL SUB-DIVISION SYSTEM
───────────────────────────────────────────────────────────────────

The zodiac (360°) is divided into progressively finer levels:

┌────────┬────────────────┬─────────────┬────────────────────────┐
│ Level  │ Name           │ Span        │ Role in Prediction     │
├────────┼────────────────┼─────────────┼────────────────────────┤
│ L1     │ Planet         │ Variable    │ Primary sentiment      │
│        │                │             │ indicator              │
├────────┼────────────────┼─────────────┼────────────────────────┤
│ L2     │ Sign Lord      │ 30°         │ Broad zodiac influence;│
│        │ (Rashi Lord)   │ (per sign)  │ sets the environment   │
├────────┼────────────────┼─────────────┼────────────────────────┤
│ L3     │ Star Lord      │ 13°20'      │ Major directional      │
│        │ (Nakshatra     │ (per nak.)  │ force; primary ruler   │
│        │  Lord)         │             │ of outcomes            │
├────────┼────────────────┼─────────────┼────────────────────────┤
│ L4     │ Sub Lord       │ Variable    │ DECISIVE factor;       │
│        │                │ (Dasha      │ confirms or denies     │
│        │                │  proportion)│ the Star Lord          │
├────────┼────────────────┼─────────────┼────────────────────────┤
│ L5     │ Prana Lord     │ Variable    │ Finest timing trigger; │
│        │ (Sub-Sub Lord) │ (finest     │ pinpoints exact moment │
│        │                │  division)  │ of activation          │
└────────┴────────────────┴─────────────┴────────────────────────┘

Division Hierarchy:
  360° → 12 Signs (30° each)
       → 27 Nakshatras (13°20' each)
       → 9 Sub-divisions per Nakshatra (Dasha proportional)
       → 9 Sub-Sub per Sub (further Dasha proportional)
       → 9 Prana per Sub-Sub (finest Dasha proportional)


2.3 VIMSHOTTARI DASHA PROPORTIONS
───────────────────────────────────────────────────────────────────

The Vimshottari Dasha system spans 120 years total, distributed
among 9 planets. These proportions are used to divide each
Nakshatra into sub-divisions:

┌───────────┬────────┬────────────┬──────────────────────────────┐
│ Planet    │ Years  │ Proportion │ Sub-Span per Nakshatra       │
│           │        │ (of 120)   │ (13.333° × proportion)       │
├───────────┼────────┼────────────┼──────────────────────────────┤
│ Ketu      │   7    │  5.833%    │ 0°46'40" (0.7778°)           │
│ Venus     │  20    │ 16.667%    │ 2°13'20" (2.2222°)           │
│ Sun       │   6    │  5.000%    │ 0°40'00" (0.6667°)           │
│ Moon      │  10    │  8.333%    │ 1°06'40" (1.1111°)           │
│ Mars      │   7    │  5.833%    │ 0°46'40" (0.7778°)           │
│ Rahu      │  18    │ 15.000%    │ 2°00'00" (2.0000°)           │
│ Jupiter   │  16    │ 13.333%    │ 1°46'40" (1.7778°)           │
│ Saturn    │  19    │ 15.833%    │ 2°06'40" (2.1111°)           │
│ Mercury   │  17    │ 14.167%    │ 1°53'20" (1.8889°)           │
├───────────┼────────┼────────────┼──────────────────────────────┤
│ TOTAL     │ 120    │ 100.000%   │ 13°20'00" (13.3333°)         │
└───────────┴────────┴────────────┴──────────────────────────────┘

Dasha Sequence (cyclic): Ketu → Venus → Sun → Moon → Mars →
                          Rahu → Jupiter → Saturn → Mercury

The sub-division of each Nakshatra starts from its own ruler
and follows the Dasha sequence from that point.

Example: Ashwini Nakshatra (ruler: Ketu)
  Sub 1: Ketu    (0.7778°)
  Sub 2: Venus   (2.2222°)
  Sub 3: Sun     (0.6667°)
  Sub 4: Moon    (1.1111°)
  ...and so on



2.4 ZODIAC SIGNS AND THEIR RULERS
───────────────────────────────────────────────────────────────────

┌────┬───────────────┬─────────┬────────────┬────────────────────┐
│ #  │ Sign          │ Ruler   │ Span       │ Market Nature      │
├────┼───────────────┼─────────┼────────────┼────────────────────┤
│  1 │ Aries         │ Mars    │  0° -  30° │ Aggressive/Bearish │
│  2 │ Taurus        │ Venus   │ 30° -  60° │ Wealth/Bullish     │
│  3 │ Gemini        │ Mercury │ 60° -  90° │ Mixed/Neutral      │
│  4 │ Cancer        │ Moon    │ 90° - 120° │ Emotional/Volatile │
│  5 │ Leo           │ Sun     │120° - 150° │ Authority/Bullish  │
│  6 │ Virgo         │ Mercury │150° - 180° │ Analytical/Neutral │
│  7 │ Libra         │ Venus   │180° - 210° │ Balance/Bullish    │
│  8 │ Scorpio       │ Mars    │210° - 240° │ Intense/Bearish    │
│  9 │ Sagittarius   │ Jupiter │240° - 270° │ Expansion/Bullish  │
│ 10 │ Capricorn     │ Saturn  │270° - 300° │ Cautious/Bearish   │
│ 11 │ Aquarius      │ Saturn  │300° - 330° │ Contrarian/Bearish │
│ 12 │ Pisces        │ Jupiter │330° - 360° │ Growth/Bullish     │
└────┴───────────────┴─────────┴────────────┴────────────────────┘


2.5 TWENTY-SEVEN NAKSHATRAS (LUNAR MANSIONS)
───────────────────────────────────────────────────────────────────

Each Nakshatra spans 13°20' (800 minutes of arc).

┌────┬───────────────────┬─────────┬──────────────────────────────┐
│ #  │ Nakshatra         │ Ruler   │ Start Longitude              │
├────┼───────────────────┼─────────┼──────────────────────────────┤
│  1 │ Ashwini           │ Ketu    │   0°00'00"                   │
│  2 │ Bharani           │ Venus   │  13°20'00"                   │
│  3 │ Krittika          │ Sun     │  26°40'00"                   │
│  4 │ Rohini            │ Moon    │  40°00'00"                   │
│  5 │ Mrigashira        │ Mars    │  53°20'00"                   │
│  6 │ Ardra             │ Rahu    │  66°40'00"                   │
│  7 │ Punarvasu         │ Jupiter │  80°00'00"                   │
│  8 │ Pushya            │ Saturn  │  93°20'00"                   │
│  9 │ Ashlesha          │ Mercury │ 106°40'00"                   │
│ 10 │ Magha             │ Ketu    │ 120°00'00"                   │
│ 11 │ Purva Phalguni    │ Venus   │ 133°20'00"                   │
│ 12 │ Uttara Phalguni   │ Sun     │ 146°40'00"                   │
│ 13 │ Hasta             │ Moon    │ 160°00'00"                   │
│ 14 │ Chitra            │ Mars    │ 173°20'00"                   │
│ 15 │ Swati             │ Rahu    │ 186°40'00"                   │
│ 16 │ Vishakha          │ Jupiter │ 200°00'00"                   │
│ 17 │ Anuradha          │ Saturn  │ 213°20'00"                   │
│ 18 │ Jyeshtha          │ Mercury │ 226°40'00"                   │
│ 19 │ Mula              │ Ketu    │ 240°00'00"                   │
│ 20 │ Purva Ashadha     │ Venus   │ 253°20'00"                   │
│ 21 │ Uttara Ashadha    │ Sun     │ 266°40'00"                   │
│ 22 │ Shravana          │ Moon    │ 280°00'00"                   │
│ 23 │ Dhanishta         │ Mars    │ 293°20'00"                   │
│ 24 │ Shatabhisha       │ Rahu    │ 306°40'00"                   │
│ 25 │ Purva Bhadrapada  │ Jupiter │ 320°00'00"                   │
│ 26 │ Uttara Bhadrapada │ Saturn  │ 333°20'00"                   │
│ 27 │ Revati            │ Mercury │ 346°40'00"                   │
└────┴───────────────────┴─────────┴──────────────────────────────┘


2.6 PLACIDUS HOUSE SYSTEM
───────────────────────────────────────────────────────────────────

KP exclusively uses the Placidus house system. Houses are
calculated by trisecting the diurnal and nocturnal arcs:

  • House 1 (Ascendant/Lagna): Eastern horizon point
  • House 10 (MC/Midheaven): Highest point in the sky
  • House 7 (Descendant): Western horizon point
  • House 4 (IC/Nadir): Lowest point below horizon
  • Houses 2,3,5,6,8,9,11,12: Trisected between the angles

The Ascendant changes sign approximately every 2 hours,
making it the fastest-moving factor in the chart.


2.7 LAHIRI AYANAMSA
───────────────────────────────────────────────────────────────────

The Ayanamsa is the angular difference between the Tropical
(Western) and Sidereal (Vedic/KP) zodiacs.

KP uses the Lahiri Ayanamsa (also called Chitrapaksha):
  • Reference: 23°51'39" on January 1, 2000
  • Annual precession: ~50.3 seconds of arc
  • Current value (2026): ~24.23°

Formula used:
  Ayanamsa = 23.8611 + 0.013972 × (JD - 2451545.0) / 365.25

All planet positions are converted from Tropical to Sidereal:
  Sidereal Position = Tropical Position - Ayanamsa




═══════════════════════════════════════════════════════════════════
     PART III - PREDICTION PARAMETERS & SIGNIFICATIONS
═══════════════════════════════════════════════════════════════════

3.1 NINE PLANETS - MARKET NATURES & WEIGHTS
───────────────────────────────────────────────────────────────────

Each planet carries a specific market influence score (weight)
ranging from -1.0 (extremely bearish) to +1.0 (extremely bullish):

┌─────────┬────────┬────────┬──────────────────────────────────────┐
│ Planet  │ Symbol │ Weight │ Stock Market Signification           │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ JUPITER │  ♃    │ +0.80  │ STRONGEST BULLISH. Expansion,        │
│         │        │        │ growth, optimism, large-cap gains,   │
│         │        │        │ banking sector positive, FII inflow  │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ VENUS   │  ♀    │ +0.70  │ STRONG BULLISH. Luxury stocks,       │
│         │        │        │ consumer goods rally, positive       │
│         │        │        │ sentiment, FMCG gains, auto sector   │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ SUN     │  ☉    │ +0.40  │ MODERATE BULLISH. Authority, govt    │
│         │        │        │ stocks steady, PSU positive, blue    │
│         │        │        │ chip stability, leadership sectors   │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ RAHU    │  ☊    │ +0.30  │ VOLATILE BULLISH. Unusual gains,     │
│         │        │        │ speculative stocks, manipulation,    │
│         │        │        │ foreign influence, tech disruption   │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ MOON    │  ☽    │ +0.20  │ MILDLY BULLISH/VOLATILE. Emotional   │
│         │        │        │ trading, sentiment swings, retail    │
│         │        │        │ activity, water/pharma sectors       │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ MERCURY │  ☿    │ +0.10  │ NEUTRAL. Mixed signals, IT sector    │
│         │        │        │ communication, trading volume,       │
│         │        │        │ analysis-driven, banking comm.       │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ KETU    │  ☋    │ -0.30  │ MILDLY BEARISH/VOLATILE. Sudden      │
│         │        │        │ moves, confusion, spiritual stocks,  │
│         │        │        │ IT glitches, circuit breakers        │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ MARS    │  ♂    │ -0.50  │ STRONG BEARISH. Aggressive selling,  │
│         │        │        │ red candles, metal/defence sector    │
│         │        │        │ volatile, confrontation in markets   │
├─────────┼────────┼────────┼──────────────────────────────────────┤
│ SATURN  │  ♄    │ -0.60  │ STRONGEST BEARISH. Contraction,      │
│         │        │        │ fear, slow decline, mining negative, │
│         │        │        │ delays, regulatory crackdowns        │
└─────────┴────────┴────────┴──────────────────────────────────────┘


3.2 KP LEVEL WEIGHTS IN COMPOSITE SCORE
───────────────────────────────────────────────────────────────────

The composite prediction score is calculated by weighting each
KP level's planetary influence:

┌───────┬─────────────────┬────────┬───────────────────────────────┐
│ Level │ Name            │ Weight │ Rationale                     │
├───────┼─────────────────┼────────┼───────────────────────────────┤
│ L1    │ Planet          │  10%   │ Base sentiment of the timing  │
│       │                 │        │ planet (Moon for intraday)    │
├───────┼─────────────────┼────────┼───────────────────────────────┤
│ L2    │ Sign Lord       │  15%   │ Broad environmental context;  │
│       │                 │        │ zodiac sign's ruler influence │
├───────┼─────────────────┼────────┼───────────────────────────────┤
│ L3    │ Star Lord       │  25%   │ Major directional force;      │
│       │                 │        │ nakshatra ruler determines    │
│       │                 │        │ the primary trend direction   │
├───────┼─────────────────┼────────┼───────────────────────────────┤
│ L4    │ Sub Lord        │  30%   │ MOST IMPORTANT - the decisive │
│       │                 │        │ factor; confirms or denies    │
│       │                 │        │ the Star Lord's indication    │
├───────┼─────────────────┼────────┼───────────────────────────────┤
│ L5    │ Prana Lord      │  20%   │ Finest timing trigger;        │
│       │                 │        │ determines exact activation   │
│       │                 │        │ point within the Sub period   │
└───────┴─────────────────┴────────┴───────────────────────────────┘

COMPOSITE SCORE FORMULA:
  Score = (L1_weight × 0.10) + (L2_weight × 0.15) +
          (L3_weight × 0.25) + (L4_weight × 0.30) +
          (L5_weight × 0.20)

For Mumbai Transit Mode (enhanced):
  Final = (Moon_Score × 0.40) + (Asc_Score × 0.30) +
          (Moon_House_Bonus × 0.15) + (Transit_Aspect × 0.15)


3.3 MOON HOUSE POSITION SCORING
───────────────────────────────────────────────────────────────────

When Moon transits through different houses (as seen from Mumbai),
it activates different financial themes:

┌───────┬────────────────────────────┬────────┬────────────────────┐
│ House │ Signification              │ Bonus  │ Impact on Market   │
├───────┼────────────────────────────┼────────┼────────────────────┤
│  H1   │ Self/Market Sentiment      │ +0.10  │ Mildly positive    │
│  H2   │ Wealth/Finance Accumulate  │ +0.50  │ STRONG POSITIVE    │
│  H3   │ Short-term Moves/Communic. │ +0.10  │ Mildly positive    │
│  H4   │ Stability/Fixed Assets     │  0.00  │ Neutral            │
│  H5   │ Speculation/Trading Gains  │ +0.60  │ STRONGEST POSITIVE │
│  H6   │ Debts/Obstacles/Service    │ -0.30  │ Negative           │
│  H7   │ Partnerships/Contracts     │ +0.20  │ Mildly positive    │
│  H8   │ Sudden Events/Hidden Loss  │ -0.50  │ STRONG NEGATIVE    │
│  H9   │ Fortune/Long-term Growth   │ +0.30  │ Positive           │
│  H10  │ Career/Status/Leadership   │ +0.50  │ STRONG POSITIVE    │
│  H11  │ Gains/Income/Fulfillment   │ +0.70  │ STRONGEST POSITIVE │
│  H12  │ Losses/Expenses/Foreign    │ -0.60  │ STRONGEST NEGATIVE │
└───────┴────────────────────────────┴────────┴────────────────────┘

FAVORABLE HOUSES: 2, 5, 10, 11 (accumulation & speculation)
UNFAVORABLE HOUSES: 6, 8, 12 (losses & obstacles)
NEUTRAL HOUSES: 1, 3, 4, 7, 9



3.4 TRANSIT ASPECT SCORING
───────────────────────────────────────────────────────────────────

Planetary aspects to the Mumbai Ascendant modify the base score:

┌──────────────┬────────┬────────────┬──────────────────────────────┐
│ Aspect       │ Angle  │ Multiplier │ Meaning                      │
├──────────────┼────────┼────────────┼──────────────────────────────┤
│ Conjunction  │   0°   │ × 0.30     │ Direct planetary influence   │
│              │ (±5°)  │            │ on market opening energy     │
├──────────────┼────────┼────────────┼──────────────────────────────┤
│ Trine        │ 120°   │ × 0.20     │ Harmonious flow; supports    │
│              │ (±5°)  │            │ the planet's natural tendency│
├──────────────┼────────┼────────────┼──────────────────────────────┤
│ Square       │  90°   │ × -0.15    │ Tension; creates volatile    │
│              │ (±5°)  │            │ conditions and resistance    │
├──────────────┼────────┼────────────┼──────────────────────────────┤
│ Opposition   │ 180°   │ × -0.10    │ Polarization; market pulls   │
│              │ (±5°)  │            │ in opposing directions       │
└──────────────┴────────┴────────────┴──────────────────────────────┘

Transit Aspect Score = Σ (Planet_Weight × Aspect_Multiplier)
  for each planet forming an aspect to the Ascendant

For natal transit analysis, additional aspects are used:
┌──────────────┬────────┬─────────────┬─────────────────────────────┐
│ Aspect       │ Angle  │ Nature      │ Orb Allowed                 │
├──────────────┼────────┼─────────────┼─────────────────────────────┤
│ Conjunction  │   0°   │ Strong      │ 8°                          │
│ Sextile      │  60°   │ Positive    │ 8°                          │
│ Square       │  90°   │ Challenging │ 8°                          │
│ Trine        │ 120°   │ Positive    │ 8°                          │
│ Opposition   │ 180°   │ Challenging │ 8°                          │
└──────────────┴────────┴─────────────┴─────────────────────────────┘


3.5 SIGNAL GENERATION LOGIC
───────────────────────────────────────────────────────────────────

The final composite score is converted to a trading signal:

┌──────────────────┬──────────────────┬────────────────────────────┐
│ Score Range      │ Signal           │ Interpretation             │
├──────────────────┼──────────────────┼────────────────────────────┤
│ > +0.30          │ STRONG BUY       │ Highly favorable period;   │
│                  │                  │ strong upward momentum     │
├──────────────────┼──────────────────┼────────────────────────────┤
│ +0.10 to +0.30   │ BUY             │ Moderately favorable;      │
│                  │                  │ gentle upward bias         │
├──────────────────┼──────────────────┼────────────────────────────┤
│ -0.10 to +0.10   │ NEUTRAL         │ No clear direction;        │
│                  │                  │ sideways movement likely   │
├──────────────────┼──────────────────┼────────────────────────────┤
│ -0.30 to -0.10   │ SELL            │ Moderately unfavorable;    │
│                  │                  │ gentle downward bias       │
├──────────────────┼──────────────────┼────────────────────────────┤
│ < -0.30          │ STRONG SELL      │ Highly unfavorable period; │
│                  │                  │ strong downward momentum   │
└──────────────────┴──────────────────┴────────────────────────────┘


3.6 HOUSE SIGNIFICATIONS FOR STOCK MARKET
───────────────────────────────────────────────────────────────────

┌───────┬────────────────────────────────────────────────────────────┐
│ House │ Stock Market Signification                                 │
├───────┼────────────────────────────────────────────────────────────┤
│   1   │ Overall market sentiment; general trading environment;     │
│       │ market participants' mood; index direction                 │
├───────┼────────────────────────────────────────────────────────────┤
│   2   │ Wealth accumulation; banking stocks; financial sector;     │
│       │ portfolio value increase; company earnings                 │
├───────┼────────────────────────────────────────────────────────────┤
│   3   │ Communication; media stocks; short-term trades;            │
│       │ telecom sector; intraday scalping opportunities            │
├───────┼────────────────────────────────────────────────────────────┤
│   4   │ Real estate; fixed assets; stability; infrastructure;      │
│       │ construction; home/property sector stocks                  │
├───────┼────────────────────────────────────────────────────────────┤
│   5   │ Speculation; F&O trading gains; creative industries;       │
│       │ entertainment; risk appetite; options premium gains        │
├───────┼────────────────────────────────────────────────────────────┤
│   6   │ Debts; obstacles; service sector; healthcare; daily        │
│       │ challenges; litigation risk; competitive pressure          │
├───────┼────────────────────────────────────────────────────────────┤
│   7   │ Partnerships; M&A activity; contract awards; trade         │
│       │ agreements; FII/DII balance; bilateral deals               │
├───────┼────────────────────────────────────────────────────────────┤
│   8   │ Sudden events; black swan events; hidden losses;           │
│       │ insurance claims; research (pharma); transformation        │
├───────┼────────────────────────────────────────────────────────────┤
│   9   │ Fortune; long-term growth; foreign markets; export         │
│       │ stocks; philosophical/ethical investing; global events     │
├───────┼────────────────────────────────────────────────────────────┤
│  10   │ Career/status; market leadership; large-cap stocks;        │
│       │ govt policy impact; regulatory announcements               │
├───────┼────────────────────────────────────────────────────────────┤
│  11   │ Gains; income; fulfillment of buy targets; profit          │
│       │ booking opportunities; dividend income; networking         │
├───────┼────────────────────────────────────────────────────────────┤
│  12   │ Losses; expenses; capital erosion; foreign outflow;        │
│       │ hidden costs; exit signals; portfolio drawdown             │
└───────┴────────────────────────────────────────────────────────────┘




═══════════════════════════════════════════════════════════════════
     PART IV - MUMBAI TRANSIT ENGINE
═══════════════════════════════════════════════════════════════════

4.1 NSE LOCATION COORDINATES
───────────────────────────────────────────────────────────────────

All transit calculations use the exact geographic coordinates of
the NSE Bandra Kurla Complex (BKC), Mumbai:

┌────────────────────┬──────────────────────────────────────────────┐
│ Parameter          │ Value                                        │
├────────────────────┼──────────────────────────────────────────────┤
│ Latitude           │ 19.0560° N (19°03'22" North)                 │
│ Longitude          │ 72.8470° E (72°50'49" East)                  │
│ Timezone           │ IST (Indian Standard Time)                   │
│ UTC Offset         │ +5 hours 30 minutes (+5.5)                   │
│ House System       │ Placidus                                     │
│ Ayanamsa           │ Lahiri (Chitrapaksha)                        │
│ Market Hours       │ 9:15 AM - 3:30 PM IST                       │
│ Pre-Market         │ 9:00 AM - 9:15 AM IST                       │
│ Post-Market        │ 3:30 PM - 4:00 PM IST                       │
└────────────────────┴──────────────────────────────────────────────┘

WHY MUMBAI?
The location of the stock exchange determines the Ascendant
(rising sign) at any given moment. Since NSE is in Mumbai,
all predictions are calculated for Mumbai's coordinates to
accurately determine which zodiac sign is rising and which
planets are in which houses AT THE EXCHANGE LOCATION.


4.2 ASCENDANT (LAGNA) CALCULATION
───────────────────────────────────────────────────────────────────

The Ascendant is calculated using the Placidus formula:

  STEP 1: Calculate Greenwich Mean Sidereal Time (GMST)
    GMST = 280.46061837 + 360.98564736629 × (JD - 2451545.0)
           + 0.000387933 × T² - T³/38710000

  STEP 2: Calculate Local Sidereal Time (LST)
    LST = GMST + Observer_Longitude (Mumbai: 72.847°)

  STEP 3: Calculate Obliquity of Ecliptic (ε)
    ε = 23.4393° - 0.0130° × T

  STEP 4: Calculate Tropical Ascendant
    tan(ASC) = cos(LST) / -(sin(ε)×tan(φ) + cos(ε)×sin(LST))
    where φ = latitude of Mumbai (19.056°)

  STEP 5: Convert to Sidereal
    Sidereal ASC = Tropical ASC - Lahiri Ayanamsa

ASCENDANT PROGRESSION DURING MARKET HOURS (typical):
  09:00 IST → Cancer (90°-120° sidereal)
  10:30 IST → Leo (120°-150° sidereal)
  12:00 IST → Virgo (150°-180° sidereal)
  14:00 IST → Libra (180°-210° sidereal)
  15:30 IST → Scorpio (210°-240° sidereal)

The Ascendant changes sign approximately every 2 hours.


4.3 SIDEREAL TIME & LOCAL MEAN TIME
───────────────────────────────────────────────────────────────────

Time Conversions Used:
  • IST to UTC: Subtract 5 hours 30 minutes
  • UTC to Julian Day: Standard astronomical formula
  • Julian Day to Julian Century (T): (JD - 2451545.0) / 36525
  • T is used in all planetary position formulas

Julian Day Formula:
  JD = INT(365.25 × (Y + 4716)) + INT(30.6001 × (M + 1))
       + D + B - 1524.5
  where B = 2 - INT(Y/100) + INT(INT(Y/100)/4)


4.4 DAILY TRANSIT REPORT STRUCTURE
───────────────────────────────────────────────────────────────────

The Mumbai Daily Transit Report provides snapshots at 7 key times:

  1. Pre-Market (8:30 IST)   - Before trading begins
  2. Market Open (9:15 IST)  - Official opening
  3. Mid-Morning (10:30 IST) - First session midpoint
  4. Noon (12:00 IST)        - Lunch/midday
  5. Afternoon (14:00 IST)   - Second session
  6. Market Close (15:30 IST)- Official closing
  7. Post-Market (16:00 IST) - After-hours

Each snapshot contains:
  • Sidereal Ascendant degree, sign, nakshatra
  • Ascendant's KP 5-level breakdown (Star, Sub, Prana lords)
  • All 9 planets with: sidereal position, sign, nakshatra,
    house placement, KP levels, and individual score
  • First 6 house cusps with their sign and KP levels


4.5 KEY MARKET TRANSIT IDENTIFICATION
───────────────────────────────────────────────────────────────────

The system identifies "Key Transits" - planets that currently
occupy market-relevant houses (2, 5, 6, 10, 11):

┌─────────────┬────────────────────────────────────────────────────┐
│ Condition   │ Interpretation                                     │
├─────────────┼────────────────────────────────────────────────────┤
│ Jupiter in  │ HIGHLY POSITIVE - Strong wealth accumulation       │
│ H2/H5/H11  │ period; market likely to see gains                 │
├─────────────┼────────────────────────────────────────────────────┤
│ Venus in    │ POSITIVE - Consumer stocks, luxury, positive       │
│ H2/H5/H11  │ sentiment; gentle upward movement                  │
├─────────────┼────────────────────────────────────────────────────┤
│ Saturn in   │ NEGATIVE - Contraction in that house's theme;      │
│ H2/H6/H10  │ delays, fear, slow movement                        │
├─────────────┼────────────────────────────────────────────────────┤
│ Mars in     │ NEGATIVE - Aggressive selling pressure in          │
│ H6/H8/H12  │ that domain; volatile red candles                  │
├─────────────┼────────────────────────────────────────────────────┤
│ Rahu in     │ MIXED - Unusual/speculative activity; may          │
│ H5/H11     │ produce unexpected gains or manipulation           │
└─────────────┴────────────────────────────────────────────────────┘




═══════════════════════════════════════════════════════════════════
     PART V - COMPANY HOROSCOPE SYSTEM
═══════════════════════════════════════════════════════════════════

5.1 INCORPORATION DATE AS BIRTH TIME
───────────────────────────────────────────────────────────────────

Each company's "horoscope" (natal chart) is generated using its
incorporation/registration date. This is analogous to a person's
birth chart in traditional astrology.

Default birth time: 12:00 Noon UTC on the incorporation date
  (used when exact registration time is unavailable)

Example Companies and Their Birth Dates:
┌──────────────┬─────────────┬────────────────────────────────────┐
│ Symbol       │ Inc. Date   │ Company Name                       │
├──────────────┼─────────────┼────────────────────────────────────┤
│ RELIANCE     │ 1973-05-08  │ Reliance Industries Ltd            │
│ TCS          │ 1968-04-01  │ Tata Consultancy Services          │
│ HDFCBANK     │ 1994-08-30  │ HDFC Bank Ltd                      │
│ INFY         │ 1981-07-02  │ Infosys Ltd                        │
│ ICICIBANK    │ 1994-01-05  │ ICICI Bank Ltd                     │
│ TATASTEEL    │ 1907-08-26  │ Tata Steel Ltd                     │
│ ITC          │ 1910-08-24  │ ITC Limited                        │
│ SBIN         │ 1955-07-01  │ State Bank of India                │
│ WIPRO        │ 1945-12-29  │ Wipro Ltd                          │
│ MARUTI       │ 1981-02-24  │ Maruti Suzuki India                │
└──────────────┴─────────────┴────────────────────────────────────┘

The natal chart shows where each planet was at the time of
incorporation, revealing the company's inherent tendencies.


5.2 NATAL CHART GENERATION
───────────────────────────────────────────────────────────────────

For each company, all 9 planets are calculated with full KP levels:

  For each planet:
    1. Calculate tropical longitude for the incorporation date
    2. Determine the zodiac sign (30° division)
    3. Determine the nakshatra (13°20' division)
    4. Calculate KP Sub Lord (Dasha proportion)
    5. Calculate KP Prana Lord (finest division)
    6. Compute individual planet score

The natal chart provides baseline strengths/weaknesses for
the company that are permanent characteristics.


5.3 TRANSIT-TO-NATAL ASPECT ANALYSIS
───────────────────────────────────────────────────────────────────

When analyzing a specific stock on a given day, the system
compares CURRENT (transit) planetary positions against the
company's NATAL positions to identify active aspects:

  Transit Score = Σ (Transit_Planet_Weight × Aspect_Multiplier
                     × (1 - Orb/Max_Orb))

  where:
    - Transit_Planet_Weight = PLANET_NATURE weight (-0.6 to +0.8)
    - Aspect_Multiplier:
        Positive aspects (Sextile, Trine): +1.0
        Challenging aspects (Square, Opposition): -1.0
        Strong aspects (Conjunction): +0.5
    - Orb = actual angular distance from exact aspect
    - Max_Orb = 8° (maximum allowed orb)

Overall Transit Sentiment:
    Score > +0.5  → BULLISH
    Score < -0.5  → BEARISH
    Otherwise     → NEUTRAL


5.4 ASPECT TYPES AND ORBS
───────────────────────────────────────────────────────────────────

┌──────────────┬───────┬─────────────┬─────────────────────────────┐
│ Aspect       │ Angle │ Orb (max)   │ Stock Market Effect          │
├──────────────┼───────┼─────────────┼─────────────────────────────┤
│ Conjunction  │   0°  │ 8°          │ Strong activation of the     │
│              │       │             │ natal planet's signification │
├──────────────┼───────┼─────────────┼─────────────────────────────┤
│ Sextile      │  60°  │ 8°          │ Opportunity; gentle positive │
│              │       │             │ support for the natal planet │
├──────────────┼───────┼─────────────┼─────────────────────────────┤
│ Square       │  90°  │ 8°          │ Tension & challenge; forced  │
│              │       │             │ action; volatile period      │
├──────────────┼───────┼─────────────┼─────────────────────────────┤
│ Trine        │ 120°  │ 8°          │ Harmonious flow; strong      │
│              │       │             │ support; easy gains          │
├──────────────┼───────┼─────────────┼─────────────────────────────┤
│ Opposition   │ 180°  │ 8°          │ Polarization; indecision;    │
│              │       │             │ reversal possible            │
└──────────────┴───────┴─────────────┴─────────────────────────────┘




═══════════════════════════════════════════════════════════════════
     PART VI - USER GUIDE
═══════════════════════════════════════════════════════════════════

6.1 WEB APPLICATION USAGE
───────────────────────────────────────────────────────────────────

Starting the application:
  $ cd kp-stock-predictor
  $ npm start
  → Opens at http://localhost:4000

Interface Layout:
  ┌─────────────────────────────────────────────────────────────┐
  │  HEADER: Logo | Date Picker                                  │
  ├────────────┬────────────────────────────┬───────────────────┤
  │            │                            │                   │
  │  STOCKS    │  MAIN CONTENT              │  NEWS PANEL       │
  │  (Left)    │  • Price Bar               │  • Sentiment      │
  │            │  • KP Prediction Chart     │  • Headlines      │
  │  • Search  │  • Mumbai Transit          │  • Source Links   │
  │  • Filter  │  • KP 5-Level Detail       │                   │
  │  • List    │  • Prediction Timeline     │                   │
  │            │  • Company Horoscope       │                   │
  │            │                            │                   │
  └────────────┴────────────────────────────┴───────────────────┘

Steps to use:
  1. Select a stock from the left panel (search or browse)
  2. View real-time price in the info bar
  3. Examine KP prediction chart (gold line = KP score)
  4. Check the Mumbai Transit dashboard
  5. Review minute-level prediction timeline
  6. Read news in the right panel
  7. Change date using the date picker to analyze future days


6.2 ANDROID APP INSTALLATION
───────────────────────────────────────────────────────────────────

METHOD A: Install as PWA (Easiest - No Build Required)
  1. Deploy the web app to any public server
  2. Open the URL in Chrome on your Android phone
  3. Chrome will show "Add to Home Screen" prompt
  4. Tap "Install" → App icon appears on home screen
  5. Opens fullscreen like a native app

METHOD B: Build APK with EAS (React Native)
  1. $ cd mobile
  2. $ npm install -g eas-cli
  3. $ eas login (create free Expo account)
  4. $ eas build --platform android --profile preview
  5. Download APK from expo.dev dashboard
  6. Transfer APK to phone → Install

App has 4 tabs:
  • Stocks: NSE company browser with search/filter
  • Predictions: Minute-level KP signals for today
  • Transit: Full Mumbai planetary transit dashboard
  • News: Live market news with sentiment analysis


6.3 READING THE PREDICTION CHART
───────────────────────────────────────────────────────────────────

The KP Prediction Chart displays three datasets:

  GOLD LINE (KP Composite Score):
    Shows the composite KP score over time.
    Above zero = bullish tendency
    Below zero = bearish tendency
    Higher amplitude = stronger signal

  COLORED BARS (Signal Strength):
    Green bars = Buy signals (varying intensity)
    Red bars = Sell signals (varying intensity)
    Orange bars = Neutral signals

  PURPLE DASHED LINE (Moon House Effect):
    Shows the bonus/penalty from Moon's house position.
    Peaks = Moon in houses 5, 11 (strong speculation gains)
    Troughs = Moon in houses 8, 12 (loss periods)

  BLUE LINE (Price - when available):
    Actual intraday stock price overlaid for comparison.


6.4 UNDERSTANDING SIGNALS
───────────────────────────────────────────────────────────────────

Each 5-minute interval produces a signal. Interpretation guide:

  STRONG BUY (Score > +0.30):
    Multiple bullish planets dominating all 5 levels.
    Moon in a favorable house. Strong support from transits.
    → Consider entering long positions.

  BUY (Score +0.10 to +0.30):
    Mild bullish tendency. Some positive planetary alignment.
    → Existing longs can hold; cautious new entry.

  NEUTRAL (Score -0.10 to +0.10):
    No clear planetary direction. Mixed influences.
    → Avoid new positions; wait for clarity.

  SELL (Score -0.10 to -0.30):
    Mild bearish tendency. Negative planetary influence.
    → Consider reducing exposure; tight stop losses.

  STRONG SELL (Score < -0.30):
    Multiple bearish planets dominating. Moon in unfavorable
    house. Challenging transit aspects.
    → Exit longs; consider short positions.


6.5 BEST PRACTICES FOR TRADING
───────────────────────────────────────────────────────────────────

  1. COMBINE WITH TECHNICAL ANALYSIS
     Use KP signals as a timing overlay on top of
     traditional technical analysis (support/resistance,
     moving averages, volume patterns).

  2. CHECK DAILY TRANSIT FIRST
     Before trading, check the Mumbai Transit tab for
     overall daily sentiment and key planet placements.

  3. FOCUS ON STRONG SIGNALS
     Only trade on STRONG BUY/SELL signals. Neutral and
     mild signals often lead to choppy movement.

  4. RESPECT MOON'S HOUSE
     When Moon is in Houses 8 or 12, exercise extreme
     caution regardless of other signals.

  5. VERIFY WITH NEWS
     Confirm KP signals with the news panel. Contradictory
     news may override astrological indications.

  6. USE COMPANY HOROSCOPE
     Prefer stocks whose natal chart aligns with current
     transits (bullish transit sentiment).

  7. TIME YOUR ENTRIES
     Use the Prediction Timeline to identify the best
     5-minute window within a favorable hour.




═══════════════════════════════════════════════════════════════════
     PART VII - TECHNICAL REFERENCE
═══════════════════════════════════════════════════════════════════

7.1 API ENDPOINTS
───────────────────────────────────────────────────────────────────

BASE URL: http://localhost:4000/api

┌──────────────────────────────────┬────────┬──────────────────────┐
│ Endpoint                         │ Method │ Description          │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/nse/companies               │ GET    │ List all 50 NSE      │
│   ?search=tata&sector=IT         │        │ companies with       │
│                                  │        │ filter options       │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/nse/quote/:symbol           │ GET    │ Real-time stock      │
│   e.g. /api/nse/quote/RELIANCE   │        │ price + intraday     │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/nse/sectors                 │ GET    │ List all sectors     │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/predictions              │ GET    │ Minute-level KP      │
│   ?date=2026-06-19               │        │ predictions with     │
│   &interval=5                    │        │ Mumbai transit       │
│   &mode=mumbai_transit           │        │                      │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/mumbai-transit           │ GET    │ Full Mumbai daily    │
│   ?date=2026-06-19               │        │ transit report       │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/houses                   │ GET    │ 12 Placidus house    │
│   ?date=2026-06-19T05:00:00Z     │        │ cusps for Mumbai     │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/horoscope/:symbol        │ GET    │ Company natal chart  │
│   e.g. /api/kp/horoscope/TCS     │        │ based on inc. date   │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/transit/:symbol          │ GET    │ Transit-to-natal     │
│   ?date=2026-06-19               │        │ aspect analysis      │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/kp/planets                  │ GET    │ Current planetary    │
│   ?date=2026-06-19               │        │ positions + levels   │
├──────────────────────────────────┼────────┼──────────────────────┤
│ /api/news/:symbol                │ GET    │ Stock news + senti-  │
│   e.g. /api/news/RELIANCE        │        │ ment analysis        │
└──────────────────────────────────┴────────┴──────────────────────┘


7.2 CALCULATION FORMULAS
───────────────────────────────────────────────────────────────────

PLANETARY POSITION FORMULAS (Simplified Astronomical):

  Sun:  L = 280.46646 + 36000.76983T + 0.0003032T²
        M = 357.52911 + 35999.05029T - 0.0001537T²
        C = (1.9146 - 0.0048T)sin(M) + 0.0200sin(2M)
        Position = L + C (normalized to 0-360°)

  Moon: L = 218.3165 + 481267.8813T
        Corrections using D, M, M', F parameters
        ~6.289sin(M') + 1.274sin(2D-M') + 0.658sin(2D) ...

  Mars: L = 355.433 + 19140.2993T
        M = 19.373 + 19139.8585T
        C = 10.691sin(M) + 0.623sin(2M)

  Jupiter: L = 34.351 + 3034.9057T
           M = 20.020 + 3034.6874T
           C = 5.555sin(M) + 0.168sin(2M)

  Saturn: L = 50.077 + 1222.1138T
          M = 317.020 + 1222.1132T
          C = 6.406sin(M) + 0.318sin(2M)

  Rahu: 125.0445 - 1934.1362T (retrograde)
  Ketu: Rahu + 180°

  T = Julian Centuries from J2000.0 = (JD - 2451545.0) / 36525

KP SCORE FORMULA:
  Base_Score = Σ (Level_Weight[i] × Planet_Nature_Weight[Level_i])
  
  Mumbai_Score = Moon_Base × 0.40 + Asc_Base × 0.30
               + House_Bonus × 0.15 + Transit_Aspect × 0.15


7.3 DATA UPDATE FREQUENCY
───────────────────────────────────────────────────────────────────

┌────────────────────┬─────────────────────────────────────────────┐
│ Data Type          │ Update Frequency                            │
├────────────────────┼─────────────────────────────────────────────┤
│ Stock Price        │ Every 60 seconds (auto-refresh)             │
│ Intraday Chart     │ Every 60 seconds                            │
│ KP Predictions     │ On date change (calculated instantly)       │
│ Mumbai Transit     │ On date change (calculated instantly)       │
│ Company Horoscope  │ Static (based on fixed incorporation date)  │
│ News Articles      │ Cached for 10 minutes                       │
│ Planetary Positions│ Calculated in real-time (no cache)          │
└────────────────────┴─────────────────────────────────────────────┘


7.4 LIMITATIONS & DISCLAIMER
───────────────────────────────────────────────────────────────────

TECHNICAL LIMITATIONS:
  • Planetary positions use simplified formulas (mean anomaly)
    rather than Swiss Ephemeris. Accuracy: ±0.5° for Sun/Moon,
    ±1-2° for other planets.
  • Placidus house cusps use a simplified trisection method.
    For highest accuracy, professional ephemeris software
    should be consulted.
  • Lahiri Ayanamsa uses an approximation formula.
    Official government-published values may differ slightly.
  • Real-time prices depend on Yahoo Finance availability.
    During market holidays, no intraday data is available.

ASTROLOGICAL LIMITATIONS:
  • KP Astrology is a predictive system, not a guarantee.
  • Market movements are influenced by numerous factors
    beyond planetary positions (earnings, policy, geopolitics).
  • The system does not account for retrograde periods
    in its scoring (future enhancement).
  • Company incorporation time (hour/minute) is typically
    unknown; noon is used as default, reducing accuracy.

═══════════════════════════════════════════════════════════════════
                        DISCLAIMER
═══════════════════════════════════════════════════════════════════

THIS SOFTWARE IS PROVIDED FOR EDUCATIONAL AND RESEARCH PURPOSES
ONLY. IT SHOULD NOT BE USED AS THE SOLE BASIS FOR ANY INVESTMENT
OR TRADING DECISIONS.

The predictions generated by this tool are based on astrological
calculations and do NOT constitute financial advice. Past
astrological correlations do not guarantee future results.

ALWAYS:
  • Consult qualified financial advisors
  • Perform your own due diligence
  • Use proper risk management
  • Never invest more than you can afford to lose
  • Consider this tool as ONE input among many

The developers assume NO LIABILITY for any financial losses
incurred through the use of this software.

═══════════════════════════════════════════════════════════════════
              END OF MANUAL - Version 1.0.0
═══════════════════════════════════════════════════════════════════
