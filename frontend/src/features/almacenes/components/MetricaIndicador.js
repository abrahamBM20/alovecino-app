import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MetricaIndicador({ 
  titulo, 
  valor, 
  unidad, 
  icono,
  color = '#044E81'
}) {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val % 1 !== 0) {
        return val.toFixed(1);
      }
      return val.toString();
    }
    return val || '0';
  };

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icono} size={24} color={color} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.valorContainer}>
        <Text style={styles.valor}>{formatValue(valor)}</Text>
        {unidad && <Text style={styles.unidad}>{unidad}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  titulo: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valor: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
  },
  unidad: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '500',
  },
});
