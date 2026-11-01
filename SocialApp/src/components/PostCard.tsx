import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../store/AppContext';
import type { Post } from '../types';
import { colors, spacing } from '../theme';
import { timeAgo } from '../utils/format';
import { Avatar } from './Avatar';

type Props = {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
};

export function PostCard({ post, onPress, onAuthorPress }: Props) {
  const { state, currentUser, toggleLike } = useApp();
  const author = state.users[post.authorId];
  const commentCount = state.comments.filter(c => c.postId === post.id).length;
  const likedByMe = !!currentUser && post.likedBy.includes(currentUser.id);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Pressable onPress={onAuthorPress} style={styles.header}>
        {author ? <Avatar username={author.username} /> : null}
        <View style={styles.headerText}>
          <Text style={styles.username}>{author?.username ?? 'unknown'}</Text>
          <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
        </View>
      </Pressable>

      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={likedByMe ? 'Unlike' : 'Like'}
          onPress={() => toggleLike(post.id)}
          hitSlop={8}
        >
          <Text style={[styles.action, likedByMe && styles.liked]}>
            {likedByMe ? 'Liked' : 'Like'} {post.likedBy.length}
          </Text>
        </Pressable>
        <Text style={styles.action}>Comments {commentCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.md,
  },
  username: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 15,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
  action: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  liked: {
    color: colors.like,
    fontWeight: '600',
  },
});
