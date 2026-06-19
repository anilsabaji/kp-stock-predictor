import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';
import { fetchStockNews, NSE_COMPANIES } from '../services/api';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    // Fetch news for top 5 stocks
    const topStocks = NSE_COMPANIES.slice(0, 5);
    const allNews = [];
    for (const stock of topStocks) {
      const articles = await fetchStockNews(stock.symbol, stock.name);
      articles.forEach(a => allNews.push({ ...a, symbol: stock.symbol }));
    }
    // Sort by date
    allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    setNews(allNews);
    setLoading(false);
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.newsItem} onPress={() => Linking.openURL(item.url).catch(() => {})}>
      <View style={styles.newsHeader}>
        <View style={[styles.symbolBadge, { backgroundColor: 'rgba(33,150,243,0.1)' }]}>
          <Text style={{ fontSize: 10, color: COLORS.accentBlue, fontWeight: '600' }}>{item.symbol}</Text>
        </View>
        <View style={[styles.sentimentDot, {
          backgroundColor: item.sentiment === 'positive' ? COLORS.bullish :
            item.sentiment === 'negative' ? COLORS.bearish : COLORS.neutral
        }]} />
        <Text style={styles.newsTime}>{formatTime(item.publishedAt)}</Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.newsSource}>{item.source}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accentGold} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Fetching market news...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.countBar}>
        <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>{news.length} articles from top stocks</Text>
        <TouchableOpacity onPress={loadNews}>
          <Text style={{ color: COLORS.accentBlue, fontSize: 11, fontWeight: '600' }}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={news}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  countBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  newsItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  newsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  symbolBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sentimentDot: { width: 8, height: 8, borderRadius: 4 },
  newsTime: { fontSize: 10, color: COLORS.textMuted },
  newsTitle: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, fontWeight: '500' },
  newsSource: { fontSize: 11, color: COLORS.accentBlue, marginTop: 4 },
});
