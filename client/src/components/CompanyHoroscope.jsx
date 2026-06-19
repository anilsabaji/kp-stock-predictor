import React from 'react';

function CompanyHoroscope({ horoscope }) {
  if (!horoscope || !horoscope.horoscope) return null;

  const planets = horoscope.horoscope;

  return (
    <div className="horoscope-container">
      <div className="chart-title" style={{ marginBottom: '8px' }}>
        <span>&#9793;</span> Company Natal Chart (Birth Horoscope)
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Based on incorporation date: <strong style={{ color: 'var(--accent-gold)' }}>{horoscope.incorporationDate}</strong>
        {' '}&bull; Symbol: <strong>{horoscope.symbol}</strong>
      </div>

      <div className="planet-grid">
        {Object.entries(planets).map(([planetName, data]) => {
          const score = parseFloat(data.score);
          const scoreColor = score > 0.2 ? 'var(--bullish)' : score < -0.2 ? 'var(--bearish)' : 'var(--neutral)';
          
          return (
            <div key={planetName} className="planet-card">
              <div className="planet-symbol">{data.planetInfo.symbol}</div>
              <div className="planet-name">{data.planetInfo.name}</div>
              <div className="planet-sign">{data.sign}</div>
              <div className="planet-nakshatra">{data.nakshatra}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {data.longitude}&deg;
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6rem', padding: '1px 4px', background: 'var(--bg-primary)', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                  Star: {data.levels.L3_StarLord}
                </span>
                <span style={{ fontSize: '0.6rem', padding: '1px 4px', background: 'var(--bg-primary)', borderRadius: '3px', color: 'var(--text-secondary)' }}>
                  Sub: {data.levels.L4_SubLord}
                </span>
              </div>
              <div className="score-bar">
                <div 
                  className="score-bar-fill"
                  style={{ 
                    width: `${Math.min(Math.abs(score) * 100 + 50, 100)}%`,
                    background: scoreColor
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompanyHoroscope;
