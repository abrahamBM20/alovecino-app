import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import HomeScreen from '../../../features/home/screens/HomeScreen';

export default function HomeRoute() {
  const role = useAuthStore((state) => state.role);

  if (role === 'ALMACEN') {
    return <Redirect href="/home/almacenero" />;
  }

  return <HomeScreen />;
}
