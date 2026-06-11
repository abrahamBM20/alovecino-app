import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AppSelect({
  label,
  value,
  options,
  onChange,
  error,
  accessibilityLabel,
}) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        onPress={() => setVisible(true)}
        style={[styles.input, error ? styles.inputError : null]}
      >
        <Text style={[styles.value, !selected ? styles.placeholder : null]}>
          {selected?.label || 'Seleccionar'}
        </Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text accessibilityRole="header" style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                    }}
                    style={[styles.option, isSelected ? styles.optionSelected : null]}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: 'center',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  value: {
    color: '#0f172a',
    fontSize: 14,
  },
  placeholder: {
    color: '#9ca3af',
  },
  error: {
    color: '#fee2e2',
    marginTop: 6,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '72%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheetTitle: {
    color: '#044E81',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  option: {
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  optionSelected: {
    backgroundColor: '#044E81',
  },
  optionText: {
    color: '#0f172a',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
