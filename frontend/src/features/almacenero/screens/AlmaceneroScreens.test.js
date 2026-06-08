import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import BandejaConsultasScreen from './BandejaConsultasScreen';
import PanelAlmaceneroScreen from './PanelAlmaceneroScreen';
import { fetchMisAlmacenes } from '../services/almacenService';
import { fetchConsultasAlmacenero, fetchDashboardAlmacenero } from '../services/consultasService';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => {
  const ReactMock = require('react');
  return {
    useRouter: () => ({ push: mockPush, back: mockBack }),
    useFocusEffect: (callback) => ReactMock.useEffect(callback, [callback]),
  };
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }) => {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  },
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: (selector) => selector({
    user: { nombre: 'Almacenero Test' },
    role: 'ALMACEN',
    logout: jest.fn(),
  }),
}));

jest.mock('../services/almacenService', () => ({
  fetchMisAlmacenes: jest.fn(),
  fetchAlmacenPerfil: jest.fn(),
  updateAlmacenPerfil: jest.fn(),
}));

jest.mock('../services/consultasService', () => ({
  fetchConsultasAlmacenero: jest.fn(),
  fetchDashboardAlmacenero: jest.fn(),
}));

describe('pantallas de almacenero con datos reales', () => {
  const almacen = {
    id: 7,
    nombre: 'Almacén Los Queltehues',
    estado: 'PENDIENTE',
    direccion: 'Pasaje Los Queltehues 1234, Peñalolén',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMisAlmacenes.mockResolvedValue([almacen]);
  });

  it('panel consulta almacén y dashboard reales', async () => {
    fetchDashboardAlmacenero.mockResolvedValue({
      pendientes: 1,
      consultasHoy: 2,
      respondidas: 3,
      cerradas: 1,
      tiempoPromedioMin: 15,
      consultasRecientes: [
        {
          id: '11',
          cliente: 'Ana Pérez',
          pregunta: '¿Tiene arroz?',
          fecha: '03 jun, 10:30',
        },
      ],
    });

    const screen = render(<PanelAlmaceneroScreen />);

    await waitFor(() => expect(fetchMisAlmacenes).toHaveBeenCalledTimes(1));
    expect(fetchDashboardAlmacenero).toHaveBeenCalledWith(7);
    expect(await screen.findByText(/Almacén Los Queltehues/)).toBeTruthy();
    expect(screen.getByText(/pendiente de aprobación/i)).toBeTruthy();
    expect(screen.getByText('¿Tiene arroz?')).toBeTruthy();
  });

  it('bandeja consulta datos reales y navega a responder con id real', async () => {
    fetchConsultasAlmacenero.mockResolvedValue([
      {
        id: '11',
        cliente: 'Ana Pérez',
        pregunta: '¿Tiene arroz?',
        cantidad: 2,
        estado: 'pendiente',
        fecha: '03 jun, 10:30',
      },
    ]);

    const screen = render(<BandejaConsultasScreen />);

    const consulta = await screen.findByText('¿Tiene arroz?');
    expect(fetchMisAlmacenes).toHaveBeenCalledTimes(1);
    expect(fetchConsultasAlmacenero).toHaveBeenCalledWith(7);

    fireEvent.press(consulta);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/home/almacenero/responder/[id]',
      params: {
        id: '11',
        pregunta: '¿Tiene arroz?',
        cantidad: '2',
        cliente: 'Ana Pérez',
        fecha: '03 jun, 10:30',
      },
    });
  });
});
