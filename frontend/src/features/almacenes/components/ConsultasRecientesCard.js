import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultasRecientesCard({ 
  consultas = [], 
  isLoading = false,
  onConsultaPress 
}) {
  const formatFecha = (fecha) => {
    if (!fecha) return 'Hace poco';
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - date;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} d`;
    return date.toLocaleDateString();
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return { name: 'time-outline', color: '#f59e0b' };
      case 'RESPONDIDA':
        return { name: 'checkmark-circle', color: '#10b981' };
      default:
        return { name: 'help-circle-outline', color: '#6b7280' };
    }
  };

  const renderConsulta = ({ item }) => {
    const estadoIcon = getEstadoIcon(item.nombre || 'PENDIENTE');

    return (
      <TouchableOpacity
        style={styles.consultaItem}
        onPress={() => onConsultaPress && onConsultaPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.consultaContent}>
          <View style={styles.consultaHeader}>
            <Ionicons
              name={estadoIcon.name}
              size={18}
              color={estadoIcon.color}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.consultaDescripcion} numberOfLines={1}>
              {item.descripcion}
            </Text>
          </View>
          <Text style={styles.consultaTiempo}>
            {formatFecha(item.createdAt)}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#d1d5db"
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>Consultas recientes</Text>
        <ActivityIndicator
          size="small"
          color="#044E81"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  if (!consultas || consultas.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>Consultas recientes</Text>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={40}
            color="#d1d5db"
          />
          <Text style={styles.emptyText}>
            No hay consultas recientes
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>
        Consultas recientes ({consultas.length})
      </Text>
      <FlatList
        data={consultas.slice(0, 5)}
        renderItem={renderConsulta}
        keyExtractor={(item) => item.idConsulta?.toString() || Math.random().toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
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
  titulo: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  consultaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  consultaContent: {
    flex: 1,
    marginRight: 8,
  },
  consultaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  consultaDescripcion: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  consultaTiempo: {
    color: '#9ca3af',
    fontSize: 11,
    marginLeft: 26,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 8,
  },
});
