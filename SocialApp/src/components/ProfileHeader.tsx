import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '../types';
import { colors, spacing } from '../theme';
import { Avatar } from './Avatar';

type Props = {
  user: User;
  postCount: number;
  children?: React.ReactNode;
};

export function ProfileHeader({ user, postCount, children }: Props) {
  return (
    <View style={styles.container}>
      <Avatar username={user.username} size={80} />
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.bio}>{user.bio}</Text>

      <View style={styles.stats}>
        <Stat label="Posts" value={postCount} />
        <Stat label="Followers" value={user.followers.length} />
        <Stat label="Following" value={user.following.length} />
      </View>

      {children}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
