import React from 'react';

function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">&#9790;&#127751;</div>
      <div className="welcome-title">KP Astrology Stock Predictor</div>
      <div className="welcome-text">
        Select a stock from the left panel to view KP Astrology-based 
        predictions at minute-level granularity using the 5-level system 
        with Mumbai (NSE) planetary transit positions.
      </div>
      <div style={{ 
        marginTop: '24px', 
        textAlign: 'left', 
        background: 'var(--bg-card)', 
        padding: '20px', 
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        maxWidth: '550px',
        width: '100%'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '12px', fontWeight: 600 }}>
          Five KP Levels (Star Lord to Prana Lord):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { level: 'L1', name: 'Planet', desc: 'Primary sentiment indicator', icon: '&#9790;' },
            { level: 'L2', name: 'Sign Lord', desc: 'Zodiac sign ruler influence', icon: '&#9801;' },
            { level: 'L3', name: 'Star Lord', desc: 'Nakshatra ruler - major force', icon: '&#9734;' },
            { level: 'L4', name: 'Sub Lord', desc: 'Confirms or denies star lord', icon: '&#9679;' },
            { level: 'L5', name: 'Prana Lord', desc: 'Finest timing trigger', icon: '&#10023;' }
          ].map(l => (
            <div key={l.level} style={{ 
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)'
            }}>
              <span style={{ fontSize: '1.2rem', width: '24px' }} dangerouslySetInnerHTML={{ __html: l.icon }}></span>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-blue)' }}>{l.level}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginLeft: '8px' }}>{l.name}</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mumbai Transit Info */}
        <div style={{ 
          marginTop: '16px', padding: '12px', borderRadius: 'var(--radius)',
          background: 'var(--bg-secondary)', border: '1px solid rgba(156, 39, 176, 0.2)'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '8px' }}>
            &#127751; Mumbai (NSE) Transit Positions
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            All predictions use planet positions calculated for <strong style={{ color: 'var(--text-primary)' }}>Mumbai 
            (19.056°N, 72.847°E)</strong> - the location of NSE's Bandra Kurla Complex.
            The Ascendant (Lagna) is computed using <strong>Placidus house system</strong> with 
            <strong> Lahiri Ayanamsa</strong> for sidereal corrections.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
              &#128205; 19.056°N, 72.847°E
            </span>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
              &#128336; IST (UTC+5:30)
            </span>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
              &#127969; Placidus Houses
            </span>
            <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-primary)', borderRadius: '4px', color: 'var(--text-muted)' }}>
              &#9734; Lahiri Ayanamsa
            </span>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--accent-gold)' }}>How it works:</strong><br/>
          1. Company horoscope created from NSE incorporation date<br/>
          2. Current planetary transits calculated for Mumbai's exact coordinates<br/>
          3. Ascendant computed via Placidus for every minute of market hours<br/>
          4. Moon's house position determines speculation/gain/loss periods<br/>
          5. Transit aspects to Ascendant scored for market environment<br/>
          6. All 5 KP levels combined into composite buy/sell signals
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
