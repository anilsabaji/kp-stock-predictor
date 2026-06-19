const express = require('express');
const router = express.Router();
const kpEngine = require('../lib/kpEngine');

// Incorporation dates for company-specific natal charts & dasha
const INCORPORATION_DATES = {
  'RELIANCE': '1973-05-08', 'TCS': '1968-04-01', 'HDFCBANK': '1994-08-30', 'INFY': '1981-07-02',
  'ICICIBANK': '1994-01-05', 'HINDUNILVR': '1933-10-17', 'ITC': '1910-08-24', 'SBIN': '1955-07-01',
  'BHARTIARTL': '1995-07-07', 'KOTAKBANK': '1985-11-21', 'LICI': '1956-09-01', 'LT': '1946-02-07',
  'BAJFINANCE': '1987-03-25', 'HCLTECH': '1991-11-12', 'ASIANPAINT': '1942-02-01', 'MARUTI': '1981-02-24',
  'SUNPHARMA': '1983-12-17', 'TATAMOTORS': '1945-09-01', 'TITAN': '1984-07-26', 'AXISBANK': '1993-12-03',
  'WIPRO': '1945-12-29', 'ADANIENT': '1993-11-17', 'TATASTEEL': '1907-08-26', 'NTPC': '1975-11-07',
  'POWERGRID': '1989-10-23', 'ONGC': '1956-08-14', 'COALINDIA': '1973-11-01', 'ULTRACEMCO': '2000-08-24',
  'JSWSTEEL': '1994-03-15', 'M&M': '1945-10-02', 'TECHM': '1986-10-24', 'NESTLEIND': '1959-03-28',
  'DRREDDY': '1984-02-24', 'CIPLA': '1935-09-22', 'DIVISLAB': '1990-06-01', 'BAJAJFINSV': '2007-04-30',
  'GRASIM': '1947-08-25', 'BRITANNIA': '1918-03-21', 'HEROMOTOCO': '1984-01-19', 'APOLLOHOSP': '1979-01-05',
  'TATACONSUM': '1962-11-01', 'INDUSINDBK': '1994-01-31', 'EICHERMOT': '1982-04-29', 'ADANIPORTS': '1998-05-26',
  'SBILIFE': '2000-10-03', 'BPCL': '1952-11-03', 'HINDALCO': '1958-12-15', 'VEDL': '1965-06-25',
  'HDFCLIFE': '2000-01-14', 'BANKBARODA': '1908-07-20'
};

// GET /api/kp/predictions - Company-specific minute-level predictions
// Params: date, symbol, newsScore, basePrice, interval, mode
router.get('/predictions', (req, res) => {
  try {
    const { date, interval, mode, symbol, newsScore, basePrice } = req.query;
    const predictionDate = date || new Date().toISOString().split('T')[0];
    const intervalMinutes = parseInt(interval) || 5;
    const incDate = symbol ? INCORPORATION_DATES[symbol.toUpperCase()] : null;

    let predictions, dasha = null, dashaScore = null, predMode;

    if (mode === 'basic') {
      predictions = kpEngine.generateMinutePredictions(predictionDate, 9, 15, intervalMinutes);
      predMode = 'basic';
    } else if (incDate) {
      // Company-specific: transit-on-natal + Vimshottari dasha + news weighting
      const result = kpEngine.generateCompanyPredictions(
        predictionDate, incDate,
        newsScore !== undefined ? parseFloat(newsScore) : 0,
        basePrice !== undefined ? parseFloat(basePrice) : 100,
        intervalMinutes
      );
      predictions = result.predictions;
      dasha = result.dasha;
      dashaScore = result.dashaScore;
      predMode = 'company_specific';
    } else {
      predictions = kpEngine.generateMumbaiMinutePredictions(predictionDate, 9, 15, intervalMinutes);
      predMode = 'mumbai_transit';
    }

    const bullishCount = predictions.filter(p => p.signal.includes('BUY')).length;
    const bearishCount = predictions.filter(p => p.signal.includes('SELL')).length;
    const neutralCount = predictions.filter(p => p.signal === 'NEUTRAL').length;
    const avgScore = predictions.reduce((sum, p) => sum + parseFloat(p.score), 0) / predictions.length;

    res.json({
      date: predictionDate,
      symbol: symbol ? symbol.toUpperCase() : null,
      incorporationDate: incDate,
      interval: intervalMinutes,
      location: kpEngine.MUMBAI.name,
      mode: predMode,
      dasha,
      dashaScore,
      totalPredictions: predictions.length,
      summary: {
        bullishPeriods: bullishCount,
        bearishPeriods: bearishCount,
        neutralPeriods: neutralCount,
        averageScore: avgScore.toFixed(4),
        overallSentiment: avgScore > 0.1 ? 'BULLISH' : avgScore < -0.1 ? 'BEARISH' : 'NEUTRAL'
      },
      predictions
    });
  } catch (err) {
    console.error('KP prediction error:', err);
    res.status(500).json({ error: 'Failed to generate predictions', details: err.message });
  }
});

// GET /api/kp/mumbai-transit - Mumbai daily transit report
router.get('/mumbai-transit', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const transit = kpEngine.calculateMumbaiDailyTransit(targetDate);
    
    res.json(transit);
  } catch (err) {
    console.error('Mumbai transit error:', err);
    res.status(500).json({ error: 'Failed to calculate Mumbai transit', details: err.message });
  }
});

// GET /api/kp/houses - Current house cusps for Mumbai
router.get('/houses', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const houses = kpEngine.calculateHouseCusps(targetDate);
    const ayanamsa = kpEngine.calculateLahiriAyanamsa(
      kpEngine.calculatePlanetaryPositions(targetDate) ? 
      (() => { const d = new Date(targetDate); const Y = d.getUTCFullYear(); const M = d.getUTCMonth()+1; const D = d.getUTCDate(); let y=Y,m=M; if(M<=2){y-=1;m+=12;} const A=Math.floor(y/100); const B=2-A+Math.floor(A/4); return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+D+B-1524.5; })() : 0
    );
    
    res.json({
      date: targetDate.toISOString(),
      location: kpEngine.MUMBAI,
      ayanamsa: ayanamsa.toFixed(4),
      houses
    });
  } catch (err) {
    console.error('Houses error:', err);
    res.status(500).json({ error: 'Failed to calculate houses', details: err.message });
  }
});

// GET /api/kp/horoscope/:symbol - Get company horoscope
router.get('/horoscope/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const nseRoutes = require('./nse');
    
    // Find company in our database
    const companies = require('./nse').NSE_COMPANIES || [];
    // Import from nse route directly
    const NSE_COMPANIES = [
      { symbol: 'RELIANCE', incorporationDate: '1973-05-08' },
      { symbol: 'TCS', incorporationDate: '1968-04-01' },
      { symbol: 'HDFCBANK', incorporationDate: '1994-08-30' },
      { symbol: 'INFY', incorporationDate: '1981-07-02' },
      { symbol: 'ICICIBANK', incorporationDate: '1994-01-05' },
      { symbol: 'HINDUNILVR', incorporationDate: '1933-10-17' },
      { symbol: 'ITC', incorporationDate: '1910-08-24' },
      { symbol: 'SBIN', incorporationDate: '1955-07-01' },
      { symbol: 'BHARTIARTL', incorporationDate: '1995-07-07' },
      { symbol: 'KOTAKBANK', incorporationDate: '1985-11-21' },
      { symbol: 'LICI', incorporationDate: '1956-09-01' },
      { symbol: 'LT', incorporationDate: '1946-02-07' },
      { symbol: 'BAJFINANCE', incorporationDate: '1987-03-25' },
      { symbol: 'HCLTECH', incorporationDate: '1991-11-12' },
      { symbol: 'ASIANPAINT', incorporationDate: '1942-02-01' },
      { symbol: 'MARUTI', incorporationDate: '1981-02-24' },
      { symbol: 'SUNPHARMA', incorporationDate: '1983-12-17' },
      { symbol: 'TATAMOTORS', incorporationDate: '1945-09-01' },
      { symbol: 'TITAN', incorporationDate: '1984-07-26' },
      { symbol: 'AXISBANK', incorporationDate: '1993-12-03' },
      { symbol: 'WIPRO', incorporationDate: '1945-12-29' },
      { symbol: 'ADANIENT', incorporationDate: '1993-11-17' },
      { symbol: 'TATASTEEL', incorporationDate: '1907-08-26' },
      { symbol: 'NTPC', incorporationDate: '1975-11-07' },
      { symbol: 'POWERGRID', incorporationDate: '1989-10-23' },
      { symbol: 'ONGC', incorporationDate: '1956-08-14' },
      { symbol: 'COALINDIA', incorporationDate: '1973-11-01' },
      { symbol: 'ULTRACEMCO', incorporationDate: '2000-08-24' },
      { symbol: 'JSWSTEEL', incorporationDate: '1994-03-15' },
      { symbol: 'M&M', incorporationDate: '1945-10-02' },
      { symbol: 'TECHM', incorporationDate: '1986-10-24' },
      { symbol: 'NESTLEIND', incorporationDate: '1959-03-28' },
      { symbol: 'DRREDDY', incorporationDate: '1984-02-24' },
      { symbol: 'CIPLA', incorporationDate: '1935-09-22' },
      { symbol: 'DIVISLAB', incorporationDate: '1990-06-01' },
      { symbol: 'BAJAJFINSV', incorporationDate: '2007-04-30' },
      { symbol: 'GRASIM', incorporationDate: '1947-08-25' },
      { symbol: 'BRITANNIA', incorporationDate: '1918-03-21' },
      { symbol: 'HEROMOTOCO', incorporationDate: '1984-01-19' },
      { symbol: 'APOLLOHOSP', incorporationDate: '1979-01-05' },
      { symbol: 'TATACONSUM', incorporationDate: '1962-11-01' },
      { symbol: 'INDUSINDBK', incorporationDate: '1994-01-31' },
      { symbol: 'EICHERMOT', incorporationDate: '1982-04-29' },
      { symbol: 'ADANIPORTS', incorporationDate: '1998-05-26' },
      { symbol: 'SBILIFE', incorporationDate: '2000-10-03' },
      { symbol: 'BPCL', incorporationDate: '1952-11-03' },
      { symbol: 'HINDALCO', incorporationDate: '1958-12-15' },
      { symbol: 'VEDL', incorporationDate: '1965-06-25' },
      { symbol: 'HDFCLIFE', incorporationDate: '2000-01-14' },
      { symbol: 'BANKBARODA', incorporationDate: '1908-07-20' }
    ];
    
    const company = NSE_COMPANIES.find(c => c.symbol === symbol.toUpperCase());
    if (!company) {
      return res.status(404).json({ error: `Company ${symbol} not found` });
    }
    
    const horoscope = kpEngine.generateCompanyHoroscope(company.incorporationDate);
    
    res.json({
      symbol: company.symbol,
      incorporationDate: company.incorporationDate,
      horoscope
    });
  } catch (err) {
    console.error('Horoscope error:', err);
    res.status(500).json({ error: 'Failed to generate horoscope', details: err.message });
  }
});

// GET /api/kp/transit/:symbol - Transit analysis for a company
router.get('/transit/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const { date } = req.query;
    const transitDate = date ? new Date(date) : new Date();
    
    // Company incorporation dates
    const incorporationDates = {
      'RELIANCE': '1973-05-08', 'TCS': '1968-04-01', 'HDFCBANK': '1994-08-30',
      'INFY': '1981-07-02', 'ICICIBANK': '1994-01-05', 'HINDUNILVR': '1933-10-17',
      'ITC': '1910-08-24', 'SBIN': '1955-07-01', 'BHARTIARTL': '1995-07-07',
      'KOTAKBANK': '1985-11-21', 'TATAMOTORS': '1945-09-01', 'WIPRO': '1945-12-29',
      'TATASTEEL': '1907-08-26', 'MARUTI': '1981-02-24', 'AXISBANK': '1993-12-03'
    };
    
    const incDate = incorporationDates[symbol.toUpperCase()];
    if (!incDate) {
      return res.status(404).json({ error: `Transit data not available for ${symbol}` });
    }
    
    const analysis = kpEngine.analyzeTransitOnNatal(transitDate, incDate);
    
    res.json({
      symbol: symbol.toUpperCase(),
      transitDate: transitDate.toISOString(),
      incorporationDate: incDate,
      ...analysis
    });
  } catch (err) {
    console.error('Transit analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze transit', details: err.message });
  }
});

// GET /api/kp/planets - Current planetary positions
router.get('/planets', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const positions = kpEngine.calculatePlanetaryPositions(targetDate);
    
    const detailedPositions = {};
    for (const [planet, longitude] of Object.entries(positions)) {
      const levels = kpEngine.getKPLevels(longitude);
      levels.L1_Planet = planet;
      const signIndex = Math.floor(longitude / 30);
      const nakshatraIndex = Math.floor(longitude / kpEngine.NAKSHATRAS[0] ? 13.3333 : 13.3333) % 27;
      
      detailedPositions[planet] = {
        longitude: longitude.toFixed(4),
        sign: kpEngine.SIGNS[signIndex].name,
        nakshatra: kpEngine.NAKSHATRAS[Math.floor(longitude / (13 + 20/60)) % 27].name,
        levels: {
          signLord: kpEngine.PLANETS[levels.L2_SignLord].name,
          starLord: kpEngine.PLANETS[levels.L3_StarLord].name,
          subLord: kpEngine.PLANETS[levels.L4_SubLord].name,
          pranaLord: kpEngine.PLANETS[levels.L5_PranaLord].name
        },
        nature: kpEngine.PLANET_NATURE[planet],
        symbol: kpEngine.PLANETS[planet].symbol
      };
    }
    
    res.json({
      date: targetDate.toISOString(),
      positions: detailedPositions
    });
  } catch (err) {
    console.error('Planets error:', err);
    res.status(500).json({ error: 'Failed to get planetary positions', details: err.message });
  }
});

module.exports = router;
