import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AuthSelectionScreen from './AuthSelectionScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AuthSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navega al login al presionar iniciar sesion', () => {
    const { getByLabelText } = render(<AuthSelectionScreen />);

    fireEvent.press(getByLabelText('Ir a inicio de sesion'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('navega al registro al presionar crear cuenta', () => {
    const { getByLabelText } = render(<AuthSelectionScreen />);

    fireEvent.press(getByLabelText('Ir a crear cuenta'));

    expect(mockPush).toHaveBeenCalledWith('/auth/register');
  });
});
