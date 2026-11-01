import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StockRow } from '../components/StockRow';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { formatMoney } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MarketsScreen() {
  const { state } = useApp();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const stocks = Object.values(state.stocks)
    .filter(s => !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  return (
    <FlatList
      style={styles.list}
      data={stocks}
      keyExtractor={stock => stock.symbol}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.cash}>Cash: ₹{formatMoney(state.cash)}</Text>
          <TextInput
            accessibilityLabel="Search stocks"
            placeholder="Search by symbol or name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No stocks match "{query.trim()}".</Text>}
      renderItem={({ item }) => (
        <StockRow
          stock={item}
          onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cash: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  empty: {
    padding: spacing.xl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
