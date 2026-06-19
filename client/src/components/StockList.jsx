import React, { useState, useEffect } from 'react';

function StockList({ onSelectStock, selectedSymbol }) {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    // Fetch companies
    fetch('/api/nse/companies')
      .then(r => r.json())
      .then(data => setCompanies(data.companies || []))
      .catch(() => {});

    // Fetch sectors
    fetch('/api/nse/sectors')
      .then(r => r.json())
      .then(data => setSectors(data.sectors || []))
      .catch(() => {});
  }, []);

  const filteredCompanies = companies.filter(c => {
    const matchSearch = !searchQuery || 
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSector = !selectedSector || c.sector === selectedSector;
    return matchSearch && matchSector;
  });

  return (
    <div className="left-panel">
      <div className="panel-header">
        <span>&#9734;</span> NSE Stock Screener
      </div>
      
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="sector-filter">
        <select
          className="sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="">All Sectors</option>
          {sectors.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="stock-list">
        {filteredCompanies.map(company => (
          <div
            key={company.symbol}
            className={`stock-item ${selectedSymbol === company.symbol ? 'active' : ''}`}
            onClick={() => onSelectStock(company)}
          >
            <div>
              <div className="stock-symbol">{company.symbol}</div>
              <div className="stock-name">{company.name}</div>
            </div>
            <span className="stock-sector">{company.sector}</span>
          </div>
        ))}
        {filteredCompanies.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No stocks found
          </div>
        )}
      </div>
    </div>
  );
}

export default StockList;
