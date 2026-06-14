import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#044E81';

export default function MapScreenWebFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa no disponible en web</Text>
      <Text style={styles.description}>
        La vista de ubicacion usa mapas nativos y esta disponible en Android e iOS.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#C8E6F5',
  },
  title: {
    color: PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#194866',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
