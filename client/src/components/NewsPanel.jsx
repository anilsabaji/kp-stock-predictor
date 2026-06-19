import React from 'react';

function NewsPanel({ news, symbol }) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="right-panel">
      <div className="news-header">
        <div className="news-title">
          <span>&#9993;</span> Stock News
          {symbol && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({symbol})</span>}
        </div>
        {news?.overallSentiment && (
          <span className={`news-sentiment-badge ${news.overallSentiment}`}>
            {news.overallSentiment === 'positive' ? '&#9650;' : news.overallSentiment === 'negative' ? '&#9660;' : '&#9644;'}
            {' '}{news.overallSentiment}
          </span>
        )}
      </div>

      {/* Source breakdown (Yahoo / NSE / Google) */}
      {news?.sources && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '0.66rem'
        }}>
          {Object.entries(news.sources).map(([prov, count]) => (
            <span key={prov} style={{
              padding: '2px 7px',
              borderRadius: '10px',
              background: 'rgba(33, 150, 243, 0.12)',
              color: 'var(--accent-blue)'
            }}>
              {prov}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Sentiment breakdown */}
      {news?.sentimentBreakdown && (
        <div style={{ 
          padding: '10px 16px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          fontSize: '0.72rem'
        }}>
          <span style={{ color: 'var(--bullish)' }}>
            &#9650; {news.sentimentBreakdown.positive} positive
          </span>
          <span style={{ color: 'var(--bearish)' }}>
            &#9660; {news.sentimentBreakdown.negative} negative
          </span>
          <span style={{ color: 'var(--neutral)' }}>
            &#9644; {news.sentimentBreakdown.neutral} neutral
          </span>
        </div>
      )}

      <div className="news-list">
        {!symbol && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>&#9993;</div>
            <div style={{ fontSize: '0.85rem' }}>Select a stock to view related news</div>
          </div>
        )}

        {symbol && !news && (
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading news...
          </div>
        )}

        {news?.articles?.map((article, idx) => (
          <a 
            key={idx} 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div className="news-item">
              <div className="news-item-title">{article.title}</div>
              <div className="news-item-meta">
                <span className="news-item-source">
                  {article.source}{article.provider ? ` \u2022 ${article.provider}` : ''}
                </span>
                <span className={`news-item-sentiment ${article.sentiment}`} style={{
                  background: article.sentiment === 'positive' ? 'rgba(0, 200, 83, 0.1)' :
                             article.sentiment === 'negative' ? 'rgba(255, 23, 68, 0.1)' :
                             'rgba(255, 152, 0, 0.1)',
                  color: article.sentiment === 'positive' ? 'var(--bullish)' :
                         article.sentiment === 'negative' ? 'var(--bearish)' : 'var(--neutral)',
                  padding: '2px 6px', borderRadius: '3px'
                }}>
                  {article.sentiment}
                </span>
                <span className="news-item-time">{formatTime(article.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}

        {news?.articles?.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No news articles found for {symbol}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsPanel;
