import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function HomeScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const mapRef = useRef(null);

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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {MOCK_STORES.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            pinColor="#1a56db"
          />
        ))}
      </MapView>

      <SafeAreaView edges={['bottom']} style={styles.navWrapper}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="location-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <Ionicons name="home" size={26} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="settings-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d2d5e',
  },
  map: {
    flex: 1,
  },
  navWrapper: {
    backgroundColor: '#0d2d5e',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: '#1a56db',
  },
});
