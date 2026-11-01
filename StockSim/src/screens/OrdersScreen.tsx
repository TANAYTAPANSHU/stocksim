import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import type { Order } from '../types';
import { colors, spacing } from '../theme';
import { formatMoney, formatTime } from '../utils/format';

export function OrdersScreen() {
  const { state } = useApp();
  const orders = state.orders;

  return (
    <FlatList
      style={styles.list}
      data={orders}
      keyExtractor={order => order.id}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.muted}>No orders yet. Place a trade from any stock page.</Text>
        </View>
      }
      renderItem={({ item }) => <OrderRow order={item} />}
    />
  );
}

function OrderRow({ order }: { order: Order }) {
  const isBuy = order.side === 'BUY';
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[styles.side, { color: isBuy ? colors.up : colors.down }]}>
          {order.side} {order.symbol}
        </Text>
        <Text style={styles.muted}>
          {order.qty} shares @ ₹{formatMoney(order.price)} · {formatTime(order.createdAt)}
        </Text>
      </View>
      <Text style={styles.total}>₹{formatMoney(order.total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  side: {
    fontSize: 15,
    fontWeight: '700',
  },
  total: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
