import React, { useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { Sparkline } from '../components/Sparkline';
import { useApp } from '../store/AppContext';
import { changePct, round2, validateOrder } from '../store/selectors';
import type { RootStackParamList } from '../navigation/types';
import type { Side } from '../types';
import { colors, spacing } from '../theme';
import { formatMoney, formatPct } from '../utils/format';

export function StockDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'StockDetail'>>();
  const { state, placeOrder, toggleWatchlist } = useApp();
  const [side, setSide] = useState<Side>('BUY');
  const [qtyText, setQtyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const symbol = route.params.symbol;
  const stock = state.stocks[symbol];
  if (!stock) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This stock is not available.</Text>
      </View>
    );
  }

  const pct = changePct(stock);
  const color = pct >= 0 ? colors.up : colors.down;
  const holding = state.holdings[symbol];
  const watched = state.watchlist.includes(symbol);
  const qty = Number(qtyText);
  const estimate = Number.isInteger(qty) && qty > 0 ? round2(qty * stock.price) : null;

  const submit = () => {
    const validation = validateOrder(state, side, symbol, qty);
    if (validation) {
      setError(validation);
      setMessage(null);
      return;
    }
    placeOrder(side, symbol, qty);
    setMessage(`${side} ${qty} ${symbol} at ₹${formatMoney(stock.price)} placed.`);
    setError(null);
    setQtyText('');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name}>
          {stock.name} · {stock.sector}
        </Text>
        <Text style={styles.price}>₹{formatMoney(stock.price)}</Text>
        <Text style={[styles.change, { color }]}>
          {formatPct(pct)} today (open ₹{formatMoney(stock.openPrice)})
        </Text>
      </View>

      <View style={styles.section}>
        <Sparkline values={state.history[symbol] ?? []} color={color} />
      </View>

      <View style={styles.section}>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleWatchlist(symbol)}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>{watched ? 'Remove from watchlist' : 'Add to watchlist'}</Text>
        </Pressable>
      </View>

      {holding ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You hold</Text>
          <Text style={styles.body}>
            {holding.qty} shares, average cost ₹{formatMoney(holding.avgCost)}
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Place order</Text>
        <View style={styles.segment}>
          {(['BUY', 'SELL'] as Side[]).map(option => {
            const active = side === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setSide(option);
                  setError(null);
                }}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.quantityRow}>
          <TextInput
            accessibilityLabel="Quantity"
            placeholder="Quantity (whole shares)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={qtyText}
            onChangeText={value => {
              setQtyText(value.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            style={[styles.input, styles.quantityInput]}
          />
          {/* The number pad has no return key, so this button closes the keyboard. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            onPress={() => Keyboard.dismiss()}
            style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
        <Text style={styles.body}>
          Estimated {side === 'BUY' ? 'cost' : 'proceeds'}:{' '}
          {estimate === null ? '-' : `₹${formatMoney(estimate)}`}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={submit}
          style={({ pressed }) => [
            styles.primaryButton,
            side === 'SELL' && styles.sellButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {side} {stock.symbol}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
  },
  symbol: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  name: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  change: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontWeight: '600',
    color: colors.text,
  },
  segmentTextActive: {
    color: colors.primaryText,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityInput: {
    flex: 1,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  doneText: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
  },
  success: {
    color: colors.up,
  },
  primaryButton: {
    backgroundColor: colors.up,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: colors.down,
  },
  primaryText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
