import React from 'react';

const PLANET_NATURES = {
  'Moon': 'neutral', 'Sun': 'bullish', 'Mars': 'bearish',
  'Mercury': 'neutral', 'Jupiter': 'bullish', 'Venus': 'bullish',
  'Saturn': 'bearish', 'Rahu': 'neutral', 'Ketu': 'bearish'
};

function getNature(planetStr) {
  for (const [name, nature] of Object.entries(PLANET_NATURES)) {
    if (planetStr.includes(name)) return nature;
  }
  return 'neutral';
}

function KPLevels({ prediction }) {
  if (!prediction) return null;

  const levels = [
    { label: 'L1 - Planet (Sentiment)', value: prediction.moonLevels.planet, desc: 'Primary timing planet' },
    { label: 'L2 - Sign Lord', value: prediction.moonLevels.signLord, desc: 'Zodiac sign influence' },
    { label: 'L3 - Star Lord (Nakshatra)', value: prediction.moonLevels.starLord, desc: 'Major directional force' },
    { label: 'L4 - Sub Lord', value: prediction.moonLevels.subLord, desc: 'Confirms/denies star lord' },
    { label: 'L5 - Prana Lord', value: prediction.moonLevels.pranaLord, desc: 'Finest timing trigger' }
  ];

  const ascLevels = [
    { label: 'L1 - Ascendant Planet', value: prediction.ascLevels.planet, desc: 'Rising sign ruler' },
    { label: 'L2 - Asc Sign Lord', value: prediction.ascLevels.signLord, desc: 'Zodiac influence on Asc' },
    { label: 'L3 - Asc Star Lord', value: prediction.ascLevels.starLord, desc: 'Nakshatra of Ascendant' },
    { label: 'L4 - Asc Sub Lord', value: prediction.ascLevels.subLord, desc: 'Sub-division ruler' },
    { label: 'L5 - Asc Prana Lord', value: prediction.ascLevels.pranaLord, desc: 'Finest Asc trigger' }
  ];

  return (
    <div className="kp-levels-container">
      <div className="kp-levels-title">
        <span>&#9798;</span> Current KP 5-Level Analysis 
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          (Time: {prediction.istTime || `${String(prediction.hour).padStart(2,'0')}:${String(prediction.minute).padStart(2,'0')}`}
          {prediction.location && ` | ${prediction.location}`})
        </span>
      </div>

      {/* Mumbai Transit Info Badge */}
      {prediction.moonHouse && (
        <div style={{ 
          display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap',
          padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
          border: '1px solid rgba(156, 39, 176, 0.2)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
            &#127751; Mumbai Transit
          </span>
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            Moon House: <strong style={{ color: [2,5,10,11].includes(prediction.moonHouse) ? 'var(--bullish)' : [6,8,12].includes(prediction.moonHouse) ? 'var(--bearish)' : 'var(--neutral)' }}>
              H{prediction.moonHouse}
            </strong> ({prediction.moonHouseSignificance || ''})
          </span>
          {prediction.ascendantSign && (
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              Asc: <strong style={{ color: 'var(--accent-gold)' }}>{prediction.ascendantSign}</strong>
            </span>
          )}
          {prediction.transitAspectScore && (
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              Transit Aspect: <strong style={{ color: parseFloat(prediction.transitAspectScore) > 0 ? 'var(--bullish)' : 'var(--bearish)' }}>
                {prediction.transitAspectScore}
              </strong>
            </span>
          )}
        </div>
      )}
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: 600 }}>
          &#9790; Moon Transit (Primary Timer)
        </div>
        <div className="kp-levels-grid">
          {levels.map((level, idx) => {
            const nature = getNature(level.value);
            return (
              <div key={idx} className="kp-level-card">
                <div className="kp-level-header">
                  <span className="kp-level-label">{level.label}</span>
                  <span className={`kp-level-nature ${nature}`}>
                    {nature === 'bullish' ? '&#9650; Bullish' : nature === 'bearish' ? '&#9660; Bearish' : '&#9644; Neutral'}
                  </span>
                </div>
                <div className="kp-level-value">{level.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {level.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginBottom: '8px', fontWeight: 600 }}>
          &#9788; Ascendant (Market Environment)
        </div>
        <div className="kp-levels-grid">
          {ascLevels.map((level, idx) => {
            const nature = getNature(level.value);
            return (
              <div key={idx} className="kp-level-card">
                <div className="kp-level-header">
                  <span className="kp-level-label">{level.label}</span>
                  <span className={`kp-level-nature ${nature}`}>
                    {nature === 'bullish' ? '&#9650; Bullish' : nature === 'bearish' ? '&#9660; Bearish' : '&#9644; Neutral'}
                  </span>
                </div>
                <div className="kp-level-value">{level.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {level.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default KPLevels;
