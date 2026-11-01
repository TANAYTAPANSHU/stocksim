import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { holdingsValue, totalEquity, unrealizedPnl } from '../store/selectors';
import { colors, spacing } from '../theme';
import { formatMoney, formatSigned } from '../utils/format';

export function PortfolioScreen() {
  const { state } = useApp();

  const holdings = Object.values(state.holdings).sort((a, b) => a.symbol.localeCompare(b.symbol));
  const invested = holdings.reduce((sum, h) => sum + h.avgCost * h.qty, 0);
  const pnl = holdings.reduce((sum, h) => {
    const stock = state.stocks[h.symbol];
    return stock ? sum + unrealizedPnl(h, stock) : sum;
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <Row label="Total equity" value={`₹${formatMoney(totalEquity(state))}`} strong />
        <Row label="Cash" value={`₹${formatMoney(state.cash)}`} />
        <Row label="Holdings value" value={`₹${formatMoney(holdingsValue(state))}`} />
        <Row
          label="Unrealized P&L"
          value={`₹${formatSigned(pnl)}`}
          color={pnl >= 0 ? colors.up : colors.down}
        />
        <Row label="Invested" value={`₹${formatMoney(invested)}`} />
      </View>

      <Text style={styles.sectionTitle}>Holdings</Text>
      {holdings.length === 0 ? (
        <Text style={styles.muted}>You do not own any stocks yet.</Text>
      ) : (
        holdings.map(h => {
          const stock = state.stocks[h.symbol];
          const rowPnl = stock ? unrealizedPnl(h, stock) : 0;
          return (
            <View key={h.symbol} style={styles.holding}>
              <View style={styles.holdingTop}>
                <Text style={styles.symbol}>{h.symbol}</Text>
                <Text style={[styles.pnl, { color: rowPnl >= 0 ? colors.up : colors.down }]}>
                  ₹{formatSigned(rowPnl)}
                </Text>
              </View>
              <Text style={styles.muted}>
                {h.qty} shares · avg ₹{formatMoney(h.avgCost)} · now ₹
                {formatMoney(stock?.price ?? 0)}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  strong,
  color,
}: {
  label: string;
  value: string;
  strong?: boolean;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong, color ? { color } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summary: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  strong: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  holding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  holdingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  pnl: {
    fontSize: 15,
    fontWeight: '600',
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
});
