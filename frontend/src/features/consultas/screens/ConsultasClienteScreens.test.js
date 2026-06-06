import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CrearConsultaScreen from './CrearConsultaScreen';
import MisConsultasScreen from './MisConsultasScreen';
import { crearConsultaCliente, fetchConsultasCliente } from '../services/consultasClienteService';
import { getPerfilUsuario } from '../../perfil/services/perfilService';

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  const ReactMock = require('react');
  return {
    useRouter: () => ({ back: mockBack, replace: mockReplace }),
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
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: (selector) => selector({
    user: { id: '9', email: 'cliente@alovecino.test' },
    role: 'CLIENTE',
  }),
}));

jest.mock('../services/consultasClienteService', () => ({
  crearConsultaCliente: jest.fn(),
  fetchConsultasCliente: jest.fn(),
}));

jest.mock('../../perfil/services/perfilService', () => ({
  getPerfilUsuario: jest.fn(),
}));

describe('pantallas cliente de consultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPerfilUsuario.mockResolvedValue({
      idUsuario: 9,
      cliente: { idCliente: 44 },
    });
  });

  it('crea una consulta real desde el detalle de almacén', async () => {
    crearConsultaCliente.mockResolvedValue({
      id: '21',
      idConsulta: 21,
      estado: 'pendiente',
      resumen: 'Arroz grado 1 (2)',
    });

    const screen = render(<CrearConsultaScreen idAlmacen="7" nombreAlmacen="Almacén Los Queltehues" />);

    await waitFor(() => expect(getPerfilUsuario).toHaveBeenCalledWith('9'));
    fireEvent.changeText(screen.getByLabelText('Descripción detalle 1'), 'Arroz grado 1');
    fireEvent.changeText(screen.getByLabelText('Cantidad detalle 1'), '2');
    fireEvent.press(screen.getByLabelText('Enviar consulta'));

    await waitFor(() => expect(crearConsultaCliente).toHaveBeenCalledWith({
      idCliente: 44,
      idAlmacen: '7',
      detalles: [{ descripcion: 'Arroz grado 1', cantidadSolicitada: '2' }],
    }));
    expect(await screen.findByText('Consulta enviada')).toBeTruthy();
    expect(screen.getByText('Folio #21')).toBeTruthy();
  });

  it('permite navegar a mis consultas después de crear', async () => {
    crearConsultaCliente.mockResolvedValue({
      id: '21',
      idConsulta: 21,
      estado: 'pendiente',
      resumen: 'Pan (1)',
    });

    const screen = render(<CrearConsultaScreen idAlmacen="7" nombreAlmacen="Almacén Los Queltehues" />);

    await waitFor(() => expect(getPerfilUsuario).toHaveBeenCalledWith('9'));
    fireEvent.changeText(screen.getByLabelText('Descripción detalle 1'), 'Pan');
    fireEvent.changeText(screen.getByLabelText('Cantidad detalle 1'), '1');
    fireEvent.press(screen.getByLabelText('Enviar consulta'));

    await screen.findByText('Consulta enviada');
    fireEvent.press(screen.getByLabelText('Ver mis consultas'));

    expect(mockReplace).toHaveBeenCalledWith('/home/consultas/mis');
  });

  it('lista consultas del cliente con respuesta del almacén', async () => {
    fetchConsultasCliente.mockResolvedValue([
      {
        id: '21',
        estado: 'respondida',
        fecha: '05 jun, 12:30',
        resumen: 'Arroz grado 1 (2)',
        detalles: [{ id: '31', descripcion: 'Arroz grado 1', cantidadSolicitada: 2 }],
        respuesta: 'Sí, tenemos stock',
      },
    ]);

    const screen = render(<MisConsultasScreen />);

    await waitFor(() => expect(getPerfilUsuario).toHaveBeenCalledWith('9'));
    expect(fetchConsultasCliente).toHaveBeenCalledWith(44);
    expect(await screen.findByText('Arroz grado 1 (2)')).toBeTruthy();
    expect(screen.getByText('Sí, tenemos stock')).toBeTruthy();
  });
});
