import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { fetchNearbyStores } from '../services/geoService';
import { getConfiguracion } from '../../configuracion/services/configuracionService';
import HomeScreen from './HomeScreen';

const mockPush = jest.fn();

jest.mock('expo-location', () => ({
  Accuracy: {
    Balanced: 3,
  },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    useRouter: () => ({
      push: mockPush,
    }),
    useFocusEffect: (callback) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');

  return {
    LinearGradient: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('../../../../assets/boton_filtro.svg', () => function MockFiltro(props) {
  const { View } = require('react-native');
  return <View accessibilityLabel="Tab ubicacion" {...props} />;
});

jest.mock('../../../../assets/boton_inicio.svg', () => function MockInicio(props) {
  const { View } = require('react-native');
  return <View accessibilityLabel="Tab inicio" {...props} />;
});

jest.mock('../../../../assets/boton_configuracion.svg', () => function MockConfig(props) {
  const { View } = require('react-native');
  return <View accessibilityLabel="Tab configuracion" {...props} />;
});

jest.mock('../../../../assets/boton_perfil.svg', () => function MockPerfil(props) {
  const { View } = require('react-native');
  return <View accessibilityLabel="Tab perfil" {...props} />;
});

jest.mock('../services/geoService', () => ({
  DEFAULT_RADIUS_METERS: 500,
  fetchNearbyStores: jest.fn(),
}));

jest.mock('../../configuracion/services/configuracionService', () => ({
  getConfiguracion: jest.fn(),
}));

jest.mock('../../../store/authStore', () => ({
  useAuthStore: (selector) => selector({
    user: { id: 3, name: 'Cliente Test' },
  }),
}));

describe('HomeScreen', () => {
  const currentLocation = {
    coords: {
      latitude: -33.44889,
      longitude: -70.669265,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue(currentLocation);
    getConfiguracion.mockResolvedValue({ radioOfertasKm: 2 });
    fetchNearbyStores.mockResolvedValue([
      {
        id: 7,
        name: 'Almacén Central',
        latitude: -33.4489,
        longitude: -70.6692,
        distanceMeters: 214,
        address: 'Av. Matta 123, Santiago, Metropolitana',
        comuna: 'Santiago',
        region: 'Metropolitana',
      },
      {
        id: 8,
        name: 'Botillería Norte',
        latitude: -33.449,
        longitude: -70.669,
        distanceMeters: 650,
        address: 'San Diego 90, Santiago, Metropolitana',
        comuna: 'Santiago',
        region: 'Metropolitana',
      },
    ]);
  });

  const renderHomeScreen = async () => {
    const screen = render(<HomeScreen />);

    await waitFor(() => expect(screen.queryByText('Cargando almacenes cercanos...')).toBeNull());

    return screen;
  };

  it('muestra un panel informativo con almacenes cercanos y radio de ofertas', async () => {
    const { getAllByText, getByText, queryByTestId } = await renderHomeScreen();

    expect(queryByTestId('map-view')).toBeNull();
    expect(getByText('Inicio')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('Almacenes activos')).toBeTruthy();
    expect(getByText('2 km')).toBeTruthy();
    expect(getByText('Radio de ofertas')).toBeTruthy();
    expect(getAllByText('Almacén Central').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Botillería Norte')).toBeTruthy();
    expect(fetchNearbyStores).toHaveBeenCalledWith({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 2000,
    });
  });

  it('navega al perfil del almacén desde una card', async () => {
    const { getByLabelText } = await renderHomeScreen();

    fireEvent.press(getByLabelText('Ver perfil de Almacén Central'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/home/negocio/[id]',
      params: {
        id: '7',
        nombre: 'Almacén Central',
        comuna: 'Santiago',
        region: 'Metropolitana',
        direccion: 'Av. Matta 123, Santiago, Metropolitana',
        distancia: '214',
      },
    });
  });

  it('navega al formulario de consulta desde una card', async () => {
    const { getByLabelText } = await renderHomeScreen();

    fireEvent.press(getByLabelText('Consultar a Almacén Central'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/home/consultas/nueva/[id]',
      params: { id: '7', nombre: 'Almacén Central' },
    });
  });

  it('abre la pantalla de mapa desde el primer tab', async () => {
    const { getAllByLabelText } = await renderHomeScreen();

    fireEvent.press(getAllByLabelText('Tab ubicacion')[0]);

    expect(mockPush).toHaveBeenCalledWith('/home/ubicacion');
  });

  it('muestra estado vacío cuando no hay almacenes activos en el radio', async () => {
    fetchNearbyStores.mockResolvedValue([]);

    const { getByText } = await renderHomeScreen();

    expect(getByText('Sin almacenes cercanos')).toBeTruthy();
  });
});
