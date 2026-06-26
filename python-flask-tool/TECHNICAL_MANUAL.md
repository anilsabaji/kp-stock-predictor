# Technical Manual
## KP + Mundane Astrology NSE Stock Prediction Tool

> **Disclaimer — read first.** Astrology-based market forecasting has **no
> scientific or statistical validity**. Decades of studies (and even the
> financial-astrology sources referenced during development) find **no
> statistically significant correlation** between planetary positions and
> price movements. This software is an **educational / astrological-research
> tool**. Nothing it outputs is financial advice. The built-in back-tester is
> deliberately included so you can measure for yourself how poorly (or not) the
> astrological signal tracks real prices — the expected result is a directional
> hit-rate near 50% and a correlation near 0.

---

## 1. What the tool does

| # | Requirement | Where it is implemented |
|---|-------------|-------------------------|
| 1 | Cover all NSE-listed stocks | `data/symbols.py` loads the official NSE `EQUITY_L.csv` (~2,370 symbols) |
| 2 | Search by stock code **or** company name with pick-list | `/api/search` + autocomplete in `static/app.js` |
| 3 | Minute-by-minute astrological movement | `core/prediction.py` (`minute_score`, `predict_day`) |
| 4 | Real-time NSE price fetch + overlay on same graph | `data/market_data.py` + Plotly dual-axis chart |
| 5 | Panchanga + planetary direction/speed/declination/debilitation/exaltation | `core/panchanga.py`, `core/ephemeris.py`, `core/dignity.py` |
| 6 | Back-test vs real prices | `core/backtest.py` |
| 7 | Chart birth = NSE listing date, Mumbai, 09:15 | `app._birth_dt`, `config.py` |
| 8 | Company Dasha in prediction | `core/dasha.py` (Vimshottari) |
| 9 | Internet-researched price-movement combinations | encoded as rules below (sec. 7) |
| 10 | Indices (Bank Nifty, Nifty 100, …) | `config.INDICES` |
| 11 | HTML link to open and run | Flask serves `http://127.0.0.1:5000` |
| 12 | This Technical Manual | `/manual` route renders this file |

---

## 2. Astronomical engine

- **Library:** Swiss Ephemeris (`pyswisseph`). Uses the **Moshier** analytical
  model (`FLG_MOSEPH`) so **no external ephemeris data files** are required;
  accuracy is a few arc-seconds — far finer than any astrological rule needs.
- **Zodiac:** Sidereal.
- **Ayanamsa:** **Krishnamurti (KP)** — `swe.SIDM_KRISHNAMURTI`.
- **Houses:** **Placidus** cusps (the system KP uses), via `swe.houses_ex`.
- **Nodes:** Rahu = Mean North Node; Ketu = exactly opposite Rahu.
- **Time:** All inputs are India Standard Time (UTC+5:30). `ist_to_jd()`
  converts wall-clock IST → Julian Day (UT).
- **Place:** Mumbai — lat `18.9388`, lon `72.8354`.

For every planet we expose (requirement #5):
longitude, latitude, **longitudinal speed** (deg/day; negative ⇒ **retrograde**),
**declination** (deg, N/S of the celestial equator), whether declination is
increasing ("out of bounds" if |δ| > 23.45°), and whether the planet is
**accelerating**.

---

## 3. KP stellar system (`core/kp.py`)

Each sidereal longitude is resolved into the KP hierarchy ("levels"):

```
Sign (Rasi) → Sign Lord → Nakshatra (Star) → Star Lord → Sub Lord → Sub-Sub Lord
```

- **27 nakshatras**, each 13°20′ (800′). Lords cycle in the Vimshottari order
  starting **Ketu** (Ashwini) → Venus → Sun → Moon → Mars → Rahu → Jupiter →
  Saturn → Mercury, repeating 3×.
- **Sub-lords (the heart of KP):** each nakshatra is split into 9 unequal
  "subs" whose widths are proportional to the planets' Vimshottari **dasha
  years** (Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16,
  Saturn 19, Mercury 17 = 120), beginning from that nakshatra's star lord. This
  yields the classic 249 sub-divisions. The same proportional split is applied
  once more to obtain the **sub-sub lord**.
- **Pada:** the quarter (1–4) of the nakshatra.

The **sub-lord is treated as the deciding factor** in KP, consistent with the
referenced KP literature where the level hierarchy (planet → sign lord → star
lord → sub) successively modifies the indication. *(Source material on KP graph
levels was rephrased for compliance with licensing restrictions.)*

---

## 4. Dignity & strength (`core/dignity.py`)

For each planet a strength score in **[-1, +1]** is built from:

| Factor | Rule | Effect on strength |
|--------|------|--------------------|
| **Exaltation** | within 15° of deep-exaltation degree | up to **+1.0** |
| **Debilitation** | within 15° of the opposite degree | down to **-1.0** |
| **Own sign** | planet rules the sign it sits in | **+0.4** |
| **Combustion** | within the Sun-orb (Moon 12°, Mars 17°, Mercury 14°, Jupiter 11°, Venus 10°, Saturn 15°) | **-0.35** |
| **Retrograde** | speed < 0 | dampens (×0.6) and **-0.15** (delayed/reversed expression) |
| **Out of bounds** | \|declination\| > 23.45° | flagged |

**Deep-exaltation degrees used** (sidereal): Sun 10° Aries, Moon 3° Taurus,
Mars 28° Capricorn, Mercury 15° Virgo, Jupiter 5° Cancer, Venus 27° Pisces,
Saturn 20° Libra. Debilitation = exactly 180° opposite.

**Cardinal directions (dik):** Sun-E, Venus-SE, Mars-S, Rahu-SW, Saturn-W,
Moon-NW, Mercury-N, Jupiter-NE, Ketu-Center.

---

## 5. Panchanga (`core/panchanga.py`)

| Limb | Computation |
|------|-------------|
| **Tithi** | floor((Moon − Sun) / 12°); 1–15 Shukla (waxing), 16–30 Krishna (waning) |
| **Vara** | weekday lord (Sun…Saturn) |
| **Nakshatra** | Moon's nakshatra & its lord |
| **Yoga** | floor((Sun + Moon) / 13°20′) → one of 27 yogas |
| **Karana** | half-tithi (floor((Moon − Sun)/6°)); 11 karanas |

**Panchanga bias** fed to the model: waxing Moon **+0.4** / waning **-0.4**;
inauspicious yoga (Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra,
Vyatipata, Parigha, Vaidhriti) **-0.3** else **+0.15**; **Vishti (Bhadra)**
karana **-0.3**. Clamped to [-1, 1].

---

## 6. Vimshottari Dasha (`core/dasha.py`)

- Anchored on the **Moon's nakshatra at chart birth** (NSE listing date, 09:15,
  Mumbai). The balance of the first Mahadasha is `years × (1 − fraction
  elapsed in nakshatra)`.
- 120-year cycle of Mahadashas; each subdivided into **Antardashas (Bhuktis)**
  and **Pratyantardashas**, proportional to Vimshottari years.
- **Dasha bias** = `0.5·polarity(Maha) + 0.3·polarity(Antar) + 0.2·polarity(Pratyantar)`.

---

## 7. The prediction model (`core/prediction.py`)

### 7.1 Planet market-polarity table

The core mapping of each graha to a bullish(+)/bearish(−) market temperament,
derived from classical benefic/malefic nature applied to financial astrology:

| Planet | Polarity | Rationale |
|--------|---------:|-----------|
| Jupiter | **+1.00** | expansion, optimism, liquidity |
| Venus | **+0.80** | value, comfort, prosperity |
| Mercury | **+0.45** | trade, volume, commerce |
| Moon | **+0.35** | sentiment (modulated by waxing/waning) |
| Sun | **−0.15** | authority, intraday contraction |
| Mars | **−0.55** | volatility, sharp moves, the high/low **trigger** |
| Saturn | **−0.80** | contraction, fear, decline |
| Rahu | **−0.70** | speculation/mania then crash; high volatility |
| Ketu | **−0.60** | sudden drops, detachment |

*(Planet–market temperament summarised from financial-astrology sources;
content was rephrased for compliance with licensing restrictions.)*

### 7.2 House polarity (KP, counted from chart ascendant)

- **Bullish houses:** 2 (wealth), 5 (speculation), 9 (fortune), 10 (status),
  11 (gains) → **+1.0**
- **Bearish houses:** 6 (debt), 8 (loss/sudden events), 12 (expenditure) → **−1.0**
- Houses 1, 3, 4, 7 → neutral.

### 7.3 Mundane aspects (between transiting planets)

| Aspect | Angle | Orb | Polarity |
|--------|------:|----:|---------:|
| Conjunction | 0° | 8° | avg. of the two planets' polarity |
| Sextile | 60° | 4° | +0.6 |
| Square | 90° | 6° | −0.8 |
| Trine | 120° | 6° | +1.0 |
| Opposition | 180° | 8° | −0.7 |

Each hit is weighted by tightness (closeness to the exact angle).

### 7.4 The eight weighted components

For every minute, eight components each return a value in [-1, 1]; the weighted
sum (weights ≈ sum to 1) is scaled to a **score in [-100, +100]** (positive ⇒
bullish bias):

| Component | Weight | What it measures |
|-----------|------:|------------------|
| `asc_sublord` | **0.26** | polarity of the **moving Ascendant** sub-lord (0.55 sub + 0.30 star + 0.15 sign) — the primary KP intraday driver; the Ascendant traverses ~1°/4 min so its sub-lord changes through the session |
| `moon_sublord` | **0.16** | Moon sub-lord (0.6) + star lord (0.4) — sentiment |
| `transit_house` | **0.12** | natal house occupied by fast planets, weighted by volatility |
| `aspects` | **0.12** | net polarity of mundane aspects |
| `dignity` | **0.10** | strength of fast planets, signed by their polarity |
| `panchanga` | **0.08** | tithi/yoga/karana bias |
| `dasha` | **0.10** | company Vimshottari maha/antar/pratyantar nature |
| `hora` | **0.06** | planetary hour + weekday-lord polarity |

**Fast planets** considered for intraday: Moon, Mercury, Venus, Sun, Mars.

**Hora (planetary hour):** equal 60-min hours from an approximate 06:00
sunrise, sequenced in the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus,
Mercury, Moon) starting from the weekday lord.

### 7.5 Researched combinations encoded as rules

From the KP / financial-astrology literature reviewed (sources rephrased for
licensing compliance), the following recurring "combinations" are embedded:

1. **KP sub-lord decides** — the sub-lord of the moving Ascendant dominates the
   intraday tone (weight 0.26).
2. **Speculation/gain houses (2/5/11) bullish, loss houses (8/12) bearish** —
   `HOUSE_POLARITY`.
3. **Benefic vs malefic temperament** — Jupiter/Venus lift, Saturn/Rahu/Ketu
   depress (`PLANET_POLARITY`).
4. **Mars = the volatility trigger** that often marks intraday highs/lows —
   modelled via high `PLANET_VOLATILITY` and negative polarity.
5. **Hard aspects (square/opposition) bearish; soft aspects (trine/sextile)
   bullish** — `ASPECTS`.
6. **Waxing-Moon optimism / waning-Moon contraction** and **inauspicious yoga /
   Vishti karana** caution — Panchanga bias.
7. **Planetary-hour rulership** colours each hour bullish/bearish — `hora`.
8. **Running Dasha lord** sets a slow background bias for the specific company.

### 7.6 Projected price path

Minute scores are integrated into a synthetic price curve anchored at the
session open:
`price_{t} = price_{t-1} × (1 + k · (score/100) · step)`, with `k = 0.00025`.
On the chart this dotted **astro projection** is rescaled to start at the actual
opening price so it can be overlaid directly on the **real NSE price** line.

### 7.7 Daily summary

`avg_score > +8 ⇒ Bullish`, `< −8 ⇒ Bearish`, else `Sideways/Neutral`.
**Reversal times** = minutes where the score crosses zero.

---

## 8. Market data (`data/market_data.py`)

- **Primary:** Yahoo Finance (`yfinance`). NSE equities use the `SYMBOL.NS`
  suffix; indices use `^NSEI`, `^NSEBANK`, etc.
- **Intraday:** 1-minute bars, IST-localised; Yahoo serves only the **last ~7
  trading sessions** for the minute interval (briefly cached, 60 s TTL).
- **Daily history:** used by the daily back-tester (years available).
- **Latest quote:** best-effort **direct NSE** (`/api/quote-equity`) with a 4 s
  timeout, falling back to Yahoo `fast_info`. Direct NSE typically works only
  from Indian IP addresses; the Yahoo fallback works worldwide.

---

## 9. Back-testing (`core/backtest.py`)

- **Daily directional test:** for each trading day, compare `sign(avg astro
  score)` with `sign(actual daily return)`. Reports **hit-rate** and the
  Pearson **correlation** between astro score and next-day return.
- **Intraday test:** aligns the projected price path with 1-minute bars and
  reports correlation + directional hit-rate.
- **Interpretation:** a hit-rate near 50% and correlation near 0 mean **no
  predictive edge** — the statistically expected outcome and exactly what the
  tool typically shows.

---

## 10. Indices covered (requirement #10)

NIFTY 50, NIFTY BANK (Bank Nifty), NIFTY NEXT 50, NIFTY 100, NIFTY 500,
NIFTY MIDCAP 50, NIFTY IT, NIFTY FMCG, NIFTY PHARMA, NIFTY AUTO, NIFTY METAL,
NIFTY REALTY, NIFTY ENERGY, NIFTY FIN SERVICE, INDIA VIX. Each uses its index
inception date as the chart "birth".

---

## 11. Running it

```bash
cd astro_stock
python -m venv .venv && source .venv/bin/activate      # or use the provided .venv
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000** (technical manual at **/manual**).

1. Type a stock code or company name → pick from the list.
2. Choose a date and resolution (1/5/15/30 min) → **Predict & Overlay**.
3. Inspect the chart (astro score, projected price, actual NSE price), the
   Panchanga / Dasha / planetary-status panels.
4. Run the **back-test** to compare against real history.

---

## 12. Tuning

Every constant — planet polarities, house polarities, aspect orbs, component
weights, exaltation degrees, combustion orbs — lives in **`config.py`** and is
hot-editable. Change a weight, restart `app.py`, and the whole model updates.

---

## 13. File map

```
astro_stock/
├── app.py                 Flask server + API routes + HTML link
├── config.py              ALL astrological constants, weights, rules
├── requirements.txt
├── TECHNICAL_MANUAL.md     (this file)
├── core/
│   ├── ephemeris.py       Swiss-Ephemeris wrapper (positions/speed/decl/retro)
│   ├── kp.py              KP sign/star/sub-lord resolver (249 subs)
│   ├── dignity.py         exaltation/debilitation/combust/retro/direction
│   ├── panchanga.py       tithi/vara/nakshatra/yoga/karana
│   ├── dasha.py           Vimshottari maha/antar/pratyantar
│   ├── prediction.py      8-component minute-by-minute score + projection
│   └── backtest.py        daily + intraday back-tests
├── data/
│   ├── symbols.py         NSE equity + index master, autocomplete
│   ├── market_data.py     yfinance / NSE price access
│   └── EQUITY_L.csv       official NSE listing master (auto-refreshable)
├── templates/  index.html, manual.html
└── static/     app.js, styles.css
```
