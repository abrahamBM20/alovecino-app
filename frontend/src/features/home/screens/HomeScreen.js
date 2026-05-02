import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar, Text } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import HomeBottomNav from '../components/HomeBottomNav';

export default function HomeScreen() {
  const [MapPreview, setMapPreview] = useState(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import('../components/HomeMapPreview')
      .then((module) => {
        if (isMounted) {
          setMapPreview(() => module.default);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (sectionId) => {
    // Aquí se pueden conectar las rutas reales del app más adelante.
  };

  return (
    <ScreenContainer>
      <StatusBar barStyle="light-content" translucent={false} />
      <View style={styles.screen}>
        <View style={styles.mapContainer}>
          {mapError ? (
            <Text style={styles.mapErrorText}>
              No se pudo cargar el mapa. Revisa la configuración nativa del módulo.
            </Text>
          ) : MapPreview ? (
            <MapPreview />
          ) : (
            <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
          )}
        </View>
        <HomeBottomNav onNavigate={handleNavigate} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  mapLoadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  mapErrorText: {
    color: '#ffdddd',
    textAlign: 'center',
    marginTop: 20,
  },
});
