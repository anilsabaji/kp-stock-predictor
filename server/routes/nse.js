const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// NSE India headers to mimic browser request
const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.nseindia.com/',
  'Connection': 'keep-alive'
};

// Cookie session for NSE
let nseCookies = '';

async function getNSESession() {
  try {
    const response = await axios.get('https://www.nseindia.com/', {
      headers: NSE_HEADERS,
      maxRedirects: 5
    });
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      nseCookies = cookies.map(c => c.split(';')[0]).join('; ');
    }
    return nseCookies;
  } catch (err) {
    console.error('Failed to get NSE session:', err.message);
    return '';
  }
}

async function fetchNSE(url) {
  if (!nseCookies) {
    await getNSESession();
  }
  try {
    const response = await axios.get(url, {
      headers: { ...NSE_HEADERS, Cookie: nseCookies }
    });
    return response.data;
  } catch (err) {
    // Retry with new session
    await getNSESession();
    const response = await axios.get(url, {
      headers: { ...NSE_HEADERS, Cookie: nseCookies }
    });
    return response.data;
  }
}

// Major NSE listed companies with their incorporation dates (for horoscope)
// This is a curated list of major companies - in production this would come from a database
const NSE_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', incorporationDate: '1973-05-08', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', incorporationDate: '1968-04-01', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', incorporationDate: '1994-08-30', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd', incorporationDate: '1981-07-02', sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', incorporationDate: '1994-01-05', sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', incorporationDate: '1933-10-17', sector: 'FMCG' },
  { symbol: 'ITC', name: 'ITC Ltd', incorporationDate: '1910-08-24', sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', incorporationDate: '1955-07-01', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', incorporationDate: '1995-07-07', sector: 'Telecom' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', incorporationDate: '1985-11-21', sector: 'Banking' },
  { symbol: 'LICI', name: 'Life Insurance Corporation', incorporationDate: '1956-09-01', sector: 'Insurance' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', incorporationDate: '1946-02-07', sector: 'Infrastructure' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', incorporationDate: '1987-03-25', sector: 'Finance' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', incorporationDate: '1991-11-12', sector: 'IT' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', incorporationDate: '1942-02-01', sector: 'Paints' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', incorporationDate: '1981-02-24', sector: 'Automobile' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', incorporationDate: '1983-12-17', sector: 'Pharma' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', incorporationDate: '1945-09-01', sector: 'Automobile' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', incorporationDate: '1984-07-26', sector: 'Consumer Goods' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', incorporationDate: '1993-12-03', sector: 'Banking' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', incorporationDate: '1945-12-29', sector: 'IT' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', incorporationDate: '1993-11-17', sector: 'Conglomerate' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', incorporationDate: '1907-08-26', sector: 'Metals' },
  { symbol: 'NTPC', name: 'NTPC Ltd', incorporationDate: '1975-11-07', sector: 'Power' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', incorporationDate: '1989-10-23', sector: 'Power' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation', incorporationDate: '1956-08-14', sector: 'Energy' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', incorporationDate: '1973-11-01', sector: 'Mining' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', incorporationDate: '2000-08-24', sector: 'Cement' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', incorporationDate: '1994-03-15', sector: 'Metals' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', incorporationDate: '1945-10-02', sector: 'Automobile' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', incorporationDate: '1986-10-24', sector: 'IT' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', incorporationDate: '1959-03-28', sector: 'FMCG' },
  { symbol: 'DRREDDY', name: 'Dr Reddys Laboratories', incorporationDate: '1984-02-24', sector: 'Pharma' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', incorporationDate: '1935-09-22', sector: 'Pharma' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', incorporationDate: '1990-06-01', sector: 'Pharma' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', incorporationDate: '2007-04-30', sector: 'Finance' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', incorporationDate: '1947-08-25', sector: 'Diversified' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', incorporationDate: '1918-03-21', sector: 'FMCG' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', incorporationDate: '1984-01-19', sector: 'Automobile' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', incorporationDate: '1979-01-05', sector: 'Healthcare' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', incorporationDate: '1962-11-01', sector: 'FMCG' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', incorporationDate: '1994-01-31', sector: 'Banking' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', incorporationDate: '1982-04-29', sector: 'Automobile' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd', incorporationDate: '1998-05-26', sector: 'Infrastructure' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Co', incorporationDate: '2000-10-03', sector: 'Insurance' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp', incorporationDate: '1952-11-03', sector: 'Energy' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', incorporationDate: '1958-12-15', sector: 'Metals' },
  { symbol: 'VEDL', name: 'Vedanta Ltd', incorporationDate: '1965-06-25', sector: 'Mining' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co', incorporationDate: '2000-01-14', sector: 'Insurance' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', incorporationDate: '1908-07-20', sector: 'Banking' }
];

// GET /api/nse/companies - List all NSE companies
router.get('/companies', (req, res) => {
  const { search, sector } = req.query;
  let companies = [...NSE_COMPANIES];
  
  if (search) {
    const q = search.toLowerCase();
    companies = companies.filter(c => 
      c.symbol.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q)
    );
  }
  
  if (sector) {
    companies = companies.filter(c => c.sector === sector);
  }
  
  res.json({ companies, total: companies.length });
});

// GET /api/nse/quote/:symbol - Get real-time quote
router.get('/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  try {
    // Use Yahoo Finance API for real-time data (more reliable for API access)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1m&range=1d`;
    const response = await axios.get(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const result = response.data.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0];
    
    const priceData = {
      symbol: symbol,
      name: NSE_COMPANIES.find(c => c.symbol === symbol)?.name || symbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      open: quotes.open?.[0],
      high: meta.regularMarketDayHigh || Math.max(...(quotes.high || [0]).filter(Boolean)),
      low: meta.regularMarketDayLow || Math.min(...(quotes.low || [Infinity]).filter(Boolean)),
      volume: meta.regularMarketVolume,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      currency: meta.currency,
      exchange: meta.exchangeName,
      timestamp: new Date().toISOString(),
      intradayData: timestamps.map((t, i) => ({
        time: new Date(t * 1000).toISOString(),
        open: quotes.open?.[i],
        high: quotes.high?.[i],
        low: quotes.low?.[i],
        close: quotes.close?.[i],
        volume: quotes.volume?.[i]
      })).filter(d => d.close !== null)
    };
    
    cache.set(cacheKey, priceData, 60); // Cache for 60 seconds
    res.json(priceData);
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}:`, err.message);
    // Return mock data as fallback
    res.json({
      symbol,
      name: NSE_COMPANIES.find(c => c.symbol === symbol)?.name || symbol,
      currentPrice: 0,
      previousClose: 0,
      error: 'Unable to fetch live data. Please try again.',
      intradayData: []
    });
  }
});

// GET /api/nse/sectors - Get sector list
router.get('/sectors', (req, res) => {
  const sectors = [...new Set(NSE_COMPANIES.map(c => c.sector))].sort();
  res.json({ sectors });
});

module.exports = router;
