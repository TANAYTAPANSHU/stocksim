import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const { state } = useApp();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const users = q
    ? Object.values(state.users).filter(u => u.username.includes(q))
    : [];
  const posts = q
    ? state.posts.filter(p => p.text.toLowerCase().includes(q))
    : [];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        accessibilityLabel="Search"
        placeholder="Search users and posts"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {!q ? (
        <Text style={styles.muted}>Type a username or a word from a post.</Text>
      ) : null}

      {q && users.length === 0 && posts.length === 0 ? (
        <Text style={styles.muted}>No results for "{query.trim()}".</Text>
      ) : null}

      {users.length > 0 ? <Text style={styles.sectionTitle}>People</Text> : null}
      {users.map(user => (
        <Pressable
          key={user.id}
          accessibilityRole="button"
          onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
          style={styles.userRow}
        >
          <Avatar username={user.username} />
          <View style={styles.userText}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.muted}>{user.bio}</Text>
          </View>
        </Pressable>
      ))}

      {posts.length > 0 ? <Text style={styles.sectionTitle}>Posts</Text> : null}
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          onAuthorPress={() => navigation.navigate('UserProfile', { userId: post.authorId })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  muted: {
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  userText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  username: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 15,
  },
});
