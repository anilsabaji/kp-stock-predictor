import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import { generateMumbaiPredictions, MUMBAI } from '../utils/kpEngine';

export default function PredictionsScreen() {
  const [filter, setFilter] = useState('all');
  const today = new Date().toISOString().split('T')[0];

  const predictions = useMemo(() => generateMumbaiPredictions(today, 5), [today]);

  const filtered = useMemo(() => {
    if (filter === 'all') return predictions;
    if (filter === 'buy') return predictions.filter(p => p.signal.includes('BUY'));
    if (filter === 'sell') return predictions.filter(p => p.signal.includes('SELL'));
    return predictions.filter(p => p.signal === 'NEUTRAL');
  }, [predictions, filter]);

  const bullish = predictions.filter(p => p.signal.includes('BUY')).length;
  const bearish = predictions.filter(p => p.signal.includes('SELL')).length;
  const avgScore = predictions.reduce((s, p) => s + parseFloat(p.score), 0) / predictions.length;

  const getSignalColor = (signal) => {
    if (signal === 'STRONG_BUY') return COLORS.bullish;
    if (signal === 'BUY') return '#66bb6a';
    if (signal === 'STRONG_SELL') return COLORS.bearish;
    if (signal === 'SELL') return '#ef5350';
    return COLORS.neutral;
  };

  const renderItem = ({ item }) => {
    const score = parseFloat(item.score);
    return (
      <View style={styles.predItem}>
        <Text style={styles.predTime}>{item.time}</Text>
        <View style={[styles.signalBadge, { backgroundColor: getSignalColor(item.signal) + '22' }]}>
          <Text style={[styles.signalText, { color: getSignalColor(item.signal) }]}>
            {item.signal.replace('_', ' ')}
          </Text>
        </View>
        <View style={[styles.houseBadge, {
          backgroundColor: [2, 5, 10, 11].includes(item.moonHouse)
            ? 'rgba(0,200,83,0.1)' : [6, 8, 12].includes(item.moonHouse)
              ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)'
        }]}>
          <Text style={[styles.houseText, {
            color: [2, 5, 10, 11].includes(item.moonHouse)
              ? COLORS.bullish : [6, 8, 12].includes(item.moonHouse)
                ? COLORS.bearish : COLORS.neutral
          }]}>H{item.moonHouse}</Text>
        </View>
        <Text style={styles.predLords} numberOfLines={1}>
          {item.moonLevels.starLord}→{item.moonLevels.subLord}→{item.moonLevels.pranaLord}
        </Text>
        <Text style={[styles.predScore, { color: score > 0 ? COLORS.bullish : score < 0 ? COLORS.bearish : COLORS.neutral }]}>
          {score > 0 ? '+' : ''}{item.score}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>☽ KP Minute Predictions</Text>
        <Text style={styles.headerSub}>{MUMBAI.name} • {today}</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, { backgroundColor: 'rgba(0,200,83,0.1)' }]}>
            <Text style={{ color: COLORS.bullish, fontWeight: '700', fontSize: 14 }}>▲{bullish}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Bullish</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: 'rgba(255,23,68,0.1)' }]}>
            <Text style={{ color: COLORS.bearish, fontWeight: '700', fontSize: 14 }}>▼{bearish}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Bearish</Text>
          </View>
          <View style={[styles.summaryItem, {
            backgroundColor: avgScore > 0.1 ? 'rgba(0,200,83,0.1)' : avgScore < -0.1 ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)'
          }]}>
            <Text style={{ color: avgScore > 0.1 ? COLORS.bullish : avgScore < -0.1 ? COLORS.bearish : COLORS.neutral, fontWeight: '700', fontSize: 14 }}>
              {avgScore > 0.1 ? 'BULL' : avgScore < -0.1 ? 'BEAR' : 'NEUT'}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 9 }}>Overall</Text>
          </View>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['all', 'buy', 'sell', 'neutral'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? `All (${predictions.length})` : f === 'buy' ? `Buy (${bullish})` : f === 'sell' ? `Sell (${bearish})` : 'Neutral'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Predictions List */}
      <FlatList
        data={filtered}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  headerCard: { margin: 12, padding: 16, backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.accentGold },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, gap: 6 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.accentBlue, borderColor: COLORS.accentBlue },
  filterText: { fontSize: 11, color: COLORS.textSecondary },
  filterTextActive: { color: '#fff' },
  predItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 6 },
  predTime: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, width: 42 },
  signalBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, minWidth: 72, alignItems: 'center' },
  signalText: { fontSize: 10, fontWeight: '700' },
  houseBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  houseText: { fontSize: 10, fontWeight: '600' },
  predLords: { flex: 1, fontSize: 10, color: COLORS.textMuted },
  predScore: { fontSize: 11, fontWeight: '700', width: 50, textAlign: 'right' },
});
