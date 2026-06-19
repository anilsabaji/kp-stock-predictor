import React from 'react';

function StockInfoBar({ quote, transit }) {
  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const transitSentiment = transit?.sentiment || 'NEUTRAL';

  return (
    <div className="stock-info-bar">
      <div className="stock-info-left">
        <div>
          <div className="stock-info-name">{quote.symbol}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quote.name}</div>
        </div>
        
        {quote.currentPrice > 0 && (
          <>
            <div className="stock-price" style={{ color: isPositive ? 'var(--bullish)' : 'var(--bearish)' }}>
              &#8377;{quote.currentPrice?.toFixed(2)}
            </div>
            <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent}%)
            </span>
          </>
        )}
        
        {quote.error && (
          <span style={{ fontSize: '0.8rem', color: 'var(--neutral)' }}>
            {quote.error}
          </span>
        )}
      </div>

      <div className="stock-info-right">
        {transit && (
          <div className="info-badge">
            <div className="info-badge-label">KP Transit</div>
            <div className="info-badge-value" style={{
              color: transitSentiment === 'BULLISH' ? 'var(--bullish)' : 
                     transitSentiment === 'BEARISH' ? 'var(--bearish)' : 'var(--neutral)'
            }}>
              {transitSentiment}
            </div>
          </div>
        )}
        
        {quote.volume > 0 && (
          <div className="info-badge">
            <div className="info-badge-label">Volume</div>
            <div className="info-badge-value">
              {(quote.volume / 1000000).toFixed(2)}M
            </div>
          </div>
        )}

        {quote.high > 0 && (
          <div className="info-badge">
            <div className="info-badge-label">Day Range</div>
            <div className="info-badge-value" style={{ fontSize: '0.8rem' }}>
              {quote.low?.toFixed(0)} - {quote.high?.toFixed(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockInfoBar;
