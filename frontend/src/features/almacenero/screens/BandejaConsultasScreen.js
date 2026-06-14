import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchMisAlmacenes } from '../services/almacenService';
import { fetchConsultasAlmacenero } from '../services/consultasService';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.97)';
const BORDER = '#E0EEF6';

const ESTADO_CFG = {
  pendiente: {
    label: 'Pendiente',
    icono: 'time-outline',
    color: '#B45309',
    bg: '#FEF3C7',
    border: '#FDE68A',
    accent: '#F59E0B',
  },
  respondida: {
    label: 'Respondida',
    icono: 'checkmark-circle-outline',
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    accent: '#22C55E',
  },
  cerrada: {
    label: 'Cerrada',
    icono: 'close-circle-outline',
    color: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    accent: '#94A3B8',
  },
};

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'respondida', label: 'Respondidas' },
  { key: 'cerrada', label: 'Cerradas' },
];


function Avatar({ nombre, size = 38 }) {
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

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CFG[estado];
  if (!cfg) return null;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Ionicons name={cfg.icono} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function ConsultaCard({ item, onPress }) {
  const cfg = ESTADO_CFG[item.estado] || {};
  const isPendiente = item.estado === 'pendiente';
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: cfg.accent }]}
      activeOpacity={0.82}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Consulta de ${item.cliente}: ${item.pregunta}`}
    >
      <View style={styles.cardTop}>
        <Avatar nombre={item.cliente} size={40} />
        <View style={styles.cardTopRight}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardCliente}>{item.cliente}</Text>
            <Text style={styles.cardFecha}>{item.fecha}</Text>
          </View>
          <Text style={styles.cardPregunta} numberOfLines={2}>
            {item.pregunta}
          </Text>
        </View>
      </View>

      <View style={styles.cardMid}>
        <EstadoBadge estado={item.estado} />
        <Text style={styles.cardCantidad}>
          Cantidad: <Text style={styles.cardCantidadVal}>{item.cantidad}</Text>
        </Text>
      </View>

      {!!item.respuesta && (
        <View style={[styles.respuestaBox, { borderTopColor: BORDER }]}>
          <Text style={styles.respuestaLabel}>Respuesta</Text>
          <Text style={styles.respuestaText} numberOfLines={2}>
            {item.respuesta}
          </Text>
        </View>
      )}

      {isPendiente && (
        <View style={styles.cardAction}>
          <Text style={styles.cardActionText}>Toca para responder</Text>
          <Ionicons name="arrow-forward-circle-outline" size={18} color={PRIMARY} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BandejaConsultasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState('todas');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [almacen, setAlmacen] = useState(null);
  const [consultas, setConsultas] = useState([]);

  const loadConsultas = useCallback(async () => {
    setError(null);
    const almacenes = await fetchMisAlmacenes();
    const principal = almacenes[0] ?? null;
    setAlmacen(principal);

    if (!principal) {
      setConsultas([]);
      return;
    }

    const data = await fetchConsultasAlmacenero(principal.id);
    setConsultas(data);
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    setIsLoading(true);
    loadConsultas()
      .catch(() => {
        if (active) setError('No pudimos cargar las consultas reales.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadConsultas]));

  const consultasFiltradas =
    filtro === 'todas'
      ? consultas
      : consultas.filter((c) => c.estado === filtro);

  const counts = FILTROS.reduce((acc, f) => {
    acc[f.key] =
      f.key === 'todas'
        ? consultas.length
        : consultas.filter((c) => c.estado === f.key).length;
    return acc;
  }, {});

  function handlePress(consulta) {
    if (consulta.estado !== 'pendiente') return;
    router.push({
      pathname: '/home/almacenero/responder/[id]',
      params: {
        id: consulta.id,
        pregunta: consulta.pregunta,
        cantidad: String(consulta.cantidad),
        cliente: consulta.cliente,
        fecha: consulta.fecha,
      },
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadConsultas();
    } catch {
      setError('No pudimos actualizar las consultas.');
    } finally {
      setRefreshing(false);
    }
  }

  const emptyTitle = isLoading
    ? 'Cargando consultas'
    : error
      ? 'No se pudo cargar'
      : !almacen
        ? 'Sin almacén registrado'
        : 'Sin consultas';
  const emptySubtitle = isLoading
    ? 'Estamos consultando la bandeja real de tu almacén.'
    : error
      ? `${error} Desliza para reintentar.`
      : !almacen
        ? 'Registra un almacén para comenzar a recibir consultas.'
        : `No hay consultas ${filtro !== 'todas' ? `en estado "${FILTROS.find((f) => f.key === filtro)?.label.toLowerCase()}"` : 'disponibles'}.`;

  return (
    <LinearGradient
      colors={['#E5F2F9', '#7AAEC8', PRIMARY]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Text style={styles.headerTitle}>Bandeja de consultas</Text>
            <Text style={styles.headerSubtitle}>
              {counts.todas} consultas · {counts.pendiente} pendientes
            </Text>
          </View>
        </View>

        {/* ── Filtros ── */}
        <View style={styles.filtrosWrap}>
          {FILTROS.map((f) => {
            const isActive = filtro === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filtroChip, isActive && styles.filtroChipActive]}
                onPress={() => setFiltro(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filtroChipText, isActive && styles.filtroChipTextActive]}>
                  {f.label}
                </Text>
                {counts[f.key] > 0 && (
                  <View
                    style={[
                      styles.filtroChipCount,
                      isActive && styles.filtroChipCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filtroChipCountText,
                        isActive && styles.filtroChipCountTextActive,
                      ]}
                    >
                      {counts[f.key]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Lista ── */}
        <FlatList
          data={consultasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConsultaCard item={item} onPress={handlePress} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 28 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="mail-open-outline" size={40} color={TEXT_MUTED} />
              </View>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0A2540',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
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

  /* Filtros */
  filtrosWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(4,78,129,0.12)',
  },
  filtroChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filtroChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  filtroChipTextActive: {
    color: '#fff',
  },
  filtroChipCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(4,78,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filtroChipCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filtroChipCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: PRIMARY,
  },
  filtroChipCountTextActive: {
    color: '#fff',
  },

  /* Lista */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  /* Card */
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 10,
  },
  cardTopRight: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cardCliente: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  cardFecha: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  cardPregunta: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  cardMid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardCantidad: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  cardCantidadVal: {
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  respuestaBox: {
    marginHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  respuestaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  respuestaText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: 'rgba(4,78,129,0.03)',
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
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

  /* Empty */
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
});
