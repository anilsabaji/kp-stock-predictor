import React, { useState } from 'react';

function PredictionTimeline({ predictions }) {
  const [filter, setFilter] = useState('all');
  
  if (!predictions || !predictions.predictions) return null;

  const allPredictions = predictions.predictions;
  const filtered = filter === 'all' ? allPredictions :
    filter === 'buy' ? allPredictions.filter(p => p.signal.includes('BUY')) :
    filter === 'sell' ? allPredictions.filter(p => p.signal.includes('SELL')) :
    allPredictions.filter(p => p.signal === 'NEUTRAL');

  return (
    <div className="prediction-timeline">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="chart-title">
          <span>&#9201;</span> Minute-Level Prediction Timeline
        </div>
        <div className="chart-controls">
          <button className={`chart-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({allPredictions.length})
          </button>
          <button className={`chart-btn ${filter === 'buy' ? 'active' : ''}`} onClick={() => setFilter('buy')}>
            Buy ({allPredictions.filter(p => p.signal.includes('BUY')).length})
          </button>
          <button className={`chart-btn ${filter === 'sell' ? 'active' : ''}`} onClick={() => setFilter('sell')}>
            Sell ({allPredictions.filter(p => p.signal.includes('SELL')).length})
          </button>
          <button className={`chart-btn ${filter === 'neutral' ? 'active' : ''}`} onClick={() => setFilter('neutral')}>
            Neutral
          </button>
        </div>
      </div>

      {filtered.map((pred, idx) => {
        const score = parseFloat(pred.score);
        return (
          <div key={idx} className="timeline-item">
            <span className="timeline-time">
              {pred.istTime || `${String(pred.hour).padStart(2, '0')}:${String(pred.minute).padStart(2, '0')}`}
            </span>
            <span className={`timeline-signal ${pred.signal}`}>
              {pred.signal.replace('_', ' ')}
            </span>
            {pred.moonHouse && (
              <span style={{ 
                fontSize: '0.68rem', padding: '2px 6px', borderRadius: '3px', minWidth: '28px', textAlign: 'center',
                background: [2,5,10,11].includes(pred.moonHouse) ? 'rgba(0,200,83,0.1)' : 
                            [6,8,12].includes(pred.moonHouse) ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)',
                color: [2,5,10,11].includes(pred.moonHouse) ? 'var(--bullish)' : 
                       [6,8,12].includes(pred.moonHouse) ? 'var(--bearish)' : 'var(--neutral)'
              }}>
                H{pred.moonHouse}
              </span>
            )}
            <span className="timeline-planets">
              {pred.moonLevels.starLord} &rarr; {pred.moonLevels.subLord} &rarr; {pred.moonLevels.pranaLord}
            </span>
            <span className="timeline-score" style={{
              color: score > 0 ? 'var(--bullish)' : score < 0 ? 'var(--bearish)' : 'var(--neutral)'
            }}>
              {score > 0 ? '+' : ''}{pred.score}
            </span>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          No predictions match this filter
        </div>
      )}
    </div>
  );
}

export default PredictionTimeline;
