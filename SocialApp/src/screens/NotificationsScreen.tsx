import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../components/Avatar';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/types';
import type { AppNotification } from '../types';
import { colors, spacing } from '../theme';
import { timeAgo } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function describeNotification(n: AppNotification): string {
  switch (n.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
  }
}

export function NotificationsScreen() {
  const { state, currentUser, markNotificationsRead } = useApp();
  const navigation = useNavigation<Nav>();

  // Opening the tab marks everything as read, which clears the badge.
  useFocusEffect(
    useCallback(() => {
      markNotificationsRead();
    }, [markNotificationsRead]),
  );

  const mine = state.notifications
    .filter(n => n.recipientId === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <FlatList
      data={mine}
      keyExtractor={n => n.id}
      style={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.muted}>No notifications yet. Create a post and wait a moment.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const actor = state.users[item.actorId];
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              item.postId
                ? navigation.navigate('PostDetail', { postId: item.postId })
                : navigation.navigate('UserProfile', { userId: item.actorId })
            }
            style={styles.row}
          >
            {actor ? <Avatar username={actor.username} size={36} /> : null}
            <View style={styles.text}>
              <Text style={styles.body}>
                <Text style={styles.username}>{actor?.username ?? 'Someone'}</Text>{' '}
                {describeNotification(item)}
              </Text>
              <Text style={styles.muted}>{timeAgo(item.createdAt)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  muted: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  text: {
    marginLeft: spacing.md,
    flex: 1,
  },
  body: {
    color: colors.text,
    fontSize: 15,
  },
  username: {
    fontWeight: '600',
  },
});
