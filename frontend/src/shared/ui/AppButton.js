import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
}) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#044e81',
  },
  secondary: {
    backgroundColor: '#ffffff',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 16,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#044e81',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.86,
  },
});
