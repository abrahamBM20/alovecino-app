import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PRIMARY = '#044E81';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Detalle del Negocio</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  backButton: {
    marginTop: 48,
    marginBottom: 24,
  },
  backText: {
    color: PRIMARY,
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
});
