import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function KPChart({ predictions, priceData, symbol }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartType, setChartType] = useState('combined');

  useEffect(() => {
    if (!chartRef.current || !predictions) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const predictionData = predictions.predictions || [];

    // Prepare KP score data
    const kpLabels = predictionData.map(p => {
      const h = String(p.hour).padStart(2, '0');
      const m = String(p.minute).padStart(2, '0');
      return `${h}:${m}`;
    });

    const kpScores = predictionData.map(p => parseFloat(p.score));

    // Color code based on signal
    const barColors = predictionData.map(p => {
      switch(p.signal) {
        case 'STRONG_BUY': return 'rgba(0, 200, 83, 0.8)';
        case 'BUY': return 'rgba(102, 187, 106, 0.6)';
        case 'STRONG_SELL': return 'rgba(255, 23, 68, 0.8)';
        case 'SELL': return 'rgba(239, 83, 80, 0.6)';
        default: return 'rgba(255, 152, 0, 0.5)';
      }
    });

    const datasets = [];

    // KP Score Line
    datasets.push({
      label: 'KP Composite Score',
      data: kpScores,
      borderColor: '#f0b90b',
      backgroundColor: 'rgba(240, 185, 11, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      yAxisID: 'y',
      pointRadius: 1,
      pointHoverRadius: 4,
      order: 1
    });

    // Signal bars
    if (chartType === 'combined' || chartType === 'signals') {
      datasets.push({
        label: 'Signal Strength',
        data: kpScores.map(s => Math.abs(s)),
        backgroundColor: barColors,
        type: 'bar',
        yAxisID: 'y',
        barPercentage: 0.6,
        order: 2
      });
    }

    // Moon House bonus line (Mumbai transit)
    if (chartType === 'combined' || chartType === 'signals') {
      const moonHouseData = predictionData.map(p => parseFloat(p.moonHouseBonus || 0));
      if (moonHouseData.some(v => v !== 0)) {
        datasets.push({
          label: 'Moon House Effect (Mumbai)',
          data: moonHouseData,
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.05)',
          borderWidth: 1.5,
          borderDash: [4, 3],
          fill: false,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 0,
          pointHoverRadius: 3,
          order: 0
        });
      }
    }

    // Price overlay if available
    if (priceData && priceData.length > 0 && (chartType === 'combined' || chartType === 'price')) {
      const pricePoints = priceData.slice(0, kpLabels.length).map(d => d?.close || null);
      if (pricePoints.some(p => p !== null)) {
        datasets.push({
          label: `${symbol} Price (INR)`,
          data: pricePoints,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 0,
          pointHoverRadius: 3,
          order: 0
        });
      }
    }

    const config = {
      type: 'line',
      data: {
        labels: kpLabels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#8899aa',
              font: { size: 11 },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: '#1e2a3a',
            titleColor: '#e8eef4',
            bodyColor: '#8899aa',
            borderColor: '#2a3a4a',
            borderWidth: 1,
            callbacks: {
              afterBody: function(context) {
                const idx = context[0].dataIndex;
                const pred = predictionData[idx];
                if (!pred) return '';
                const lines = [
                  '',
                  `Signal: ${pred.signal}`,
                  `Location: Mumbai (19.06°N, 72.85°E)`,
                  `Moon: ${pred.moonLevels.starLord} > ${pred.moonLevels.subLord} > ${pred.moonLevels.pranaLord}`,
                  `Asc: ${pred.ascLevels.starLord} > ${pred.ascLevels.subLord} > ${pred.ascLevels.pranaLord}`
                ];
                if (pred.moonHouse) {
                  lines.push(`Moon House: H${pred.moonHouse} (${pred.moonHouseSignificance || ''})`);
                }
                if (pred.ascendantSign) {
                  lines.push(`Asc Sign: ${pred.ascendantSign}`);
                }
                return lines;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(42, 58, 74, 0.5)' },
            ticks: { 
              color: '#5c6d7e', 
              font: { size: 9 },
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 20
            }
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(42, 58, 74, 0.3)' },
            ticks: { color: '#5c6d7e', font: { size: 10 } },
            title: {
              display: true,
              text: 'KP Score',
              color: '#f0b90b',
              font: { size: 10 }
            }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#2196f3', font: { size: 10 } },
            title: {
              display: true,
              text: 'Price (INR)',
              color: '#2196f3',
              font: { size: 10 }
            }
          }
        }
      }
    };

    // Remove y1 axis if no price data
    if (!priceData || priceData.length === 0 || chartType === 'signals') {
      delete config.options.scales.y1;
    }

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [predictions, priceData, symbol, chartType]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <span>&#9788;</span> KP Prediction Chart - Mumbai Transit (5-min intervals)
        </div>
        <div className="chart-controls">
          <button 
            className={`chart-btn ${chartType === 'combined' ? 'active' : ''}`}
            onClick={() => setChartType('combined')}
          >
            Combined
          </button>
          <button 
            className={`chart-btn ${chartType === 'signals' ? 'active' : ''}`}
            onClick={() => setChartType('signals')}
          >
            Signals Only
          </button>
          <button 
            className={`chart-btn ${chartType === 'price' ? 'active' : ''}`}
            onClick={() => setChartType('price')}
          >
            Price + KP
          </button>
        </div>
      </div>

      {/* Summary badges */}
      {predictions?.summary && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ 
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(0, 200, 83, 0.1)', color: 'var(--bullish)' 
          }}>
            &#9650; Bullish: {predictions.summary.bullishPeriods}
          </span>
          <span style={{ 
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(255, 23, 68, 0.1)', color: 'var(--bearish)' 
          }}>
            &#9660; Bearish: {predictions.summary.bearishPeriods}
          </span>
          <span style={{ 
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(255, 152, 0, 0.1)', color: 'var(--neutral)' 
          }}>
            &#9644; Neutral: {predictions.summary.neutralPeriods}
          </span>
          <span style={{ 
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
            background: predictions.summary.overallSentiment === 'BULLISH' ? 'rgba(0, 200, 83, 0.15)' : 
                        predictions.summary.overallSentiment === 'BEARISH' ? 'rgba(255, 23, 68, 0.15)' : 'rgba(255, 152, 0, 0.15)',
            color: predictions.summary.overallSentiment === 'BULLISH' ? 'var(--bullish)' : 
                   predictions.summary.overallSentiment === 'BEARISH' ? 'var(--bearish)' : 'var(--neutral)'
          }}>
            Overall: {predictions.summary.overallSentiment} (Score: {predictions.summary.averageScore})
          </span>
        </div>
      )}

      <div className="chart-canvas-wrapper">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

export default KPChart;
