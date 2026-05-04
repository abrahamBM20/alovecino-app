import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';

const PRIMARY = '#044E81';

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
  { id: 'filtro', Component: BotonFiltro },
  { id: 'inicio', Component: BotonInicio },
  { id: 'configuracion', Component: BotonConfiguracion },
  { id: 'perfil', Component: BotonPerfil },
];

export default function HomeScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [activeTab, setActiveTab] = useState('inicio');
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      setRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 });
    })();
  }, []);

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
          style={StyleSheet.absoluteFillObject}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {MOCK_STORES.map((store) => (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              title={store.name}
              pinColor={PRIMARY}
            />
          ))}
        </MapView>
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
