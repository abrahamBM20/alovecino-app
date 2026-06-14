import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';
import { fetchNearbyStores } from '../services/geoService';
import { getConfiguracion } from '../../configuracion/services/configuracionService';
import { useAuthStore } from '../../../store/authStore';
import { mapApiError } from '../../../shared/api/errorMapper';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#183A52';
const TEXT_SECONDARY = '#4A6580';
const PANEL_RADIUS_METERS = 2000;
const LOCATION_TIMEOUT_MS = 8000;

const TAB_ITEMS = [
  { id: 'ubicacion', Component: BotonFiltro, route: '/home/ubicacion' },
  { id: 'inicio', Component: BotonInicio, route: '/home' },
  { id: 'configuracion', Component: BotonConfiguracion, route: '/home/configuracion' },
  { id: 'perfil', Component: BotonPerfil, route: '/home/perfil' },
];

const DEFAULT_LOCATION = {
  latitude: -33.4908,
  longitude: -70.5439,
};

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined) {
    return 'A distancia no disponible';
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10000 ? 0 : 1)} km`;
  }

  return `${distanceMeters} m`;
}

function formatRadius(radiusMeters) {
  return radiusMeters >= 1000 ? `${radiusMeters / 1000} km` : `${radiusMeters} m`;
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AV';
}

function getRadiusFromConfig(config) {
  const km = Number(config?.radioOfertasKm);
  if (!Number.isFinite(km) || km <= 0) {
    return PANEL_RADIUS_METERS;
  }

  return Math.round(km * 1000);
}

function StoreCard({ store, onPress, onConsult }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${store.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.storeCard, pressed && styles.cardPressed]}
    >
      <View style={styles.storeHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(store.name)}</Text>
        </View>
        <View style={styles.storeTitleBlock}>
          <Text numberOfLines={1} style={styles.storeName}>{store.name}</Text>
          <Text numberOfLines={1} style={styles.storeAddress}>{store.address || store.comuna}</Text>
        </View>
        <View style={styles.distancePill}>
          <Text style={styles.distanceText}>{formatDistance(store.distanceMeters)}</Text>
        </View>
      </View>

      <View style={styles.storeMetaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Perfil</Text>
          <Text style={styles.metaValue}>Activo</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Ofertas</Text>
          <Text style={styles.metaValue}>Sin publicadas</Text>
        </View>
      </View>

      <View style={styles.storeActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Consultar a ${store.name}`}
          onPress={(event) => {
            event?.stopPropagation?.();
            onConsult();
          }}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.actionPressed]}
        >
          <Text style={styles.primaryActionText}>Consultar</Text>
        </Pressable>
        <Text style={styles.secondaryActionText}>Ver perfil</Text>
      </View>
    </Pressable>
  );
}

function QuickAction({ title, subtitle, onPress, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.cardPressed]}
    >
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [radiusMeters, setRadiusMeters] = useState(PANEL_RADIUS_METERS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const nearestStore = useMemo(() => {
    if (stores.length === 0) return null;
    return stores.reduce((nearest, store) => {
      if (!nearest) return store;
      return (store.distanceMeters ?? Number.MAX_SAFE_INTEGER) < (nearest.distanceMeters ?? Number.MAX_SAFE_INTEGER)
        ? store
        : nearest;
    }, null);
  }, [stores]);

  const loadLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return DEFAULT_LOCATION;
    }

    const current = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      LOCATION_TIMEOUT_MS,
      'Timeout al obtener la ubicación actual',
    );

    return current.coords;
  }, []);

  const loadDashboard = useCallback(async () => {
    setError(null);
    const coords = await loadLocation();
    setLocation(coords);

    let nextRadius = PANEL_RADIUS_METERS;
    if (user?.id) {
      try {
        const config = await getConfiguracion(user.id);
        nextRadius = getRadiusFromConfig(config);
      } catch {
        nextRadius = PANEL_RADIUS_METERS;
      }
    }

    setRadiusMeters(nextRadius);
    const nearbyStores = await fetchNearbyStores({
      latitude: coords.latitude,
      longitude: coords.longitude,
      radiusMeters: nextRadius,
    });
    setStores(nearbyStores);
  }, [loadLocation, user?.id]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        await loadDashboard();
      } catch (err) {
        if (active) {
          setStores([]);
          setError(mapApiError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  useFocusEffect(useCallback(() => {
    let active = true;

    (async () => {
      if (loading) return;
      try {
        await loadDashboard();
      } catch {
        if (active) {
          setStores([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loadDashboard, loading]));

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } catch (err) {
      setStores([]);
      setError(mapApiError(err));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const goToStore = (store) => {
    router.push({
      pathname: '/home/negocio/[id]',
      params: {
        id: String(store.id),
        nombre: store.name,
        comuna: store.comuna || '',
        region: store.region || '',
        direccion: store.address || '',
        distancia: store.distanceMeters ? String(store.distanceMeters) : '',
      },
    });
  };

  const goToConsult = (store) => {
    router.push({
      pathname: '/home/consultas/nueva/[id]',
      params: { id: String(store.id), nombre: store.name },
    });
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 118 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>AloVecino</Text>
              <Text style={styles.title}>Inicio</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Actualizar panel"
              onPress={refresh}
              disabled={refreshing}
              style={({ pressed }) => [styles.refreshButton, pressed && styles.actionPressed]}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.refreshText}>Actualizar</Text>
              )}
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={PRIMARY} />
              <Text style={styles.loadingText}>Cargando almacenes cercanos...</Text>
            </View>
          ) : (
            <>
              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{stores.length}</Text>
                  <Text style={styles.summaryLabel}>Almacenes activos</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{formatRadius(radiusMeters)}</Text>
                  <Text style={styles.summaryLabel}>Radio de ofertas</Text>
                </View>
              </View>

              <View style={styles.quickActions}>
                <QuickAction
                  title="Mis consultas"
                  subtitle="Revisa respuestas e historial"
                  accessibilityLabel="Abrir historial de consultas"
                  onPress={() => router.push('/home/consultas/mis')}
                />
                <QuickAction
                  title="Explorar mapa"
                  subtitle="Busca almacenes por radio"
                  accessibilityLabel="Abrir mapa de almacenes"
                  onPress={() => router.push('/home/ubicacion')}
                />
              </View>

              <View style={styles.featuredPanel}>
                <Text style={styles.sectionTitle}>Más cercano</Text>
                {nearestStore ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ver almacén más cercano ${nearestStore.name}`}
                    onPress={() => goToStore(nearestStore)}
                    style={({ pressed }) => [styles.featuredStore, pressed && styles.cardPressed]}
                  >
                    <Text numberOfLines={1} style={styles.featuredName}>{nearestStore.name}</Text>
                    <Text numberOfLines={1} style={styles.featuredAddress}>{nearestStore.address}</Text>
                    <Text style={styles.featuredDistance}>{formatDistance(nearestStore.distanceMeters)}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.emptyText}>No hay almacenes activos dentro del radio configurado.</Text>
                )}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Almacenes cercanos</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Abrir mapa"
                  onPress={() => router.push('/home/ubicacion')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.mapLink}>Mapa</Text>
                </TouchableOpacity>
              </View>

              {stores.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.emptyTitle}>Sin almacenes cercanos</Text>
                  <Text style={styles.emptyText}>Revisa un radio mayor desde configuración o abre el mapa.</Text>
                </View>
              ) : (
                stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onPress={() => goToStore(store)}
                    onConsult={() => goToConsult(store)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>

        <View style={[styles.tabBar, { marginBottom: insets.bottom + 10 }]}>
          {TAB_ITEMS.map(({ id, Component, route }) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Tab ${id}`}
              onPress={() => router.push(route)}
            >
              <Component width={63} height={63} opacity={id === 'inicio' ? 1 : 0.65} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  kicker: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: '800',
  },
  refreshButton: {
    minHeight: 38,
    minWidth: 102,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingBox: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: PRIMARY,
    marginTop: 12,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 14,
    justifyContent: 'center',
  },
  summaryValue: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  quickAction: {
    flex: 1,
    minHeight: 76,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 12,
    justifyContent: 'center',
  },
  quickActionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  featuredPanel: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    marginBottom: 18,
  },
  featuredStore: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#E8F1F8',
    padding: 12,
  },
  featuredName: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '800',
  },
  featuredAddress: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 3,
  },
  featuredDistance: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '800',
  },
  mapLink: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    overflow: 'hidden',
  },
  storeCard: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 14,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.86,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#DDEEF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '800',
  },
  storeTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  storeName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
  },
  storeAddress: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  distancePill: {
    minHeight: 30,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    paddingHorizontal: 9,
    marginLeft: 8,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  storeMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F3F8FC',
    padding: 10,
  },
  metaLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  storeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  primaryAction: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '800',
  },
  actionPressed: {
    opacity: 0.82,
  },
  emptyPanel: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 18,
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  tabBar: {
    height: 87,
    marginHorizontal: 18,
    backgroundColor: PRIMARY,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
