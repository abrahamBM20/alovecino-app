import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import HomeScreen from '../../../features/home/screens/HomeScreen';

export default function HomeRoute() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  if (user?.rol === 'ALMACEN') {
    return <Redirect href="/home/dashboard-almacen" />;
  }

  return <HomeScreen />;
}
