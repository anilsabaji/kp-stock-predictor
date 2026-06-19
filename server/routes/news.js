const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * SOURCE 1: Google News RSS
 */
async function fetchGoogleNews(symbol, companyName) {
  const out = [];
  try {
    const q = `${companyName} OR ${symbol} NSE stock`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await axios.get(url, { headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'] }, timeout: 6000 });
    const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
    for (const item of items.slice(0, 12)) {
      const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
      const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
      const src = (item.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || 'Google News';
      if (title) {
        out.push({
          title: clean(title), url: clean(link),
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: clean(src), provider: 'Google News', sentiment: analyzeSentiment(title),
        });
      }
    }
  } catch (err) {
    console.error('Google News error:', err.message);
  }
  return out;
}

/**
 * SOURCE 2: Yahoo Finance news (search endpoint returns a news[] array)
 */
async function fetchYahooNews(symbol, companyName) {
  const out = [];
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol + '.NS')}&newsCount=12&quotesCount=0`;
    const res = await axios.get(url, { headers: BROWSER_HEADERS, timeout: 6000 });
    const news = (res.data && res.data.news) || [];
    for (const n of news) {
      if (!n.title) continue;
      out.push({
        title: n.title,
        url: n.link || `https://finance.yahoo.com/quote/${symbol}.NS`,
        publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
        source: n.publisher || 'Yahoo Finance',
        provider: 'Yahoo Finance',
        sentiment: analyzeSentiment(n.title),
      });
    }
  } catch (err) {
    console.error('Yahoo News error:', err.message);
  }
  return out;
}

// NSE session cookie (lazy-loaded, shared)
let nseCookies = '';
async function getNSESession() {
  try {
    const res = await axios.get('https://www.nseindia.com/', { headers: BROWSER_HEADERS, timeout: 6000 });
    const c = res.headers['set-cookie'];
    if (c) nseCookies = c.map(x => x.split(';')[0]).join('; ');
  } catch (err) {
    console.error('NSE session error:', err.message);
  }
  return nseCookies;
}

/**
 * SOURCE 3: NSE India corporate announcements / filings
 */
async function fetchNSENews(symbol) {
  const out = [];
  try {
    if (!nseCookies) await getNSESession();
    const url = `https://www.nseindia.com/api/corporate-announcements?index=equities&symbol=${encodeURIComponent(symbol)}`;
    const doFetch = () => axios.get(url, {
      headers: { ...BROWSER_HEADERS, Referer: `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`, Cookie: nseCookies },
      timeout: 7000,
    });
    let res;
    try { res = await doFetch(); }
    catch (e) { await getNSESession(); res = await doFetch(); }

    const items = Array.isArray(res.data) ? res.data : (res.data && res.data.data) || [];
    for (const a of items.slice(0, 10)) {
      const title = a.subject || a.desc || a.attchmntText || a.smIndustry || '';
      if (!title) continue;
      out.push({
        title: title,
        url: a.attchmntFile || `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`,
        publishedAt: a.an_dt || a.sort_date ? new Date(a.an_dt || a.sort_date).toISOString() : new Date().toISOString(),
        source: 'NSE Announcement',
        provider: 'NSE India',
        sentiment: analyzeSentiment(title),
      });
    }
  } catch (err) {
    console.error('NSE News error:', err.message);
  }
  return out;
}

function clean(s) {
  return s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

/**
 * Merge multiple sources, dedupe by normalized title, sort by recency.
 */
function mergeNews(lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const n of list) {
      const key = n.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
      if (key && !seen.has(key)) {
        seen.add(key);
        merged.push(n);
      }
    }
  }
  merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return merged;
}

async function fetchStockNews(symbol, companyName) {
  const cacheKey = `news_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch all three sources in parallel
  const [google, yahoo, nse] = await Promise.all([
    fetchGoogleNews(symbol, companyName),
    fetchYahooNews(symbol, companyName),
    fetchNSENews(symbol),
  ]);

  let allNews = mergeNews([google, yahoo, nse]);

  // Fallback if everything failed
  if (allNews.length === 0) {
    allNews = [
      { title: `${companyName} (${symbol}) - Market Analysis Update`, url: `https://finance.yahoo.com/quote/${symbol}.NS`, publishedAt: new Date().toISOString(), source: 'Yahoo Finance', provider: 'Yahoo Finance', sentiment: 'neutral' },
      { title: `NSE ${symbol}: Corporate Filings & Announcements`, url: `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`, publishedAt: new Date(Date.now() - 3600000).toISOString(), source: 'NSE India', provider: 'NSE India', sentiment: 'neutral' },
      { title: `${symbol} Stock News Search`, url: `https://news.google.com/search?q=${symbol}+NSE`, publishedAt: new Date(Date.now() - 7200000).toISOString(), source: 'Google News', provider: 'Google News', sentiment: 'neutral' },
    ];
  }

  cache.set(cacheKey, allNews, 600);
  return allNews;
}

function analyzeSentiment(text) {
  const bull = ['surge', 'rally', 'gain', 'profit', 'growth', 'bullish', 'up', 'high', 'record', 'boost', 'positive', 'strong', 'outperform', 'buy', 'upgrade', 'jump', 'soar'];
  const bear = ['fall', 'drop', 'loss', 'crash', 'bearish', 'down', 'low', 'sell', 'decline', 'negative', 'weak', 'underperform', 'downgrade', 'concern', 'risk', 'plunge', 'slump'];
  const t = text.toLowerCase();
  let b = 0, r = 0;
  for (const w of bull) if (t.includes(w)) b++;
  for (const w of bear) if (t.includes(w)) r++;
  if (b > r) return 'positive';
  if (r > b) return 'negative';
  return 'neutral';
}

// GET /api/news/:symbol - Get aggregated news for a stock
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const companyNames = {
      'RELIANCE': 'Reliance Industries', 'TCS': 'Tata Consultancy Services',
      'HDFCBANK': 'HDFC Bank', 'INFY': 'Infosys', 'ICICIBANK': 'ICICI Bank',
      'HINDUNILVR': 'Hindustan Unilever', 'ITC': 'ITC Limited',
      'SBIN': 'State Bank of India', 'BHARTIARTL': 'Bharti Airtel',
      'KOTAKBANK': 'Kotak Mahindra Bank', 'LT': 'Larsen Toubro',
      'BAJFINANCE': 'Bajaj Finance', 'HCLTECH': 'HCL Technologies',
      'ASIANPAINT': 'Asian Paints', 'MARUTI': 'Maruti Suzuki',
      'SUNPHARMA': 'Sun Pharmaceutical', 'TATAMOTORS': 'Tata Motors',
      'TITAN': 'Titan Company', 'AXISBANK': 'Axis Bank',
      'WIPRO': 'Wipro', 'TATASTEEL': 'Tata Steel',
      'NTPC': 'NTPC', 'ONGC': 'ONGC', 'COALINDIA': 'Coal India',
      'ADANIENT': 'Adani Enterprises', 'JSWSTEEL': 'JSW Steel',
      'M&M': 'Mahindra Mahindra', 'TECHM': 'Tech Mahindra',
      'NESTLEIND': 'Nestle India', 'DRREDDY': 'Dr Reddys',
      'CIPLA': 'Cipla', 'HEROMOTOCO': 'Hero MotoCorp'
    };

    const companyName = companyNames[symbol.toUpperCase()] || symbol;
    const news = await fetchStockNews(symbol.toUpperCase(), companyName);

    const sentiments = news.map(n => n.sentiment);
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;

    // Count articles per provider
    const bySource = {};
    for (const n of news) bySource[n.provider] = (bySource[n.provider] || 0) + 1;

    res.json({
      symbol: symbol.toUpperCase(),
      companyName,
      newsCount: news.length,
      sources: bySource,
      overallSentiment: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral',
      sentimentBreakdown: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: sentiments.filter(s => s === 'neutral').length
      },
      articles: news
    });
  } catch (err) {
    console.error('News fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
});

module.exports = router;
