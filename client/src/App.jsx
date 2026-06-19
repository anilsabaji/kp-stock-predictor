import React, { useState, useEffect, useCallback } from 'react';
import StockList from './components/StockList';
import StockInfoBar from './components/StockInfoBar';
import KPChart from './components/KPChart';
import KPLevels from './components/KPLevels';
import PredictionTimeline from './components/PredictionTimeline';
import CompanyHoroscope from './components/CompanyHoroscope';
import MumbaiTransit from './components/MumbaiTransit';
import NewsPanel from './components/NewsPanel';
import WelcomeScreen from './components/WelcomeScreen';

const API_BASE = '/api';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [transit, setTransit] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionDate, setPredictionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchStockData = useCallback(async (symbol) => {
    setLoading(true);
    try {
      const [quoteRes, predictRes, horoscopeRes, transitRes, newsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/nse/quote/${symbol}`).then(r => r.json()),
        fetch(`${API_BASE}/kp/predictions?date=${predictionDate}&interval=5`).then(r => r.json()),
        fetch(`${API_BASE}/kp/horoscope/${symbol}`).then(r => r.json()),
        fetch(`${API_BASE}/kp/transit/${symbol}?date=${predictionDate}`).then(r => r.json()),
        fetch(`${API_BASE}/news/${symbol}`).then(r => r.json())
      ]);

      if (quoteRes.status === 'fulfilled') setStockQuote(quoteRes.value);
      if (predictRes.status === 'fulfilled') setPredictions(predictRes.value);
      if (horoscopeRes.status === 'fulfilled') setHoroscope(horoscopeRes.value);
      if (transitRes.status === 'fulfilled') setTransit(transitRes.value);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value);
    } catch (err) {
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  }, [predictionDate]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock.symbol);
    }
  }, [selectedStock, fetchStockData]);

  // Auto-refresh price every 60 seconds
  useEffect(() => {
    if (!selectedStock) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE}/nse/quote/${selectedStock.symbol}`)
        .then(r => r.json())
        .then(data => setStockQuote(data))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
  };

  const handleDateChange = (newDate) => {
    setPredictionDate(newDate);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">&#9790;</span>
            <span>KP Stock Predictor</span>
          </div>
          <span className="header-subtitle">Krishnamurti Paddhati &bull; NSE India</span>
        </div>
        <div className="date-picker">
          <a
            href="/docs/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-gold)',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius)',
              marginRight: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--accent-gold)'; e.target.style.color = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent-gold)'; }}
          >
            &#128214; Manual
          </a>
          <a
            href="/docs/kp-stock-predictor-standalone.html"
            download="kp-stock-predictor-standalone.html"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-blue)',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid var(--accent-blue)',
              borderRadius: 'var(--radius)',
              marginRight: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--accent-blue)'; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent-blue)'; }}
          >
            &#11015; Download App (HTML)
          </a>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prediction Date:</label>
          <input
            type="date"
            className="date-input"
            value={predictionDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Stock Screener */}
        <StockList 
          onSelectStock={handleStockSelect}
          selectedSymbol={selectedStock?.symbol}
        />

        {/* Center Panel - Charts & Predictions */}
        <div className="center-panel">
          {!selectedStock ? (
            <WelcomeScreen />
          ) : loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              Loading KP analysis for {selectedStock.symbol}...
            </div>
          ) : (
            <>
              {/* Stock Info Bar */}
              {stockQuote && <StockInfoBar quote={stockQuote} transit={transit} />}

              {/* KP Prediction Chart */}
              {predictions && (
                <KPChart 
                  predictions={predictions} 
                  priceData={stockQuote?.intradayData}
                  symbol={selectedStock.symbol}
                />
              )}

              {/* Current KP Levels */}
              {predictions && predictions.predictions.length > 0 && (
                <KPLevels prediction={predictions.predictions[Math.floor(predictions.predictions.length / 2)]} />
              )}

              {/* Mumbai Transit Dashboard */}
              <MumbaiTransit date={predictionDate} />

              {/* Prediction Timeline */}
              {predictions && (
                <PredictionTimeline predictions={predictions} />
              )}

              {/* Company Horoscope */}
              {horoscope && <CompanyHoroscope horoscope={horoscope} />}
            </>
          )}
        </div>

        {/* Right Panel - News */}
        <NewsPanel 
          news={news}
          symbol={selectedStock?.symbol}
        />
      </div>
    </div>
  );
}

export default App;
