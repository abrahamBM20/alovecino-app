import React from 'react';
import { render } from '@testing-library/react-native';
import SplashScreen from './SplashScreen';

describe('SplashScreen', () => {
  it('muestra los logos empaquetados de AloVecino', () => {
    const { getByLabelText } = render(<SplashScreen />);

    expect(getByLabelText('Logo AloVecino')).toBeTruthy();
    expect(getByLabelText('Texto AloVecino')).toBeTruthy();
  });
});
