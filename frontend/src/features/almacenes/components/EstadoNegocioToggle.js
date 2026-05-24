import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ESTADOS = [
  { codigo: 'ABIERTO', label: 'Abierto', color: '#10b981', icon: 'checkmark-circle' },
  { codigo: 'CERRADO', label: 'Cerrado', color: '#ef4444', icon: 'close-circle' },
  { codigo: 'OCUPADO', label: 'Ocupado', color: '#f59e0b', icon: 'alert-circle' },
];

export default function EstadoNegocioToggle({ 
  estado, 
  nombre, 
  onEstadoChange,
  isLoading = false 
}) {
  const [showModal, setShowModal] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const estadoActual = ESTADOS.find(e => e.codigo === estado?.toUpperCase()) || ESTADOS[0];

  const handleEstadoPress = async (nuevoEstado) => {
    if (nuevoEstado.codigo === estado?.toUpperCase()) {
      setShowModal(false);
      return;
    }

    setIsChanging(true);
    try {
      await onEstadoChange(nuevoEstado.codigo);
      setShowModal(false);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => !isLoading && setShowModal(true)}
        disabled={isLoading || isChanging}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.label}>Estado del negocio</Text>
          {(isLoading || isChanging) && (
            <ActivityIndicator size="small" color="#044E81" />
          )}
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: estadoActual.color },
            ]}
          />
          <Text style={styles.statusText}>{estadoActual.label}</Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#9ca3af"
            style={{ marginLeft: 'auto' }}
          />
        </View>

        <Text style={styles.nombreAlmacen}>{nombre}</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar estado</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.estadosContainer}>
              {ESTADOS.map((est) => (
                <TouchableOpacity
                  key={est.codigo}
                  style={[
                    styles.estadoOption,
                    est.codigo === estado?.toUpperCase() && styles.estadoOptionActive,
                  ]}
                  onPress={() => handleEstadoPress(est)}
                  disabled={isChanging}
                >
                  <View
                    style={[
                      styles.optionDot,
                      { backgroundColor: est.color },
                    ]}
                  />
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        est.codigo === estado?.toUpperCase() && styles.optionLabelActive,
                      ]}
                    >
                      {est.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {est.codigo === 'ABIERTO' && 'Aceptar nuevas consultas'}
                      {est.codigo === 'CERRADO' && 'No aceptar consultas'}
                      {est.codigo === 'OCUPADO' && 'Responder cuando sea posible'}
                    </Text>
                  </View>
                  {est.codigo === estado?.toUpperCase() && (
                    <Ionicons name="checkmark" size={24} color="#044E81" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
  },
  estadosContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  estadoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  estadoOptionActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#044E81',
  },
  optionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionLabelActive: {
    color: '#044E81',
  },
  optionDescription: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
