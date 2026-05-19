import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';
import { DEFAULT_RADIUS_METERS, fetchNearbyStores } from '../services/geoService';
import { APP_ENV } from '../../../config/environment';

const PRIMARY = '#044E81';
const IS_EXPO_GO = Constants.appOwnership === 'expo';
const MANGO = '#FF8C00';

const CUSTOM_MAP_STYLE = [
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#C8E6F5' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#C8E6F5' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#B3D9F2' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D8EEF8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1E88E5' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2C5F7A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },
];

const DEFAULT_REGION = {
  latitude: -33.4400,
  longitude: -70.7570,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const DEFAULT_LOCATION = {
  latitude: DEFAULT_REGION.latitude,
  longitude: DEFAULT_REGION.longitude,
};

const LOCATION_TIMEOUT_MS = 8000;

const withTimeout = (promise, timeoutMs, message) => {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const formatRadius = (radiusMeters) => {
  if (radiusMeters >= 1000) {
    return `${radiusMeters / 1000} km`;
  }

  return `${radiusMeters} m`;
};

const TAB_ITEMS = [
  { id: 'ubicacion', Component: BotonFiltro },
  { id: 'inicio', Component: BotonInicio },
  { id: 'configuracion', Component: BotonConfiguracion },
  { id: 'perfil', Component: BotonPerfil },
];

export default function HomeScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('ubicacion');
  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [storesError, setStoresError] = useState(false);
  const [stores, setStores] = useState([]);
  const [radiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const applyLocation = (coords) => {
    const { latitude, longitude } = coords;
    setRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 });
    setUserLocation({ latitude, longitude });
  };

  const loadNearbyStores = useCallback(async (isActive = () => true) => {
    if (!userLocation) return;

    setLoadingStores(true);
    setStoresError(false);

    try {
      const nearbyStores = await fetchNearbyStores({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radiusMeters,
      });

      if (isActive()) {
        setStores(nearbyStores);
      }
    } catch {
      if (isActive()) {
        setStores([]);
        setStoresError(true);
      }
    } finally {
      if (isActive()) {
        setLoadingStores(false);
      }
    }
  }, [radiusMeters, userLocation]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        const lastKnownLocation = await Location.getLastKnownPositionAsync({
          maxAge: 10 * 60 * 1000,
          requiredAccuracy: 1000,
        });

        if (lastKnownLocation?.coords) {
          applyLocation(lastKnownLocation.coords);
          return;
        }

        const location = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          LOCATION_TIMEOUT_MS,
          'Timeout al obtener la ubicación actual',
        );

        applyLocation(location.coords);
      } catch (error) {
        console.warn('No se pudo obtener la ubicación actual', error);

        if (APP_ENV === 'dev') {
          applyLocation(DEFAULT_LOCATION);
        } else {
          setNetworkError(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      await loadNearbyStores(() => isMounted);
    })();

    return () => {
      isMounted = false;
    };
  }, [loadNearbyStores]);

  const handleMarkerPress = (store) => {
    router.push({
      pathname: '/home/negocio/[id]',
      params: {
        id: String(store.id),
        nombre: store.name,
        comuna: store.comuna || '',
        region: store.region || '',
        distancia: store.distanceMeters ? String(store.distanceMeters) : '',
      },
    });
  };

  const showEmptyStores = userLocation && !loadingStores && !storesError && stores.length === 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Permiso de ubicación denegado</Text>
        <Text style={styles.errorText}>
          Para ver los negocios cercanos, activa el permiso de ubicación en la configuración de tu dispositivo.
        </Text>
      </View>
    );
  }

  if (networkError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error de conexión</Text>
        <Text style={styles.errorText}>
          No se pudo obtener tu ubicación. Verifica tu conexión e intenta nuevamente.
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={[styles.mapWrapper, { marginTop: insets.top + 10 }]}>
        <MapView
          ref={mapRef}
          provider={IS_EXPO_GO ? undefined : PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={CUSTOM_MAP_STYLE}
        >
          {userLocation && (
            <Circle
              center={userLocation}
              radius={radiusMeters}
              fillColor="rgba(255, 140, 0, 0.15)"
              strokeColor={MANGO}
              strokeWidth={2}
            />
          )}
          {stores.map((store) => (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              title={store.name}
              description={store.distanceMeters ? `${store.distanceMeters} m` : undefined}
              pinColor={PRIMARY}
              onPress={() => handleMarkerPress(store)}
            />
          ))}
        </MapView>
        {(loadingStores || storesError || showEmptyStores) && (
          <View style={styles.mapStatus}>
            {loadingStores ? (
              <ActivityIndicator size="small" color={PRIMARY} />
            ) : showEmptyStores ? (
              <>
                <Text style={styles.mapStatusText}>
                  No hay almacenes cercanos en {formatRadius(radiusMeters)}.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.75}
                  onPress={loadNearbyStores}
                  style={styles.mapStatusAction}
                >
                  <Text style={styles.mapStatusActionText}>Buscar nuevamente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.mapStatusText}>No se pudieron cargar los negocios cercanos.</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.75}
                  onPress={loadNearbyStores}
                  style={styles.mapStatusAction}
                >
                  <Text style={styles.mapStatusActionText}>Reintentar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      <View style={[styles.tabBar, { marginBottom: insets.bottom + 10 }]}>
        {TAB_ITEMS.map(({ id, Component }) => (
          <TouchableOpacity
            key={id}
            activeOpacity={0.75}
            onPress={() => setActiveTab(id)}
          >
            <Component width={63} height={63} opacity={activeTab === id ? 1 : 0.65} />
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 51,
    overflow: 'hidden',
  },
  mapStatus: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    minHeight: 36,
    minWidth: 36,
    maxWidth: '82%',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapStatusText: {
    color: PRIMARY,
    fontSize: 12,
    textAlign: 'center',
  },
  mapStatusAction: {
    marginTop: 6,
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY,
  },
  mapStatusActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: PRIMARY,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});
