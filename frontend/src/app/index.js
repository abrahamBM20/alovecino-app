import React, { useEffect } from 'react';
import { router } from 'expo-router';
import SplashScreen from '../features/auth/screens/SplashScreen';
import { useAuthStore } from '../store/authStore';

export default function SplashRoute() {
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status !== 'authenticated') {
        router.replace('/auth');
      } else {
        router.replace(role === 'ALMACEN' ? '/home/almacenero' : '/home');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [status, role]);

  return <SplashScreen />;
}
