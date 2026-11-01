import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import type { TabParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

const MAX_LENGTH = 280;

type Nav = BottomTabNavigationProp<TabParamList, 'Create'>;

export function CreatePostScreen() {
  const { createPost } = useApp();
  const navigation = useNavigation<Nav>();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const cleanText = text.trim();
    const cleanImage = imageUrl.trim();
    if (!cleanText && !cleanImage) {
      setError('Add some text or an image link.');
      return;
    }
    if (cleanImage && !/^https?:\/\//.test(cleanImage)) {
      setError('Image link must start with http:// or https://');
      return;
    }
    createPost(cleanText, cleanImage || undefined);
    setText('');
    setImageUrl('');
    setError(null);
    navigation.navigate('Feed');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        accessibilityLabel="Post text"
        placeholder="What is happening?"
        placeholderTextColor={colors.textSecondary}
        multiline
        value={text}
        maxLength={MAX_LENGTH}
        onChangeText={value => {
          setText(value);
          setError(null);
        }}
        style={styles.textInput}
      />
      <Text style={styles.counter}>
        {text.length}/{MAX_LENGTH}
      </Text>

      <Text style={styles.label}>Image link (optional)</Text>
      <TextInput
        accessibilityLabel="Image link"
        placeholder="https://..."
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={imageUrl}
        onChangeText={value => {
          setImageUrl(value);
          setError(null);
        }}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Post</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  textInput: {
    minHeight: 140,
    fontSize: 17,
    color: colors.text,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
  },
  button: {
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
