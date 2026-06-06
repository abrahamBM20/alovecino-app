import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import NegocioDetailScreen from './NegocioDetailScreen';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

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
  };
});

jest.mock('../hooks/useValoracion', () => ({
  useValoracion: jest.fn(() => ({
    valoraciones: [],
    isLoading: false,
    error: null,
    promedio: null,
  })),
}));

describe('NegocioDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navega a nueva consulta y no al chat legacy', () => {
    const screen = render(
      <NegocioDetailScreen
        id="7"
        nombre="Almacén Los Queltehues"
        comuna="Peñalolén"
        region="Metropolitana"
        distancia="200"
      />,
    );

    fireEvent.press(screen.getByLabelText('Crear consulta'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/home/consultas/nueva/[id]',
      params: {
        id: '7',
        nombre: 'Almacén Los Queltehues',
        logoUrl: undefined,
      },
    });
  });
});
