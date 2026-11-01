import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { colors, spacing } from '../theme';
import { STARTING_CASH } from '../data/initialState';
import { formatMoney } from '../utils/format';

export function AccountScreen() {
  const { state, logout } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{state.username}</Text>
      <Text style={styles.muted}>
        Practice account. Starting virtual cash: ₹{formatMoney(STARTING_CASH)}
      </Text>
      <Text style={styles.muted}>
        Prices are simulated and refresh every few seconds. This is not real market data.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={logout}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  logout: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
