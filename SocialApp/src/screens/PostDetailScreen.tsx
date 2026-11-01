import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { PostCard } from '../components/PostCard';
import { Avatar } from '../components/Avatar';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { timeAgo } from '../utils/format';

export function PostDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const { state, addComment } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const post = state.posts.find(p => p.id === route.params.postId);
  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This post no longer exists.</Text>
      </View>
    );
  }

  const comments = state.comments
    .filter(c => c.postId === post.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  const send = () => {
    const clean = text.trim();
    if (!clean) {
      setError('Write something first.');
      return;
    }
    addComment(post.id, clean);
    setText('');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
        <PostCard post={post} />

        <Text style={styles.sectionTitle}>Comments</Text>
        {comments.length === 0 ? (
          <Text style={[styles.muted, styles.padded]}>No comments yet.</Text>
        ) : (
          comments.map(comment => {
            const author = state.users[comment.authorId];
            return (
              <View key={comment.id} style={styles.comment}>
                {author ? <Avatar username={author.username} size={32} /> : null}
                <View style={styles.commentBody}>
                  <Text style={styles.commentUser}>
                    {author?.username ?? 'unknown'}{' '}
                    <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
                  </Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Comment"
          placeholder="Add a comment"
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={value => {
            setText(value);
            setError(null);
          }}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={send} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
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
  padded: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  comment: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  commentBody: {
    marginLeft: spacing.md,
    flex: 1,
  },
  commentUser: {
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontWeight: '400',
    color: colors.textSecondary,
    fontSize: 12,
  },
  commentText: {
    color: colors.text,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sendText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
