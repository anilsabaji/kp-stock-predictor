/**
 * API Service for KP Stock Predictor Mobile App
 * Fetches real-time stock data and news from internet sources
 */

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

// NSE Companies with incorporation dates
export const NSE_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', date: '1973-05-08', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', date: '1968-04-01', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', date: '1994-08-30', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys', date: '1981-07-02', sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', date: '1994-01-05', sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', date: '1933-10-17', sector: 'FMCG' },
  { symbol: 'ITC', name: 'ITC Limited', date: '1910-08-24', sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', date: '1955-07-01', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', date: '1995-07-07', sector: 'Telecom' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', date: '1985-11-21', sector: 'Banking' },
  { symbol: 'LT', name: 'Larsen & Toubro', date: '1946-02-07', sector: 'Infrastructure' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', date: '1987-03-25', sector: 'Finance' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', date: '1991-11-12', sector: 'IT' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', date: '1942-02-01', sector: 'Paints' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', date: '1981-02-24', sector: 'Automobile' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', date: '1983-12-17', sector: 'Pharma' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', date: '1945-09-01', sector: 'Automobile' },
  { symbol: 'TITAN', name: 'Titan Company', date: '1984-07-26', sector: 'Consumer' },
  { symbol: 'AXISBANK', name: 'Axis Bank', date: '1993-12-03', sector: 'Banking' },
  { symbol: 'WIPRO', name: 'Wipro', date: '1945-12-29', sector: 'IT' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', date: '1993-11-17', sector: 'Conglomerate' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', date: '1907-08-26', sector: 'Metals' },
  { symbol: 'NTPC', name: 'NTPC', date: '1975-11-07', sector: 'Power' },
  { symbol: 'ONGC', name: 'ONGC', date: '1956-08-14', sector: 'Energy' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', date: '1994-03-15', sector: 'Metals' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', date: '1945-10-02', sector: 'Automobile' },
  { symbol: 'TECHM', name: 'Tech Mahindra', date: '1986-10-24', sector: 'IT' },
  { symbol: 'NESTLEIND', name: 'Nestle India', date: '1959-03-28', sector: 'FMCG' },
  { symbol: 'DRREDDY', name: 'Dr Reddys Labs', date: '1984-02-24', sector: 'Pharma' },
  { symbol: 'CIPLA', name: 'Cipla', date: '1935-09-22', sector: 'Pharma' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', date: '1989-10-23', sector: 'Power' },
  { symbol: 'COALINDIA', name: 'Coal India', date: '1973-11-01', sector: 'Mining' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', date: '1918-03-21', sector: 'FMCG' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', date: '1984-01-19', sector: 'Automobile' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', date: '2007-04-30', sector: 'Finance' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank', date: '1994-01-31', sector: 'Banking' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors', date: '1982-04-29', sector: 'Automobile' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', date: '1979-01-05', sector: 'Healthcare' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance', date: '2000-10-03', sector: 'Insurance' },
  { symbol: 'BPCL', name: 'Bharat Petroleum', date: '1952-11-03', sector: 'Energy' },
];

/**
 * Fetch real-time stock price from Yahoo Finance
 */
export async function fetchStockQuote(symbol) {
  try {
    const url = `${YAHOO_BASE}/${symbol}.NS?interval=1m&range=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0] || {};
    const timestamps = result.timestamp || [];

    return {
      symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      intradayData: timestamps.map((t, i) => ({
        time: t * 1000,
        close: quotes.close?.[i],
        volume: quotes.volume?.[i],
      })).filter(d => d.close != null),
    };
  } catch (err) {
    console.warn('Quote fetch error:', err.message);
    return null;
  }
}

/**
 * SOURCE 1: Google News RSS
 */
async function fetchGoogleNews(symbol, companyName) {
  try {
    const query = encodeURIComponent(`${companyName} ${symbol} NSE stock`);
    const url = `${GOOGLE_NEWS_RSS}?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const xml = await response.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    return items.slice(0, 12).map(item => {
      const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
      const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
      const source = (item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || 'News';
      const ct = title.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      return {
        title: ct, url: link.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: source.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        provider: 'Google News', sentiment: analyzeSentiment(ct),
      };
    });
  } catch (err) { return []; }
}

/**
 * SOURCE 2: Yahoo Finance news (search endpoint)
 */
async function fetchYahooNews(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}.NS&newsCount=12&quotesCount=0`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return (data.news || []).map(n => ({
      title: n.title,
      url: n.link || `https://finance.yahoo.com/quote/${symbol}.NS`,
      publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
      source: n.publisher || 'Yahoo Finance',
      provider: 'Yahoo Finance', sentiment: analyzeSentiment(n.title || ''),
    })).filter(n => n.title);
  } catch (err) { return []; }
}

/**
 * SOURCE 3: NSE India corporate announcements
 */
async function fetchNSENews(symbol) {
  try {
    // Prime a session cookie first
    await fetch('https://www.nseindia.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const url = `https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=${symbol}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json',
        'Referer': `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}` },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    return items.slice(0, 10).map(a => {
      const title = a.subject || a.desc || a.attchmntText || '';
      return {
        title, url: a.attchmntFile || `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`,
        publishedAt: a.an_dt ? new Date(a.an_dt).toISOString() : new Date().toISOString(),
        source: 'NSE Announcement', provider: 'NSE India', sentiment: analyzeSentiment(title),
      };
    }).filter(n => n.title);
  } catch (err) { return []; }
}

/**
 * Aggregate news from Google + Yahoo + NSE, dedupe, sort by recency
 */
export async function fetchStockNews(symbol, companyName) {
  try {
    const [google, yahoo, nse] = await Promise.all([
      fetchGoogleNews(symbol, companyName),
      fetchYahooNews(symbol),
      fetchNSENews(symbol),
    ]);
    const seen = new Set(), merged = [];
    for (const list of [google, yahoo, nse]) {
      for (const n of list) {
        const key = n.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
        if (key && !seen.has(key)) { seen.add(key); merged.push(n); }
      }
    }
    merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return merged;
  } catch (err) {
    console.warn('News fetch error:', err.message);
    return [];
  }
}

function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const bull = ['surge', 'rally', 'gain', 'profit', 'growth', 'bullish', 'record', 'boost', 'positive', 'buy', 'upgrade'].filter(w => lower.includes(w)).length;
  const bear = ['fall', 'drop', 'loss', 'crash', 'bearish', 'sell', 'decline', 'negative', 'downgrade', 'concern'].filter(w => lower.includes(w)).length;
  if (bull > bear) return 'positive';
  if (bear > bull) return 'negative';
  return 'neutral';
}
