import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuthStore } from '../store/authStore';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#044e81',
  },
};

export default function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'authenticated' ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
