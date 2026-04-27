import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AuthSelectionScreen from './AuthSelectionScreen';

describe('AuthSelectionScreen', () => {
  it('navega al login al presionar iniciar sesion', () => {
    const navigate = jest.fn();
    const { getByA11yLabel } = render(<AuthSelectionScreen navigation={{ navigate }} />);

    fireEvent.press(getByA11yLabel('Ir a inicio de sesion'));

    expect(navigate).toHaveBeenCalledWith('Login');
  });
});
