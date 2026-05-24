import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function EstadoNegocioCard({ estado, nombre }) {
  const getEstadoConfig = (estatus) => {
    switch (estatus?.toUpperCase()) {
      case 'ABIERTO':
        return { color: '#10b981', label: 'Abierto' };
      case 'CERRADO':
        return { color: '#ef4444', label: 'Cerrado' };
      case 'OCUPADO':
        return { color: '#f59e0b', label: 'Ocupado' };
      case 'PENDIENTE':
        return { color: '#6b7280', label: 'Pendiente' };
      default:
        return { color: '#6b7280', label: 'Desconocido' };
    }
  };

  const config = getEstadoConfig(estado);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Estado del negocio</Text>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: config.color },
          ]}
        />
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
      <Text style={styles.nombreAlmacen}>{nombre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  nombreAlmacen: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
});
