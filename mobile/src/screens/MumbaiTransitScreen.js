import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import {
  calculatePlanetaryPositions, calculateSiderealAscendant,
  calculateLahiriAyanamsa, getKPLevels, calculateKPScore,
  getSignLord, getMoonHouseBonus, getHouseSignificance,
  PLANETS, SIGNS, NAKSHATRAS, PLANET_NATURE, MUMBAI,
} from '../utils/kpEngine';

const NAKSHATRA_SPAN = 13 + 20 / 60;

function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}

export default function MumbaiTransitScreen() {
  const today = new Date().toISOString().split('T')[0];

  const transitData = useMemo(() => {
    const marketTimes = [
      { label: 'Pre-Market 8:30', h: 3, m: 0 },
      { label: 'Market Open 9:15', h: 3, m: 45 },
      { label: 'Mid-Morning 10:30', h: 5, m: 0 },
      { label: 'Noon 12:00', h: 6, m: 30 },
      { label: 'Afternoon 14:00', h: 8, m: 30 },
      { label: 'Close 15:30', h: 10, m: 0 },
    ];

    return marketTimes.map(mt => {
      const dt = new Date(today);
      dt.setUTCHours(mt.h, mt.m, 0, 0);
      const positions = calculatePlanetaryPositions(dt);
      const ayanamsa = calculateLahiriAyanamsa(dt);
      const siderealAsc = calculateSiderealAscendant(dt);
      const ascLevels = getKPLevels(siderealAsc);
      const ascSign = SIGNS[Math.floor(siderealAsc / 30)].name;

      const planets = {};
      for (const [name, tropLong] of Object.entries(positions)) {
        const sidLong = normalizeDegrees(tropLong - ayanamsa);
        const levels = getKPLevels(sidLong);
        const sign = SIGNS[Math.floor(sidLong / 30)].name;
        const nak = NAKSHATRAS[Math.floor(sidLong / NAKSHATRA_SPAN) % 27].name;
        const house = (Math.floor(normalizeDegrees(sidLong - siderealAsc) / 30) % 12) + 1;
        planets[name] = { sidLong: sidLong.toFixed(1), sign, nak, house, levels, score: calculateKPScore(levels, name).toFixed(3) };
      }

      return { label: mt.label, ascSign, ascDeg: siderealAsc.toFixed(1), ascLevels, planets };
    });
  }, [today]);

  // Key transits at market open
  const marketOpen = transitData[1];
  const keyTransits = Object.entries(marketOpen.planets)
    .filter(([, p]) => [2, 5, 6, 10, 11].includes(p.house))
    .map(([name, p]) => ({ name, ...p }));

  return (
    <ScrollView style={styles.container}>
      {/* Location Header */}
      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>🏙 {MUMBAI.name}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.locInfo}>📍 {MUMBAI.latitude}°N, {MUMBAI.longitude}°E</Text>
          <Text style={styles.locInfo}>🕐 IST (UTC+5:30)</Text>
          <Text style={styles.locInfo}>📅 {today}</Text>
        </View>
        <Text style={styles.locInfo}>🏛 Placidus Houses • ⭐ Lahiri Ayanamsa</Text>
      </View>

      {/* Key Market Transits */}
      {keyTransits.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭐ Key Market Transits (at 9:15 IST)</Text>
          {keyTransits.map((kt, idx) => {
            const nature = PLANET_NATURE[kt.name];
            const isPositive = nature.weight > 0;
            return (
              <View key={idx} style={[styles.transitItem, {
                borderLeftWidth: 3,
                borderLeftColor: isPositive ? COLORS.bullish : COLORS.bearish,
              }]}>
                <View style={styles.transitTop}>
                  <Text style={{ fontSize: 16 }}>{PLANETS[kt.name].symbol}</Text>
                  <Text style={styles.transitName}>{kt.name}</Text>
                  <View style={[styles.impactBadge, {
                    backgroundColor: isPositive ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)'
                  }]}>
                    <Text style={{ color: isPositive ? COLORS.bullish : COLORS.bearish, fontSize: 9, fontWeight: '700' }}>
                      {isPositive ? 'POSITIVE' : 'NEGATIVE'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transitDetail}>
                  House {kt.house}: {getHouseSignificance(kt.house)}
                </Text>
                <Text style={styles.transitDetail}>{kt.sign} • {kt.nak}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Ascendant Progression */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Ascendant Through Market Hours</Text>
        {transitData.map((td, idx) => (
          <View key={idx} style={styles.ascRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ascLabel}>{td.label}</Text>
              <Text style={styles.ascSign}>{td.ascSign} ({td.ascDeg}°)</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                ★{PLANETS[td.ascLevels.starLord].name}
              </Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted }}>
                Sub:{PLANETS[td.ascLevels.subLord].name} Pr:{PLANETS[td.ascLevels.pranaLord].name}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* All Planets at Market Open */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌍 All Planets (Market Open 9:15 IST)</Text>
        {Object.entries(marketOpen.planets).map(([name, p]) => {
          const score = parseFloat(p.score);
          return (
            <View key={name} style={styles.planetRow}>
              <Text style={{ fontSize: 16, width: 24 }}>{PLANETS[name].symbol}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.planetName}>{name}</Text>
                <Text style={styles.planetInfo}>{p.sign} • {p.nak} • {p.sidLong}°</Text>
              </View>
              <View style={[styles.houseBadge, {
                backgroundColor: [2, 5, 10, 11].includes(p.house) ? 'rgba(0,200,83,0.1)' :
                  [6, 8, 12].includes(p.house) ? 'rgba(255,23,68,0.1)' : 'rgba(255,152,0,0.1)'
              }]}>
                <Text style={{
                  fontSize: 10, fontWeight: '700',
                  color: [2, 5, 10, 11].includes(p.house) ? COLORS.bullish :
                    [6, 8, 12].includes(p.house) ? COLORS.bearish : COLORS.neutral
                }}>H{p.house}</Text>
              </View>
              <Text style={[styles.planetScore, { color: score > 0 ? COLORS.bullish : score < 0 ? COLORS.bearish : COLORS.neutral }]}>
                {p.score}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Transit positions calculated for Mumbai (19.056°N, 72.847°E) using Placidus houses with Lahiri Ayanamsa.
          Moon in Houses 2,5,10,11 = gains; Houses 6,8,12 = losses.
        </Text>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  locationCard: { margin: 12, padding: 14, backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(156,39,176,0.3)' },
  locationTitle: { fontSize: 16, fontWeight: '700', color: COLORS.accentPurple, marginBottom: 6 },
  locationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  locInfo: { fontSize: 11, color: COLORS.textSecondary },
  card: { margin: 12, marginTop: 0, padding: 14, backgroundColor: COLORS.bgCard, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accentGold, marginBottom: 10 },
  transitItem: { padding: 10, marginBottom: 8, backgroundColor: COLORS.bgSecondary, borderRadius: 8, paddingLeft: 12 },
  transitTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transitName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  impactBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  transitDetail: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginLeft: 24 },
  ascRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  ascLabel: { fontSize: 12, color: COLORS.textSecondary },
  ascSign: { fontSize: 13, fontWeight: '700', color: COLORS.accentGold, marginTop: 1 },
  planetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  planetName: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  planetInfo: { fontSize: 10, color: COLORS.textMuted },
  houseBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  planetScore: { fontSize: 11, fontWeight: '700', width: 44, textAlign: 'right' },
  note: { margin: 12, padding: 12, backgroundColor: COLORS.bgSecondary, borderRadius: 8 },
  noteText: { fontSize: 10, color: COLORS.textMuted, lineHeight: 16 },
});
