import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  username: string;
  size?: number;
};

// Avatar images come from picsum, seeded by username so each user always gets the same picture.
export function Avatar({ username, size = 40 }: Props) {
  return (
    <Image
      accessibilityLabel={`${username} avatar`}
      source={{ uri: `https://picsum.photos/seed/${username}/120/120` }}
      style={[
        styles.image,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
  },
});
