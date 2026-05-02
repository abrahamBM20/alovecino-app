import React from 'react';
import { router } from 'expo-router';
import RegisterScreen from '../../../features/auth/screens/RegisterScreen';

export default function RegisterRoute() {
  const navigation = {
    navigate: (routeName) => {
      if (routeName === 'Login') {
        router.replace('/auth/login');
      }
    },
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace('/auth');
    },
  };

  return <RegisterScreen navigation={navigation} />;
}
