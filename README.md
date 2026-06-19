# KP Astrology Stock Predictor - NSE India

A comprehensive stock screener and price prediction tool based on **Krishnamurti Paddhati (KP) Astrology** system for NSE (National Stock Exchange) India listed companies. All transit calculations use **Mumbai coordinates** (NSE Bandra Kurla Complex) for location-accurate predictions.

## Features

### 1. NSE Company Listing with Horoscopes
- 50 major NSE-listed companies with their incorporation dates
- Company horoscope (natal chart) generated from incorporation date
- Searchable and filterable by sector

### 2. KP Astrology 5-Level Price Prediction (Mumbai Transit)
Minute-level predictions using 5 KP levels calculated for Mumbai's exact coordinates:
- **L1 - Planet**: Primary sentiment indicator (Moon for intraday timing)
- **L2 - Sign Lord**: Zodiac sign ruler influence
- **L3 - Star Lord**: Nakshatra (lunar mansion) ruler - major directional force
- **L4 - Sub Lord**: Confirms or denies the star lord's indication
- **L5 - Prana Lord**: Finest timing trigger for entry/exit

### 3. Mumbai (NSE) Planetary Transit Dashboard
- **Location**: 19.056°N, 72.847°E (NSE Bandra Kurla Complex)
- **House System**: Placidus (as specified by KP method)
- **Ayanamsa**: Lahiri (sidereal correction)
- Real Ascendant (Lagna) calculated for every minute of market hours
- All 12 house cusps computed for Mumbai
- Planet-in-house placements determine market sectors affected
- Key transit identification for Houses 2, 5, 6, 10, 11 (wealth, speculation, career, gains)
- Ascendant progresses through signs during trading day (Cancer → Leo → Virgo → Libra)

### 4. Real-Time Price Feed
- Live stock prices from Yahoo Finance API (NSE data)
- Intraday price chart overlaid with KP prediction scores
- Moon House Effect line showing Mumbai transit influence
- Auto-refresh every 60 seconds

### 5. News Side Panel
- Real-time stock news from Google News RSS
- Sentiment analysis (positive/negative/neutral) for each article
- Overall sentiment breakdown
- Direct links to news sources

### 6. Transit Analysis (Natal)
- Current planetary transits analyzed against company natal chart
- Aspects (Conjunction, Sextile, Square, Trine, Opposition) with orb calculation
- Transit sentiment score (BULLISH/BEARISH/NEUTRAL)

## Mumbai Transit Methodology

The prediction engine uses Mumbai's geographic coordinates for all transit calculations:

| Parameter | Value |
|-----------|-------|
| Latitude | 19.0560° N |
| Longitude | 72.8470° E |
| Timezone | IST (UTC+5:30) |
| House System | Placidus |
| Ayanamsa | Lahiri (~24.23° for 2026) |
| Market Hours | 9:15 AM - 3:30 PM IST |

### How Mumbai Transit Affects Predictions:
1. **Ascendant (Lagna)** changes sign every ~2 hours through market hours
2. **Moon's house position** determines speculation outcomes:
   - Houses 2, 5, 10, 11 → Favorable for gains
   - Houses 6, 8, 12 → Unfavorable, risk of losses
3. **Planet aspects to Ascendant** score the market environment
4. **All planets' house placements** identify which sectors are activated

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Charts**: Chart.js with react-chartjs-2
- **Data Sources**: Yahoo Finance API, Google News RSS
- **Astrology Engine**: Custom implementation with Lahiri Ayanamsa & Placidus houses

## Quick Start

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend
cd client && npx vite build && cd ..

# Start server (serves both API and frontend)
npm start
```

The application will be available at `http://localhost:4000`

## Development Mode

```bash
# Terminal 1 - Start backend
npm run dev:server

# Terminal 2 - Start frontend dev server
npm run dev:client
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/nse/companies` | List all NSE companies (with search/sector filter) |
| `GET /api/nse/quote/:symbol` | Real-time stock quote from Yahoo Finance |
| `GET /api/nse/sectors` | List all available sectors |
| `GET /api/kp/predictions` | Minute-level KP predictions - Mumbai transit (params: date, interval, mode) |
| `GET /api/kp/mumbai-transit` | Full Mumbai daily transit report with all planets & houses |
| `GET /api/kp/houses` | Current Placidus house cusps for Mumbai |
| `GET /api/kp/horoscope/:symbol` | Company natal chart/horoscope |
| `GET /api/kp/transit/:symbol` | Transit analysis for a company |
| `GET /api/kp/planets` | Current planetary positions with KP levels |
| `GET /api/news/:symbol` | Stock news with sentiment analysis |

## KP Astrology Method

The prediction system uses the Vimshottari Dasha proportional division:

| Planet | Years | Proportion |
|--------|-------|-----------|
| Ketu | 7 | 5.83% |
| Venus | 20 | 16.67% |
| Sun | 6 | 5.00% |
| Moon | 10 | 8.33% |
| Mars | 7 | 5.83% |
| Rahu | 18 | 15.00% |
| Jupiter | 16 | 13.33% |
| Saturn | 19 | 15.83% |
| Mercury | 17 | 14.17% |

Each nakshatra (13°20') is divided into sub-divisions using these proportions, creating increasingly fine time divisions for prediction.

## Disclaimer

This tool is for educational and research purposes only. Astrological predictions should not be used as the sole basis for investment decisions. Always consult qualified financial advisors before making investment decisions.
