import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function NotificationBadge({ count, size = 'medium' }) {
  if (!count || count === 0) return null;

  const isLarge = size === 'large';
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View
      style={[
        styles.badge,
        isLarge ? styles.badgeLarge : styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isLarge ? styles.badgeTextLarge : styles.badgeTextSmall,
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  badgeSmall: {
    width: 24,
    height: 24,
  },
  badgeLarge: {
    width: 32,
    height: 32,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 11,
  },
  badgeTextLarge: {
    fontSize: 12,
  },
});
