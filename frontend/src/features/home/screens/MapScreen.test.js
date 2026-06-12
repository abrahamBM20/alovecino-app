import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { fetchNearbyStores } from '../services/geoService';
import MapScreen from './MapScreen';

const mockPush = jest.fn();

jest.mock('expo-location', () => ({
  Accuracy: {
    Balanced: 3,
  },
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
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

jest.mock('expo-constants', () => ({
  appOwnership: 'standalone',
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');

  return {
    LinearGradient: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  function MapView({ children }) {
    return <View testID="map-view">{children}</View>;
  }

  function Marker({ title, description, onPress }) {
    return (
      <Pressable testID={`marker-${title}`} accessibilityLabel={title} onPress={onPress}>
        <Text>{title}</Text>
        {!!description && <Text>{description}</Text>}
      </Pressable>
    );
  }

  function Circle() {
    return <View testID="map-radius" />;
  }

  return {
    __esModule: true,
    default: MapView,
    Marker,
    Circle,
    PROVIDER_GOOGLE: 'google',
  };
});

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
  RADIUS_OPTIONS: [500, 2000, 10000, 100000],
  fetchNearbyStores: jest.fn(),
}));

describe('MapScreen', () => {
  const currentLocation = {
    coords: {
      latitude: -33.44889,
      longitude: -70.669265,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getLastKnownPositionAsync.mockResolvedValue(currentLocation);
    Location.getCurrentPositionAsync.mockResolvedValue(currentLocation);
    fetchNearbyStores.mockResolvedValue([]);
  });

  const renderHomeScreen = async () => {
    const screen = render(<MapScreen />);

    await waitFor(
      () => expect(screen.queryByText('Obteniendo tu ubicación...')).toBeNull(),
      { timeout: 5000 },
    );

    return screen;
  };

  it('muestra markers de almacenes cercanos con nombre, direccion y distancia', async () => {
    fetchNearbyStores.mockResolvedValueOnce([
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
    ]);

    const { getByText, getByTestId, queryByText } = await renderHomeScreen();

    expect(getByTestId('map-view')).toBeTruthy();
    await waitFor(() => expect(getByText('Almacén Central')).toBeTruthy());

    expect(getByText('Av. Matta 123, Santiago, Metropolitana - 214 m')).toBeTruthy();
    expect(queryByText(/No hay almacenes cercanos/)).toBeNull();
    expect(fetchNearbyStores).toHaveBeenCalledWith({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 500,
    });
  });

  it('prioriza la ubicación actual sobre una última ubicación conocida antigua', async () => {
    Location.getLastKnownPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: -33.4400,
        longitude: -70.7570,
      },
    });
    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: -33.4876,
        longitude: -70.5389,
      },
    });

    await renderHomeScreen();

    await waitFor(() => expect(fetchNearbyStores).toHaveBeenCalledWith({
      latitude: -33.4876,
      longitude: -70.5389,
      radiusMeters: 500,
    }));
  });

  it('actualiza la ubicación al presionar el tab de ubicación', async () => {
    Location.getCurrentPositionAsync
      .mockResolvedValueOnce(currentLocation)
      .mockResolvedValueOnce({
        coords: {
          latitude: -33.4876,
          longitude: -70.5389,
        },
      });

    const { getByLabelText } = await renderHomeScreen();

    fireEvent.press(getByLabelText('Actualizar ubicación'));

    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(2));
  });

  it('muestra estado vacio y permite buscar nuevamente cuando no hay almacenes cercanos', async () => {
    fetchNearbyStores
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 8,
          name: 'Almacén Nuevo',
          latitude: -33.449,
          longitude: -70.669,
          distanceMeters: 120,
          address: 'Las Flores 45, Santiago, Metropolitana',
        },
      ]);

    const { getByText } = await renderHomeScreen();

    await waitFor(() => expect(getByText('No hay almacenes cercanos en 500 m.')).toBeTruthy());

    fireEvent.press(getByText('Buscar nuevamente'));

    await waitFor(() => expect(getByText('Almacén Nuevo')).toBeTruthy());
    expect(fetchNearbyStores).toHaveBeenCalledTimes(2);
  });

  it('permite ampliar el radio de busqueda y vuelve a cargar almacenes', async () => {
    fetchNearbyStores
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 10,
          name: 'Almacén Vicuña',
          latitude: -33.5193,
          longitude: -70.5986,
          distanceMeters: 1800,
          address: 'Vicuña Mackenna 1000, La Florida, Metropolitana',
        },
      ]);

    const { getByLabelText, getByText } = await renderHomeScreen();

    await waitFor(() => expect(getByText('No hay almacenes cercanos en 500 m.')).toBeTruthy());

    fireEvent.press(getByLabelText('Buscar almacenes en 2 km'));

    await waitFor(() => expect(getByText('Almacén Vicuña')).toBeTruthy());
    expect(fetchNearbyStores).toHaveBeenLastCalledWith({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 2000,
    });
  });

  it('el tab inicio navega al panel informativo', async () => {
    fetchNearbyStores.mockResolvedValue([]);

    const { getAllByLabelText } = await renderHomeScreen();

    fireEvent.press(getAllByLabelText('Tab inicio')[0]);

    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('muestra error de carga de almacenes y permite reintentar', async () => {
    fetchNearbyStores
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce([
        {
          id: 9,
          name: 'Almacén Recuperado',
          latitude: -33.449,
          longitude: -70.669,
          distanceMeters: 90,
          address: 'San Diego 90, Santiago, Metropolitana',
        },
      ]);

    const { getByText } = await renderHomeScreen();

    await waitFor(() => expect(getByText('No se pudieron cargar los negocios cercanos.')).toBeTruthy());

    fireEvent.press(getByText('Reintentar'));

    await waitFor(() => expect(getByText('Almacén Recuperado')).toBeTruthy());
    expect(fetchNearbyStores).toHaveBeenCalledTimes(2);
  });

  it('navega al detalle con direccion al presionar un marker', async () => {
    fetchNearbyStores.mockResolvedValueOnce([
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
    ]);

    const { getByTestId } = await renderHomeScreen();

    await waitFor(() => expect(getByTestId('marker-Almacén Central')).toBeTruthy());

    fireEvent.press(getByTestId('marker-Almacén Central'));

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

  it('navega a configuracion al presionar el tab de configuracion', async () => {
    const { getAllByLabelText } = await renderHomeScreen();

    fireEvent.press(getAllByLabelText('Tab configuracion')[0]);

    expect(mockPush).toHaveBeenCalledWith('/home/configuracion');
  });

  it('muestra mensaje claro cuando el permiso de ubicacion fue denegado', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    const { getByText } = await renderHomeScreen();

    await waitFor(() => expect(getByText('Permiso de ubicación denegado')).toBeTruthy());
    expect(fetchNearbyStores).not.toHaveBeenCalled();
  });
});
