import React from 'react';
import { router } from 'expo-router';
import LoginScreen from '../../../features/auth/screens/LoginScreen';

export default function LoginRoute() {
  const navigation = {
    goBack: () => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace('/auth');
    },
  };

  return <LoginScreen navigation={navigation} />;
}
