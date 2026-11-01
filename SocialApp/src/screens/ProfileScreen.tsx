import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostCard } from '../components/PostCard';
import { ProfileHeader } from '../components/ProfileHeader';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const { state, currentUser, logout } = useApp();
  const navigation = useNavigation<Nav>();

  if (!currentUser) return null;

  const myPosts = state.posts.filter(p => p.authorId === currentUser.id);

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={currentUser} postCount={myPosts.length}>
        <Pressable
          accessibilityRole="button"
          onPress={logout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ProfileHeader>

      {myPosts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>You have not posted yet.</Text>
        </View>
      ) : null}

      {myPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  muted: {
    color: colors.textSecondary,
  },
  logout: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
