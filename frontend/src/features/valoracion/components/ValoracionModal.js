import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useValoracion } from '../hooks/useValoracion';

const PRIMARY  = '#044e81';
const SKY_BLUE = '#5BB8F5';
const GOLD     = '#F59E0B';

function StarSelector({ value, onChange, size = 38 }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size}
            color={n <= value ? GOLD : '#CBD5E1'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ValoracionModal({ visible, onClose, idAlmacen, nombreAlmacen, logoUrl }) {
  const { miValoracion, estrellas, setEstrellas, contenido, setContenido,
    guardar, actualizar, isSaving, error } = useValoracion(idAlmacen);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (miValoracion && !editMode) {
      setEstrellas(miValoracion.cantidadEstrellas);
      setContenido(miValoracion.contenido ?? '');
    }
    if (!miValoracion) setEditMode(false);
  }, [miValoracion]);

  async function handleGuardar() {
    const ok = editMode ? await actualizar() : await guardar();
    if (ok) { setEditMode(false); onClose(); }
  }

  const showForm = !miValoracion || editMode;

  return (
    <Modal visible={visible} transparent animationType="slide"
      statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {logoUrl
            ? <Image source={{ uri: logoUrl }} style={styles.modalFoto} resizeMode="cover" />
            : <View style={styles.iconWrap}><Ionicons name="storefront-outline" size={32} color={PRIMARY} /></View>
          }
          <Text style={styles.title}>Valorar este almacén</Text>
          <Text style={styles.subtitle}>
            {nombreAlmacen
              ? `Tu opinión sobre ${nombreAlmacen} ayuda a otros vecinos`
              : 'Tu opinión ayuda a otros vecinos'}
          </Text>

          {showForm ? (
            <>
              <StarSelector value={estrellas} onChange={setEstrellas} />
              <View style={styles.inputWrap}>
                <TextInput style={styles.input} placeholder="Escribe tu comentario..."
                  placeholderTextColor="#94A3B8" value={contenido}
                  onChangeText={setContenido} multiline numberOfLines={3}
                  textAlignVertical="top" />
              </View>
              {!!error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <TouchableOpacity style={[styles.btnPrimary, isSaving && styles.btnDisabled]}
                onPress={handleGuardar} disabled={isSaving} activeOpacity={0.85}>
                {isSaving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnText}>
                      {editMode ? 'Actualizar valoración' : 'Agregar valoración'}
                    </Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.existingCard}>
                <Text style={styles.existingLabel}>Tu valoración actual</Text>
                <StarSelector value={miValoracion.cantidadEstrellas} onChange={() => {}} size={30} />
                {!!miValoracion.contenido && (
                  <Text style={styles.existingContenido}>{miValoracion.contenido}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.btnPrimary}
                onPress={() => {
                  setEstrellas(miValoracion.cantidadEstrellas);
                  setContenido(miValoracion.contenido ?? '');
                  setEditMode(true);
                }}
                activeOpacity={0.85}>
                <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnText}>Editar valoración</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onClose} style={styles.omitirBtn} activeOpacity={0.7}>
            <Text style={styles.omitirText}>Omitir por ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4,78,129,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 44,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginBottom: 6,
  },
  modalFoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 4,
  },
  inputWrap: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: PRIMARY,
    minHeight: 90,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
  },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  existingCard: {
    width: '100%',
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BAE0FF',
  },
  existingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  existingContenido: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
  },
  btnPrimary: {
    width: '100%',
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: SKY_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SKY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  btnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
  omitirBtn: { paddingVertical: 6, paddingHorizontal: 20 },
  omitirText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
});
