import React, { useState, useEffect } from 'react';

function MumbaiTransit({ date }) {
  const [transit, setTransit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTime, setExpandedTime] = useState(null);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`/api/kp/mumbai-transit?date=${date}`)
      .then(r => r.json())
      .then(data => { setTransit(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading Mumbai Transit Data...
        </div>
      </div>
    );
  }

  if (!transit) return null;

  const sentimentColor = transit.dailySentiment === 'BULLISH' ? 'var(--bullish)' : 
                         transit.dailySentiment === 'BEARISH' ? 'var(--bearish)' : 'var(--neutral)';

  return (
    <div className="chart-container" style={{ border: '1px solid rgba(156, 39, 176, 0.3)' }}>
      <div className="chart-header">
        <div className="chart-title">
          <span style={{ fontSize: '1.3rem' }}>&#127751;</span>
          Mumbai (NSE) Planetary Transit
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {transit.location.name}
          </span>
          <span style={{ 
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
            background: transit.dailySentiment === 'BULLISH' ? 'rgba(0, 200, 83, 0.15)' : 
                        transit.dailySentiment === 'BEARISH' ? 'rgba(255, 23, 68, 0.15)' : 'rgba(255, 152, 0, 0.15)',
            color: sentimentColor
          }}>
            Day Score: {transit.dailyScore} &bull; {transit.dailySentiment}
          </span>
        </div>
      </div>

      {/* Location Info */}
      <div style={{ 
        display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px',
        padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
        fontSize: '0.75rem', color: 'var(--text-secondary)'
      }}>
        <span>&#128205; Lat: {transit.location.latitude}°N</span>
        <span>&#127760; Lng: {transit.location.longitude}°E</span>
        <span>&#128336; IST (UTC+5:30)</span>
        <span>&#9734; Ayanamsa (Lahiri): {transit.ayanamsa}°</span>
        <span>&#128197; {transit.date}</span>
      </div>

      {/* Key Market Transits */}
      {transit.keyTransits && transit.keyTransits.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '8px' }}>
            &#9733; Key Market-Affecting Transits (Houses 2, 5, 6, 10, 11)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {transit.keyTransits.map((kt, idx) => (
              <div key={idx} style={{ 
                padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
                border: `1px solid ${kt.impact === 'POSITIVE' ? 'rgba(0,200,83,0.3)' : kt.impact === 'NEGATIVE' ? 'rgba(255,23,68,0.3)' : 'var(--border)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>{kt.symbol} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{kt.planet}</span></span>
                  <span style={{ 
                    fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '3px',
                    background: kt.impact === 'POSITIVE' ? 'rgba(0,200,83,0.1)' : kt.impact === 'NEGATIVE' ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)',
                    color: kt.impact === 'POSITIVE' ? 'var(--bullish)' : kt.impact === 'NEGATIVE' ? 'var(--bearish)' : 'var(--neutral)'
                  }}>
                    {kt.impact}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  House {kt.house}: {kt.houseSignificance}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                  {kt.sign} &bull; {kt.nakshatra}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Time Transit Table */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '8px' }}>
          &#128336; Transit at Key Market Times
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Time</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Ascendant</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Asc Star Lord</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Asc Sub Lord</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Moon Sign</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Moon House</th>
                <th style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {transit.transitReport.map((tr, idx) => (
                <React.Fragment key={idx}>
                  <tr style={{ 
                    borderBottom: '1px solid var(--border)',
                    background: expandedTime === idx ? 'var(--bg-hover)' : 'transparent'
                  }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tr.time}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ color: 'var(--accent-gold)' }}>{tr.ascendant.sign}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginLeft: '4px' }}>
                        ({tr.ascendant.siderealDegree}°)
                      </span>
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{tr.ascendant.starLord}</td>
                    <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{tr.ascendant.subLord}</td>
                    <td style={{ padding: '8px', color: 'var(--accent-blue)' }}>
                      {tr.planets.MOON?.sign || '-'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ 
                        padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem',
                        background: [2,5,10,11].includes(tr.planets.MOON?.house) ? 'rgba(0,200,83,0.1)' : 
                                    [6,8,12].includes(tr.planets.MOON?.house) ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)',
                        color: [2,5,10,11].includes(tr.planets.MOON?.house) ? 'var(--bullish)' : 
                               [6,8,12].includes(tr.planets.MOON?.house) ? 'var(--bearish)' : 'var(--neutral)'
                      }}>
                        H{tr.planets.MOON?.house}
                      </span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setExpandedTime(expandedTime === idx ? null : idx)}
                        className="chart-btn"
                        style={{ padding: '2px 8px' }}
                      >
                        {expandedTime === idx ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedTime === idx && (
                    <tr>
                      <td colSpan="7" style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '8px', color: 'var(--accent-purple)' }}>
                          All Planet Positions at {tr.time}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                          {Object.entries(tr.planets).map(([pName, pData]) => (
                            <div key={pName} style={{ 
                              padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px',
                              border: '1px solid var(--border)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{pData.symbol} {pName}</span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  color: parseFloat(pData.score) > 0 ? 'var(--bullish)' : parseFloat(pData.score) < 0 ? 'var(--bearish)' : 'var(--neutral)'
                                }}>
                                  {pData.score}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                {pData.sign} &bull; {pData.nakshatra} &bull; H{pData.house}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                ★{pData.levels.starLord} → Sub:{pData.levels.subLord} → Pr:{pData.levels.pranaLord}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* House Cusps */}
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, margin: '10px 0 6px', color: 'var(--accent-gold)' }}>
                          House Cusps (Placidus - Mumbai)
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {tr.houses.map(h => (
                            <span key={h.house} style={{ 
                              padding: '3px 8px', background: 'var(--bg-primary)', borderRadius: '4px',
                              fontSize: '0.65rem', border: '1px solid var(--border)'
                            }}>
                              <strong>H{h.house}</strong>: {h.sign} {h.siderealDegree}° (★{h.starLord})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ascendant Prana Lord Progression */}
      <div style={{ 
        padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
        fontSize: '0.72rem', color: 'var(--text-muted)'
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> Transit positions are calculated for 
        Mumbai (19.056°N, 72.847°E) using Placidus house system with Lahiri Ayanamsa as per KP method. 
        The Ascendant changes sign approximately every 2 hours, making intraday timing critical. 
        Moon's house position during market hours directly affects speculative outcomes (Houses 2, 5, 10, 11 = gains; Houses 6, 8, 12 = losses).
      </div>
    </div>
  );
}

export default MumbaiTransit;
