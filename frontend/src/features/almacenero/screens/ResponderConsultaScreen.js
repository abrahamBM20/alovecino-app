import React, { useState } from 'react';
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
import { cerrarConsulta, responderConsulta } from '../services/consultasService';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.97)';
const BORDER = '#E0EEF6';
const MAX_CHARS = 300;

function Avatar({ nombre, size = 40 }) {
  const iniciales = (nombre || '')
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'C';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{iniciales}</Text>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0A2540',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 4,
};

export default function ResponderConsultaScreen({
  idConsulta,
  pregunta,
  cantidad,
  cliente,
  fecha,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [respuesta, setRespuesta] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | closing | done_respond | done_close
  const [error, setError] = useState(null);

  const isWorking = status === 'sending' || status === 'closing';
  const isDone = status === 'done_respond' || status === 'done_close';
  const charsLeft = MAX_CHARS - respuesta.length;

  async function handleResponder() {
    if (!respuesta.trim() || isWorking || isDone) return;
    setStatus('sending');
    setError(null);
    try {
      await responderConsulta(idConsulta, respuesta.trim());
      setStatus('done_respond');
      setTimeout(() => router.back(), 1400);
    } catch {
      setError('No pudimos enviar la respuesta. Intenta nuevamente.');
      setStatus('idle');
    }
  }

  async function handleCerrar() {
    if (isWorking || isDone) return;
    setStatus('closing');
    setError(null);
    try {
      await cerrarConsulta(idConsulta);
      setStatus('done_close');
      setTimeout(() => router.back(), 1400);
    } catch {
      setError('No pudimos cerrar la consulta. Intenta nuevamente.');
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
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={26} color={PRIMARY} />
            </TouchableOpacity>
            <View style={styles.headerTexts}>
              <Text style={styles.headerTitle}>Responder consulta</Text>
              <Text style={styles.headerSubtitle}>Consulta pendiente</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Tarjeta de la consulta ── */}
            <View style={styles.consultaCard}>
              <View style={styles.consultaCardTop}>
                <View style={[styles.accentBar, { backgroundColor: '#F59E0B' }]} />
                <View style={styles.consultaCardBody}>
                  <View style={styles.consultaClienteRow}>
                    <Avatar nombre={cliente} size={38} />
                    <View style={styles.consultaClienteTexts}>
                      <Text style={styles.consultaClienteNombre}>{cliente || 'Cliente'}</Text>
                      <Text style={styles.consultaClienteFecha}>{fecha || ''}</Text>
                    </View>
                    <View style={styles.pendienteBadge}>
                      <Ionicons name="time-outline" size={11} color="#B45309" />
                      <Text style={styles.pendienteBadgeText}>Pendiente</Text>
                    </View>
                  </View>
                  <Text style={styles.consultaPregunta}>{pregunta || 'Pregunta no disponible'}</Text>
                  {!!cantidad && (
                    <View style={styles.cantidadRow}>
                      <Ionicons name="cube-outline" size={14} color={TEXT_MUTED} />
                      <Text style={styles.cantidadText}>
                        Cantidad solicitada:{' '}
                        <Text style={styles.cantidadVal}>{cantidad}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Feedback de éxito ── */}
            {status === 'done_respond' && (
              <View style={[styles.feedbackBanner, styles.feedbackSuccess]}>
                <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                <Text style={styles.feedbackSuccessText}>Respuesta enviada correctamente</Text>
              </View>
            )}
            {status === 'done_close' && (
              <View style={[styles.feedbackBanner, styles.feedbackNeutral]}>
                <Ionicons name="close-circle" size={20} color="#475569" />
                <Text style={styles.feedbackNeutralText}>Consulta cerrada</Text>
              </View>
            )}
            {!!error && (
              <View style={[styles.feedbackBanner, styles.feedbackError]}>
                <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
                <Text style={styles.feedbackErrorText}>{error}</Text>
              </View>
            )}

            {/* ── Input de respuesta ── */}
            <View style={styles.inputSection}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Tu respuesta</Text>
                <Text
                  style={[
                    styles.charCount,
                    charsLeft < 30 && { color: charsLeft < 10 ? '#EF4444' : '#F59E0B' },
                  ]}
                >
                  {charsLeft}/{MAX_CHARS}
                </Text>
              </View>
              <TextInput
                style={[styles.input, isDone && styles.inputDisabled]}
                placeholder="Escribe tu respuesta aquí..."
                placeholderTextColor="rgba(15,45,69,0.3)"
                value={respuesta}
                onChangeText={(t) => setRespuesta(t.slice(0, MAX_CHARS))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isDone}
                accessibilityLabel="Campo de respuesta"
              />
            </View>

            {/* ── Botones ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  (!respuesta.trim() || isWorking || isDone) && styles.btnDisabled,
                ]}
                onPress={handleResponder}
                disabled={!respuesta.trim() || isWorking || isDone}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Enviar respuesta"
              >
                {status === 'sending' ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={18} color="#fff" />
                    <Text style={styles.btnPrimaryText}>Enviar respuesta</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.btnSecondary, (isWorking || isDone) && styles.btnDisabled]}
                onPress={handleCerrar}
                disabled={isWorking || isDone}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cerrar consulta sin responder"
              >
                {status === 'closing' ? (
                  <ActivityIndicator color={TEXT_SECONDARY} size="small" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={TEXT_SECONDARY} />
                    <Text style={styles.btnSecondaryText}>Cerrar sin responder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Info ── */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={TEXT_MUTED} />
              <Text style={styles.infoText}>
                El cliente recibirá una notificación cuando respondas o cierres su consulta.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },

  /* Consulta card */
  consultaCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  consultaCardTop: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 4,
  },
  consultaCardBody: {
    flex: 1,
    padding: 16,
  },
  consultaClienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  consultaClienteTexts: { flex: 1 },
  consultaClienteNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  consultaClienteFecha: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  pendienteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendienteBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  consultaPregunta: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: 10,
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cantidadText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  cantidadVal: {
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  /* Feedback */
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
  },
  feedbackSuccess: { backgroundColor: '#F0FDF4' },
  feedbackNeutral: { backgroundColor: '#F1F5F9' },
  feedbackError: { backgroundColor: '#FEF2F2' },
  feedbackSuccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
  },
  feedbackNeutralText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  feedbackErrorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C1C',
  },

  /* Input */
  inputSection: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    ...CARD_SHADOW,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  charCount: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  input: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    minHeight: 120,
    lineHeight: 22,
  },
  inputDisabled: {
    opacity: 0.5,
  },

  /* Acciones */
  actions: { gap: 10 },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    minHeight: 54,
    ...CARD_SHADOW,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SURFACE,
    borderRadius: 16,
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER,
  },
  btnSecondaryText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.45,
  },

  /* Info */
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },

  /* Avatar */
  avatar: {
    backgroundColor: '#DDEEF8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontWeight: '800',
    color: PRIMARY,
  },
});
