import React from 'react';
import { router } from 'expo-router';
import AuthSelectionScreen from '../../features/auth/screens/AuthSelectionScreen';

export default function AuthSelectionRoute() {
  const navigation = {
    navigate: (routeName) => {
      if (routeName === 'Register') {
        router.push('/auth/register');
        return;
      }

      router.push('/auth/login');
    },
  };

  return <AuthSelectionScreen navigation={navigation} />;
}
