import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StockRow } from '../components/StockRow';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WatchlistScreen() {
  const { state } = useApp();
  const navigation = useNavigation<Nav>();

  const stocks = state.watchlist
    .map(symbol => state.stocks[symbol])
    .filter(Boolean);

  return (
    <FlatList
      style={styles.list}
      data={stocks}
      keyExtractor={stock => stock.symbol}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.muted}>
            Your watchlist is empty. Open a stock in Markets and tap "Add to watchlist".
          </Text>
        </View>
      }
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
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  muted: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
