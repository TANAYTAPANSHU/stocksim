import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Stock } from '../types';
import { changePct } from '../store/selectors';
import { colors, spacing } from '../theme';
import { formatMoney, formatPct } from '../utils/format';

type Props = {
  stock: Stock;
  onPress: () => void;
};

export function StockRow({ stock, onPress }: Props) {
  const pct = changePct(stock);
  const color = pct >= 0 ? colors.up : colors.down;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${stock.symbol}, ${stock.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatMoney(stock.price)}</Text>
        <Text style={[styles.change, { color }]}>{formatPct(pct)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  right: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  name: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  change: {
    fontSize: 13,
    marginTop: 2,
  },
});
