import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { colors, spacing } from '../theme';
import { STARTING_CASH } from '../data/initialState';
import { formatMoney } from '../utils/format';

export function LoginScreen() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) {
      setError('Use 3 to 20 letters, numbers or underscores.');
      return;
    }
    login(clean);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StockSim</Text>
      <Text style={styles.subtitle}>
        A practice trading app with virtual money. Prices are simulated, so nothing here is real
        trading. You start with ₹{formatMoney(STARTING_CASH)} of virtual cash.
      </Text>

      <TextInput
        accessibilityLabel="Username"
        placeholder="username"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={text => {
          setUsername(text);
          setError(null);
        }}
        onSubmitEditing={submit}
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        onPress={submit}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Start practicing</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 21,
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
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});
