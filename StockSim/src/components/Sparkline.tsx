import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  values: number[];
  color: string;
  height?: number;
};

// Simple bar chart of recent prices. Each bar is one price tick.
export function Sparkline({ values, color, height = 120 }: Props) {
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={[styles.chart, { height }]} accessibilityLabel="Price history chart">
      {values.map((value, index) => {
        const barHeight = Math.max(2, ((value - min) / range) * height);
        return (
          <View
            key={index}
            style={[styles.bar, { height: barHeight, backgroundColor: color }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 8,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    opacity: 0.85,
  },
});
