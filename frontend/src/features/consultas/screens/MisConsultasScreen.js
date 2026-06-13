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
import { useAuthStore } from '../../../store/authStore';
import { getPerfilUsuario } from '../../perfil/services/perfilService';
import { fetchConsultasCliente } from '../services/consultasClienteService';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.97)';
const BORDER = '#E0EEF6';

const ESTADO_CFG = {
  pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7', icon: 'time-outline' },
  respondida: { label: 'Respondida', color: '#15803D', bg: '#F0FDF4', icon: 'checkmark-circle-outline' },
  cerrada: { label: 'Cerrada', color: '#475569', bg: '#F1F5F9', icon: 'close-circle-outline' },
  cancelada: { label: 'Cancelada', color: '#475569', bg: '#F1F5F9', icon: 'remove-circle-outline' },
};

function ConsultaCard({ item, onOpenStore, onNewConsult }) {
  const cfg = ESTADO_CFG[item.estado] ?? ESTADO_CFG.pendiente;
  const almacenLabel = item.nombreAlmacen || `Almacén #${item.idAlmacen}`;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.fecha}>{item.fecha}</Text>
      </View>
      <Text style={styles.almacenName}>{almacenLabel}</Text>
      <Text style={styles.resumen}>{item.resumen}</Text>
      {item.detalles.slice(1).map((detalle) => (
        <Text key={detalle.id} style={styles.detalleExtra}>
          {detalle.descripcion} ({detalle.cantidadSolicitada})
        </Text>
      ))}
      {!!item.respuesta && (
        <View style={styles.respuestaBox}>
          <Text style={styles.respuestaLabel}>Respuesta del almacén</Text>
          <Text style={styles.respuestaText}>{item.respuesta}</Text>
        </View>
      )}
      <View style={styles.cardActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${almacenLabel}`}
          activeOpacity={0.8}
          onPress={onOpenStore}
          style={styles.cardAction}
        >
          <Ionicons name="storefront-outline" size={15} color={PRIMARY} />
          <Text style={styles.cardActionText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Nueva consulta a ${almacenLabel}`}
          activeOpacity={0.8}
          onPress={onNewConsult}
          style={styles.cardAction}
        >
          <Ionicons name="send-outline" size={15} color={PRIMARY} />
          <Text style={styles.cardActionText}>Consultar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MisConsultasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadConsultas = useCallback(async () => {
    if (!user?.id) {
      setConsultas([]);
      setError('No pudimos identificar tu usuario. Inicia sesión nuevamente.');
      return;
    }
    setError(null);
    const perfil = await getPerfilUsuario(user.id);
    const idCliente = perfil?.cliente?.idCliente;
    if (!idCliente) {
      setConsultas([]);
      setError('Tu usuario no tiene un perfil de cliente asociado.');
      return;
    }
    const data = await fetchConsultasCliente(idCliente);
    setConsultas(data);
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    let active = true;
    setIsLoading(true);
    loadConsultas()
      .catch(() => {
        if (active) setError('No pudimos cargar tus consultas.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadConsultas]));

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadConsultas();
    } catch {
      setError('No pudimos actualizar tus consultas.');
    } finally {
      setRefreshing(false);
    }
  }

  function openStore(item) {
    router.push({
      pathname: '/home/negocio/[id]',
      params: {
        id: String(item.idAlmacen),
        nombre: item.nombreAlmacen || '',
      },
    });
  }

  function newConsult(item) {
    router.push({
      pathname: '/home/consultas/nueva/[id]',
      params: {
        id: String(item.idAlmacen),
        nombre: item.nombreAlmacen || '',
      },
    });
  }

  const emptyTitle = isLoading ? 'Cargando consultas' : error ? 'No se pudo cargar' : 'Sin consultas';
  const emptySubtitle = isLoading
    ? 'Estamos revisando tus consultas reales.'
    : error
      ? `${error} Desliza para reintentar.`
      : 'Cuando consultes a un almacén, aparecerá en esta bandeja.';

  return (
    <LinearGradient
      colors={['#E5F2F9', '#7AAEC8', PRIMARY]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Text style={styles.headerTitle}>Mis consultas</Text>
            <Text style={styles.headerSubtitle}>{consultas.length} registradas</Text>
          </View>
        </View>

        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConsultaCard
              item={item}
              onOpenStore={() => openStore(item)}
              onNewConsult={() => newConsult(item)}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 28 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={(
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} colors={[PRIMARY]} />
          )}
          ListEmptyComponent={(
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="mail-open-outline" size={40} color={TEXT_MUTED} />
              </View>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          )}
        />
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
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    ...SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  fecha: { fontSize: 11, color: TEXT_MUTED },
  almacenName: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 6,
  },
  resumen: { fontSize: 15, fontWeight: '800', color: TEXT_PRIMARY, lineHeight: 21 },
  detalleExtra: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 4 },
  respuestaBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  respuestaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  respuestaText: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 19 },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cardAction: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F8FCFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: TEXT_PRIMARY, marginBottom: 6 },
  emptySubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
});
