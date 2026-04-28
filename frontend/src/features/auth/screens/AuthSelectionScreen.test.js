import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AuthSelectionScreen from './AuthSelectionScreen';

describe('AuthSelectionScreen', () => {
  it('navega al login al presionar iniciar sesion', () => {
    const navigate = jest.fn();
    const { getByLabelText } = render(<AuthSelectionScreen navigation={{ navigate }} />);

    fireEvent.press(getByLabelText('Ir a inicio de sesion'));

    expect(navigate).toHaveBeenCalledWith('Login');
  });
});
