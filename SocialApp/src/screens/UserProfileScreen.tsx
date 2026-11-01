import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostCard } from '../components/PostCard';
import { ProfileHeader } from '../components/ProfileHeader';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function UserProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const navigation = useNavigation<Nav>();
  const { state, currentUser, toggleFollow } = useApp();

  const user = state.users[route.params.userId];
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>User not found.</Text>
      </View>
    );
  }

  const isMe = currentUser?.id === user.id;
  const isFollowing = !!currentUser && user.followers.includes(currentUser.id);
  const userPosts = state.posts.filter(p => p.authorId === user.id);

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={user} postCount={userPosts.length}>
        {!isMe ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleFollow(user.id)}
            style={({ pressed }) => [
              styles.followButton,
              isFollowing && styles.followingButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        ) : null}
      </ProfileHeader>

      {userPosts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No posts yet.</Text>
        </View>
      ) : null}

      {userPosts.map(post => (
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: colors.textSecondary,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  followButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  followingText: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
