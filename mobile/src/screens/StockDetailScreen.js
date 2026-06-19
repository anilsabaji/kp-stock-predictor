import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS } from '../utils/theme';
import { fetchStockQuote, fetchStockNews } from '../services/api';
import { generateCompanyHoroscope, generateCompanyPredictions, PLANETS, PLANET_NATURE } from '../utils/kpEngine';

export default function StockDetailScreen({ route }) {
  const { symbol, company } = route.params;
  const [quote, setQuote] = useState(null);
  const [news, setNews] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [dasha, setDasha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const horoscope = generateCompanyHoroscope(company.date);
  const today = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    const [q, n] = await Promise.all([
      fetchStockQuote(symbol),
      fetchStockNews(symbol, company.name),
    ]);
    setQuote(q);
    setNews(n || []);
    // Company-specific predictions weighted by news sentiment + real price
    let newsScore = 0;
    if (n && n.length) {
      let s = 0;
      n.forEach(a => { s += a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0; });
      newsScore = (s / n.length) * 0.6;
    }
    const base = (q && q.previousClose) ? q.previousClose : (q && q.price) ? q.price : 100;
    const result = generateCompanyPredictions(today, company.date, newsScore, base, 5);
    setPredictions(result.predictions);
    setDasha(result.dasha);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Summary
  const bullish = predictions.filter(p => p.signal.includes('BUY')).length;
  const bearish = predictions.filter(p => p.signal.includes('SELL')).length;
  const avgScore = predictions.length ? predictions.reduce((s, p) => s + parseFloat(p.score), 0) / predictions.length : 0;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accentGold} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading {symbol}...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGold} />}>
      {/* Price Card */}
      {quote && (
        <View style={styles.priceCard}>
          <Text style={styles.priceSymbol}>{symbol}</Text>
          <Text style={styles.priceName}>{company.name}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceValue, { color: quote.change >= 0 ? COLORS.bullish : COLORS.bearish }]}>
              ₹{quote.price?.toFixed(2)}
            </Text>
            <View style={[styles.changeBadge, { backgroundColor: quote.change >= 0 ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)' }]}>
              <Text style={{ color: quote.change >= 0 ? COLORS.bullish : COLORS.bearish, fontSize: 12, fontWeight: '600' }}>
                {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent}%)
              </Text>
            </View>
          </View>
          <View style={styles.priceDetails}>
            <View style={styles.priceDetail}><Text style={styles.pdLabel}>High</Text><Text style={styles.pdValue}>₹{quote.high?.toFixed(0)}</Text></View>
            <View style={styles.priceDetail}><Text style={styles.pdLabel}>Low</Text><Text style={styles.pdValue}>₹{quote.low?.toFixed(0)}</Text></View>
            <View style={styles.priceDetail}><Text style={styles.pdLabel}>Vol</Text><Text style={styles.pdValue}>{(quote.volume / 1e6).toFixed(1)}M</Text></View>
          </View>
        </View>
      )}

      {/* KP Today Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>☽ KP Day Prediction (Mumbai)</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBadge, { backgroundColor: 'rgba(0,200,83,0.1)' }]}>
            <Text style={{ color: COLORS.bullish, fontSize: 12, fontWeight: '700' }}>▲ {bullish}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Bullish</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: 'rgba(255,23,68,0.1)' }]}>
            <Text style={{ color: COLORS.bearish, fontSize: 12, fontWeight: '700' }}>▼ {bearish}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Bearish</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: avgScore > 0.1 ? 'rgba(0,200,83,0.1)' : avgScore < -0.1 ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)' }]}>
            <Text style={{ color: avgScore > 0.1 ? COLORS.bullish : avgScore < -0.1 ? COLORS.bearish : COLORS.neutral, fontSize: 12, fontWeight: '700' }}>
              {avgScore.toFixed(3)}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Avg Score</Text>
          </View>
        </View>
        {/* Best time to buy */}
        {(() => {
          const best = predictions.reduce((a, b) => parseFloat(b.score) > parseFloat(a.score) ? b : a);
          const worst = predictions.reduce((a, b) => parseFloat(b.score) < parseFloat(a.score) ? b : a);
          return (
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: COLORS.bullish, fontSize: 11 }}>▲ Best Time: {best.time} IST (Score: {best.score})</Text>
              <Text style={{ color: COLORS.bearish, fontSize: 11, marginTop: 2 }}>▼ Worst Time: {worst.time} IST (Score: {worst.score})</Text>
            </View>
          );
        })()}
      </View>

      {/* Vimshottari Dasha (company-specific) */}
      {dasha && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>☸ Vimshottari Dasha ({symbol})</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 8 }}>
            Running planetary periods of the company, to Prana level
          </Text>
          {dasha.map((d, i) => (
            <View key={i} style={styles.dashaRow}>
              <Text style={styles.dashaLevel}>{d.level}</Text>
              <Text style={styles.dashaPlanet}>{d.symbol} {d.planet}</Text>
              <Text style={{
                fontSize: 10, color: d.weight > 0 ? COLORS.bullish : d.weight < 0 ? COLORS.bearish : COLORS.neutral
              }}>{d.nature}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Company Horoscope */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>♅ Natal Chart (Inc: {company.date})</Text>
        <View style={styles.planetGrid}>
          {Object.entries(horoscope).map(([name, data]) => (
            <View key={name} style={styles.planetItem}>
              <Text style={styles.planetSymbol}>{data.symbol}</Text>
              <Text style={styles.planetName}>{name}</Text>
              <Text style={styles.planetSign}>{data.sign}</Text>
              <Text style={styles.planetNak}>{data.nakshatra}</Text>
              <Text style={[styles.planetScore, { color: parseFloat(data.score) > 0 ? COLORS.bullish : COLORS.bearish }]}>
                {data.score}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent News */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📰 Latest News</Text>
        {news.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>No news available</Text>
        ) : (
          news.slice(0, 5).map((article, idx) => (
            <View key={idx} style={styles.newsItem}>
              <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
              <View style={styles.newsMeta}>
                <Text style={styles.newsSource}>{article.source}</Text>
                <View style={[styles.sentimentDot, {
                  backgroundColor: article.sentiment === 'positive' ? COLORS.bullish :
                    article.sentiment === 'negative' ? COLORS.bearish : COLORS.neutral
                }]} />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  priceCard: {
    margin: 12, padding: 16, backgroundColor: COLORS.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  priceSymbol: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  priceName: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceValue: { fontSize: 28, fontWeight: '800' },
  changeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  priceDetails: { flexDirection: 'row', marginTop: 12, gap: 16 },
  priceDetail: { alignItems: 'center' },
  pdLabel: { fontSize: 10, color: COLORS.textMuted },
  pdValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  card: {
    margin: 12, marginTop: 0, padding: 16, backgroundColor: COLORS.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.accentGold, marginBottom: 12 },
  dashaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dashaLevel: { fontSize: 11, color: COLORS.textMuted, width: 80 },
  dashaPlanet: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600', flex: 1 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryBadge: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 8 },
  planetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planetItem: {
    width: '30%', alignItems: 'center', padding: 8,
    backgroundColor: COLORS.bgSecondary, borderRadius: 8,
  },
  planetSymbol: { fontSize: 20 },
  planetName: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  planetSign: { fontSize: 11, fontWeight: '600', color: COLORS.accentGold },
  planetNak: { fontSize: 9, color: COLORS.textSecondary },
  planetScore: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  newsItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  newsTitle: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 18 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  newsSource: { fontSize: 10, color: COLORS.accentBlue },
  sentimentDot: { width: 8, height: 8, borderRadius: 4 },
});
