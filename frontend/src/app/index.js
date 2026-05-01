import React, { useEffect } from 'react';
import { router } from 'expo-router';
import SplashScreen from '../features/auth/screens/SplashScreen';
import { useAuthStore } from '../store/authStore';

export default function SplashRoute() {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace(status === 'authenticated' ? '/home' : '/auth');
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [status]);

  return <SplashScreen />;
}
