import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { getPerfilUsuario } from '../../perfil/services/perfilService';
import { crearConsultaCliente } from '../services/consultasClienteService';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.97)';
const BORDER = '#D8E8F2';
const MAX_DETALLES = 20;

function emptyDetalle() {
  return { descripcion: '', cantidadSolicitada: '1' };
}

function normalizeNumber(value) {
  return value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
}

export default function CrearConsultaScreen({ idAlmacen, nombreAlmacen }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [idCliente, setIdCliente] = useState(null);
  const [detalles, setDetalles] = useState([emptyDetalle()]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [createdConsulta, setCreatedConsulta] = useState(null);

  const isSubmitting = status === 'submitting';
  const isLoadingProfile = status === 'loading-profile';
  const isDone = status === 'done';
  const canAddDetalle = detalles.length < MAX_DETALLES && !isSubmitting && !isLoadingProfile && !isDone;

  useEffect(() => {
    let active = true;
    async function loadClienteId() {
      if (!user?.id) {
        setError('No pudimos identificar tu usuario. Inicia sesión nuevamente.');
        return;
      }

      setStatus('loading-profile');
      setError(null);
      try {
        const perfil = await getPerfilUsuario(user.id);
        if (!active) return;
        const nextIdCliente = perfil?.cliente?.idCliente;
        if (!nextIdCliente) {
          setError('Tu usuario no tiene un perfil de cliente asociado.');
          setStatus('idle');
          return;
        }
        setIdCliente(nextIdCliente);
        setStatus('idle');
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.message || 'No pudimos cargar tu perfil de cliente.');
        setStatus('idle');
      }
    }

    loadClienteId();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const isValid = useMemo(() => {
    const validIds = Number(idCliente) > 0 && Number(idAlmacen) > 0;
    const validDetalles = detalles.every((detalle) => (
      detalle.descripcion.trim().length > 0
      && Number(detalle.cantidadSolicitada) > 0
    ));
    return validIds && validDetalles;
  }, [detalles, idAlmacen, idCliente]);

  function updateDetalle(index, field, value) {
    setDetalles((prev) => prev.map((detalle, idx) => (
      idx === index
        ? { ...detalle, [field]: field === 'cantidadSolicitada' ? normalizeNumber(value) : value }
        : detalle
    )));
  }

  function addDetalle() {
    if (!canAddDetalle) return;
    setDetalles((prev) => [...prev, emptyDetalle()]);
  }

  function removeDetalle(index) {
    if (detalles.length === 1 || isSubmitting || isDone) return;
    setDetalles((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting || isLoadingProfile || isDone) return;
    setStatus('submitting');
    setError(null);
    try {
      const consulta = await crearConsultaCliente({
        idCliente,
        idAlmacen,
        detalles,
      });
      setCreatedConsulta(consulta);
      setStatus('done');
    } catch (submitError) {
      setError(submitError?.message || 'No pudimos enviar la consulta. Intenta nuevamente.');
      setStatus('idle');
    }
  }

  return (
    <LinearGradient
      colors={['#E5F2F9', '#7AAEC8', PRIMARY]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={88}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={26} color={PRIMARY} />
            </TouchableOpacity>
            <View style={styles.headerTexts}>
              <Text style={styles.headerTitle}>Nueva consulta</Text>
              <Text style={styles.headerSubtitle}>{nombreAlmacen || 'Almacén seleccionado'}</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!!error && (
              <View style={[styles.banner, styles.bannerError]}>
                <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
                <Text style={styles.bannerErrorText}>{error}</Text>
              </View>
            )}

            {isDone && (
              <View style={[styles.banner, styles.bannerSuccess]}>
                <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                <View style={styles.bannerTexts}>
                  <Text style={styles.bannerSuccessTitle}>Consulta enviada</Text>
                  <Text style={styles.bannerSuccessText}>
                    Folio #{createdConsulta?.idConsulta ?? createdConsulta?.id}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Productos consultados</Text>
                <Text style={styles.cardCount}>{detalles.length}/{MAX_DETALLES}</Text>
              </View>

              {detalles.map((detalle, index) => (
                <View key={`detalle-${index}`} style={styles.detalleBlock}>
                  <View style={styles.detalleHeader}>
                    <Text style={styles.detalleTitle}>Detalle {index + 1}</Text>
                    {detalles.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeDetalle(index)}
                        disabled={isSubmitting || isLoadingProfile || isDone}
                        style={styles.removeBtn}
                        accessibilityRole="button"
                        accessibilityLabel={`Eliminar detalle ${index + 1}`}
                      >
                        <Ionicons name="trash-outline" size={16} color="#B91C1C" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[styles.input, styles.textArea, isDone && styles.inputDisabled]}
                    value={detalle.descripcion}
                    onChangeText={(value) => updateDetalle(index, 'descripcion', value)}
                    placeholder="Producto o pregunta"
                    placeholderTextColor="rgba(15,45,69,0.35)"
                    multiline
                    editable={!isSubmitting && !isLoadingProfile && !isDone}
                    maxLength={1000}
                    accessibilityLabel={`Descripción detalle ${index + 1}`}
                  />
                  <TextInput
                    style={[styles.input, isDone && styles.inputDisabled]}
                    value={detalle.cantidadSolicitada}
                    onChangeText={(value) => updateDetalle(index, 'cantidadSolicitada', value)}
                    placeholder="Cantidad"
                    placeholderTextColor="rgba(15,45,69,0.35)"
                    keyboardType="number-pad"
                    editable={!isSubmitting && !isLoadingProfile && !isDone}
                    accessibilityLabel={`Cantidad detalle ${index + 1}`}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addBtn, !canAddDetalle && styles.btnDisabled]}
                onPress={addDetalle}
                disabled={!canAddDetalle}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Agregar otro producto"
              >
                <Ionicons name="add-circle-outline" size={18} color={PRIMARY} />
                <Text style={styles.addBtnText}>Agregar otro producto</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!isValid || isSubmitting || isLoadingProfile || isDone) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting || isLoadingProfile || isDone}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Enviar consulta"
            >
              {isSubmitting || isLoadingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Enviar consulta</Text>
                </>
              )}
            </TouchableOpacity>

            {isDone && (
              <View style={styles.doneActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => router.replace('/home/consultas/mis')}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel="Ver mis consultas"
                >
                  <Ionicons name="list-outline" size={18} color={PRIMARY} />
                  <Text style={styles.secondaryBtnText}>Ver mis consultas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => router.back()}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel="Volver al almacén"
                >
                  <Ionicons name="storefront-outline" size={18} color={PRIMARY} />
                  <Text style={styles.secondaryBtnText}>Volver al almacén</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SHADOW = {
  shadowColor: '#0A2540',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 4,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
  headerSubtitle: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 14 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
  },
  bannerError: { backgroundColor: '#FEF2F2' },
  bannerErrorText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#B91C1C' },
  bannerSuccess: { backgroundColor: '#F0FDF4' },
  bannerTexts: { flex: 1 },
  bannerSuccessTitle: { fontSize: 14, fontWeight: '800', color: '#15803D' },
  bannerSuccessText: { fontSize: 12, color: '#166534', marginTop: 2 },
  formCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    ...SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: TEXT_PRIMARY },
  cardCount: { fontSize: 12, fontWeight: '700', color: TEXT_MUTED },
  detalleBlock: { gap: 8 },
  detalleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detalleTitle: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
    lineHeight: 21,
  },
  inputDisabled: { opacity: 0.55 },
  addBtn: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FCFF',
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  submitBtn: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnDisabled: { opacity: 0.45 },
  doneActions: { gap: 10 },
  secondaryBtn: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { color: PRIMARY, fontSize: 14, fontWeight: '700' },
});
