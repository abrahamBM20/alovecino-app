import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { fetchNearbyAlmacenes } from '../services/geoService';

import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';

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

const MOCK_STORES = [
  { id: 1, latitude: -33.4370, longitude: -70.7560, name: 'Minimarket El Rincón' },
  { id: 2, latitude: -33.4420, longitude: -70.7620, name: 'Almacén Don Juan' },
  { id: 3, latitude: -33.4340, longitude: -70.7480, name: 'Tienda La Esquina' },
  { id: 4, latitude: -33.4460, longitude: -70.7530, name: 'Mini Market Vecinos' },
  { id: 5, latitude: -33.4390, longitude: -70.7650, name: 'Bodega Los Álamos' },
];

const DEFAULT_REGION = {
  latitude: -33.4400,
  longitude: -70.7570,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [stores, setStores] = useState(MOCK_STORES);
  const [geoError, setGeoError] = useState(false);
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Paso 1: Solicitar permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }

        // Paso 2: Obtener ubicación del usuario para mostrar el mapa
        try {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = location.coords;
          setRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 });
          setUserLocation({ latitude, longitude });

          // Paso 3: Intentar cargar almacenes cercanos
          // Si falla, el mapa se sigue mostrando con datos de ejemplo
          try {
            const nearbyStores = await fetchNearbyAlmacenes({ lat: latitude, lng: longitude, radioKm: 30 });
            if (Array.isArray(nearbyStores) && nearbyStores.length > 0) {
              setStores(
                nearbyStores.map((store) => ({
                  id: store.idAlmacen ?? store.id,
                  latitude: Number(store.latitud),
                  longitude: Number(store.longitud),
                  name: store.nombre ?? 'Almacén cercano',
                })),
              );
              setGeoError(false);
            } else {
              // Si la respuesta está vacía, usar datos de ejemplo
              setGeoError(false);
            }
          } catch (geoFetchError) {
            console.warn('Error obteniendo almacenes cercanos:', geoFetchError);
            // El mapa sigue visible con almacenes de ejemplo
            setGeoError(true);
          }
        } catch (locationError) {
          console.error('Error obteniendo ubicación:', locationError);
          // Si no obtenemos ubicación, mostramos el mapa con la ubicación por defecto
          setGeoError(true);
        }
      } catch (error) {
        console.error('Error desconocido en HomeScreen:', error);
        setGeoError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMarkerPress = (storeId) => {
    router.push(`/home/negocio/${storeId}`);
  };

  if (loading && !userLocation) {
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
              radius={1000}
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
              pinColor={PRIMARY}
              onPress={() => handleMarkerPress(store.id)}
            />
          ))}
        </MapView>
      </View>

      {geoError && (
        <View style={styles.geoErrorBanner}>
          <Text style={styles.errorText}>
            No se pudieron cargar los negocios desde el gateway. Se muestran ubicaciones de ejemplo.
          </Text>
        </View>
      )}

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
  geoErrorBanner: {
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#FFEBE6',
    borderRadius: 16,
  },
});
