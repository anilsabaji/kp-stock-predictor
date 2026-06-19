import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import { NSE_COMPANIES } from '../services/api';

export default function StockListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const sectors = useMemo(() => [...new Set(NSE_COMPANIES.map(c => c.sector))].sort(), []);

  const filtered = useMemo(() => {
    return NSE_COMPANIES.filter(c => {
      const matchSearch = !search || c.symbol.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase());
      const matchSector = !selectedSector || c.sector === selectedSector;
      return matchSearch && matchSector;
    });
  }, [search, selectedSector]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stockItem}
      onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol, company: item })}
    >
      <View style={styles.stockLeft}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockDate}>Inc: {item.date}</Text>
      </View>
      <View style={styles.sectorBadge}>
        <Text style={styles.sectorText}>{item.sector}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sector Filter */}
      <View style={styles.sectorFilter}>
        <TouchableOpacity
          style={[styles.sectorChip, !selectedSector && styles.sectorChipActive]}
          onPress={() => setSelectedSector('')}
        >
          <Text style={[styles.sectorChipText, !selectedSector && styles.sectorChipTextActive]}>All</Text>
        </TouchableOpacity>
        <FlatList
          data={sectors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sectorChip, selectedSector === item && styles.sectorChipActive]}
              onPress={() => setSelectedSector(selectedSector === item ? '' : item)}
            >
              <Text style={[styles.sectorChipText, selectedSector === item && styles.sectorChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stock Count */}
      <Text style={styles.countText}>{filtered.length} companies</Text>

      {/* Stock List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.symbol}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  searchContainer: { padding: 12 },
  searchInput: {
    backgroundColor: COLORS.bgCard, borderRadius: 8, padding: 12,
    color: COLORS.textPrimary, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  sectorFilter: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  sectorChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.bgCard, marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  sectorChipActive: { backgroundColor: COLORS.accentBlue, borderColor: COLORS.accentBlue },
  sectorChipText: { fontSize: 11, color: COLORS.textSecondary },
  sectorChipTextActive: { color: '#fff' },
  countText: { paddingHorizontal: 16, paddingVertical: 4, fontSize: 11, color: COLORS.textMuted },
  stockItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, marginHorizontal: 12, marginBottom: 6,
    backgroundColor: COLORS.bgCard, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  stockLeft: { flex: 1 },
  stockSymbol: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  stockName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  stockDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  sectorBadge: { backgroundColor: 'rgba(33,150,243,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sectorText: { fontSize: 10, color: COLORS.accentBlue, fontWeight: '600' },
});
