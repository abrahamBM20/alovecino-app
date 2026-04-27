import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function AppInput({
  label,
  error,
  accessibilityLabel,
  ...props
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel || label}
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    minHeight: 46,
    paddingHorizontal: 16,
    color: '#0f172a',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  error: {
    color: '#fee2e2',
    marginTop: 6,
    fontSize: 12,
  },
});
