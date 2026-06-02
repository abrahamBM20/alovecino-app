import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.96)';
const BORDER = '#E0EEF6';

const INDICADORES = [
  {
    key: 'consultasHoy',
    label: 'Consultas hoy',
    icono: 'mail',
    color: '#1D4ED8',
    bg: '#DBEAFE',
  },
  {
    key: 'pendientes',
    label: 'Pendientes',
    icono: 'time',
    color: '#B45309',
    bg: '#FDE68A',
  },
  {
    key: 'respondidas',
    label: 'Respondidas',
    icono: 'checkmark-circle',
    color: '#15803D',
    bg: '#BBF7D0',
  },
  {
    key: 'tiempoPromedioMin',
    label: 'Tiempo promedio',
    icono: 'timer',
    color: '#6D28D9',
    bg: '#DDD6FE',
    unidad: 'min',
  },
];

const MOCK_STATS = {
  consultasHoy: 18,
  pendientes: 4,
  respondidas: 14,
  tiempoPromedioMin: 13,
};

const MOCK_CONSULTAS = [
  { id: '1', pregunta: 'Necesito saber si tienen azúcar', cliente: 'Ana Torres', hora: '10:32' },
  { id: '2', pregunta: '¿Tienen arroz integral en stock?', cliente: 'Juan Pérez', hora: '09:15' },
  { id: '3', pregunta: 'Necesito leche deslactosada, ¿la tienen?', cliente: 'María González', hora: '08:45' },
  { id: '4', pregunta: 'Consulta sobre aceite vegetal de 5 litros', cliente: 'Pedro López', hora: '08:20' },
];

function Avatar({ nombre, size = 36 }) {
  const iniciales = (nombre || '')
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'C';
  return (
    <View
      style={[
        styles.avatarCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{iniciales}</Text>
    </View>
  );
}

function IndicadorCard({ icono, color, bg, label, valor, unidad }) {
  return (
    <View style={styles.indicadorCard}>
      <View style={[styles.indicadorIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icono} size={28} color={color} />
      </View>
      <Text style={styles.indicadorLabel}>{label}</Text>
      <View style={styles.indicadorValorRow}>
        <Text style={[styles.indicadorValor, { color: TEXT_PRIMARY }]}>{valor}</Text>
        {!!unidad && <Text style={styles.indicadorUnidad}> {unidad}</Text>}
      </View>
    </View>
  );
}

function ConsultaRow({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.consultaRow}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      <Avatar nombre={item.cliente} size={34} />
      <View style={styles.consultaRowTexts}>
        <Text style={styles.consultaRowPregunta} numberOfLines={1}>
          {item.pregunta}
        </Text>
        <Text style={styles.consultaRowCliente}>{item.cliente} · {item.hora}</Text>
      </View>
      <View style={styles.pendienteDot} />
    </TouchableOpacity>
  );
}

export default function PanelAlmaceneroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [estadoAbierto, setEstadoAbierto] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const nombreAlmacen =
    user?.almacen?.nombre ?? user?.nombreAlmacen ?? user?.nombre ?? user?.name ?? 'Almacén';
  const logoUrl =
    user?.almacen?.logoUrl ?? user?.almacen?.foto ?? user?.logoUrl ?? user?.fotoUrl ?? null;
  const pendientes = MOCK_STATS.pendientes;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  }, []);

  return (
    <LinearGradient
      colors={['#E5F2F9', '#7AAEC8', PRIMARY]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerEyebrow}>Panel almacén</Text>
              <Text style={styles.headerTitle} numberOfLines={2}>
                ¡Hola, {nombreAlmacen}!
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.headerAvatarBtn}>
              <View style={styles.headerAvatar}>
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.headerAvatarImg}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="storefront-outline" size={26} color={TEXT_MUTED} />
                )}
              </View>
              {pendientes > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{pendientes}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Estado del negocio ── */}
          <TouchableOpacity
            style={styles.estadoCard}
            activeOpacity={0.85}
            onPress={() => setEstadoAbierto((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={`Estado del negocio: ${estadoAbierto ? 'Abierto' : 'Cerrado'}. Tocar para cambiar.`}
          >
            <Text style={styles.cardEyebrow}>Estado del negocio</Text>
            <View style={styles.estadoRow}>
              <View
                style={[
                  styles.estadoDot,
                  { backgroundColor: estadoAbierto ? '#22C55E' : '#EF4444' },
                ]}
              />
              <Text style={styles.estadoValor}>
                {estadoAbierto ? 'Abierto' : 'Cerrado'}
              </Text>
              <Ionicons
                name={estadoAbierto ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={TEXT_MUTED}
              />
            </View>
            <Text style={styles.estadoNombreText}>{nombreAlmacen}</Text>
          </TouchableOpacity>

          {/* ── Indicadores ── */}
          <Text style={styles.sectionLabel}>Indicadores</Text>
          <View style={styles.indicadoresGrid}>
            {INDICADORES.map((ind) => (
              <IndicadorCard
                key={ind.key}
                icono={ind.icono}
                color={ind.color}
                bg={ind.bg}
                label={ind.label}
                valor={MOCK_STATS[ind.key]}
                unidad={ind.unidad}
              />
            ))}
          </View>

          {/* ── Consultas recientes ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Consultas recientes</Text>
            {pendientes > 0 && (
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{pendientes}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.verTodasBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/home/almacenero/bandeja')}
            >
              <Text style={styles.verTodasText}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.consultasCard}>
            <View style={styles.consultasCardHeader}>
              <Text style={styles.consultasCardTitle}>
                Consultas de hoy
              </Text>
              <View style={styles.consultasCount}>
                <Text style={styles.consultasCountText}>{MOCK_CONSULTAS.length}</Text>
              </View>
            </View>
            {MOCK_CONSULTAS.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <View style={styles.divider} />}
                <ConsultaRow
                  item={item}
                  onPress={() => router.push('/home/almacenero/bandeja')}
                />
              </React.Fragment>
            ))}
            <TouchableOpacity
              style={styles.verBandejaBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/home/almacenero/bandeja')}
            >
              <Text style={styles.verBandejaBtnText}>Abrir bandeja completa</Text>
              <Ionicons name="arrow-forward" size={16} color={PRIMARY} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0A2540',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 4,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 30,
  },
  headerAvatarBtn: { position: 'relative' },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  headerAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  headerBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Estado */
  estadoCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    ...CARD_SHADOW,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  estadoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  estadoValor: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flex: 1,
  },
  estadoNombreText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },

  /* Section labels */
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  verTodasBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  verTodasText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },

  /* Indicadores */
  indicadoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  indicadorCard: {
    width: '47%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    ...CARD_SHADOW,
  },
  indicadorIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  indicadorLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    fontWeight: '500',
  },
  indicadorValorRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  indicadorValor: {
    fontSize: 30,
    fontWeight: '800',
  },
  indicadorUnidad: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },

  /* Consultas card */
  consultasCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  consultasCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  consultasCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flex: 1,
  },
  consultasCount: {
    backgroundColor: '#E8F1F8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  consultasCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  consultaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 12,
  },
  consultaRowTexts: { flex: 1 },
  consultaRowPregunta: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  consultaRowCliente: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  pendienteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 18,
  },
  verBandejaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 2,
  },
  verBandejaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },

  /* Avatar */
  avatarCircle: {
    backgroundColor: '#DDEEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: PRIMARY,
  },
});
