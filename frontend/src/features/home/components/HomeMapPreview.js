import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../../../theme/colors';

const DEFAULT_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function HomeMapPreview() {
  const [region, setRegion] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMessage('Permiso de ubicación denegado. Activa la ubicación para ver el mapa.');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = currentLocation.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
      } catch (error) {
        // Si el módulo nativo no está disponible, se detectará y se mostrará un mensaje.
        // Esto también evita que la pantalla quede en estado de carga indefinido.
        console.error('HomeMapPreview location error:', error);
        setErrorMessage('Error al cargar el mapa. Verifica el cliente nativo y los permisos de ubicación.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.loadingBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
          toolbarEnabled={false}
          moveOnMarkerPress={false}
        >
          <Marker coordinate={region} pinColor={colors.primary} />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#eff4ff',
    borderWidth: 1,
    borderColor: 'rgba(26,86,219,0.14)',
    shadowColor: colors.bgDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    color: colors.textSoft,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
  },
});
