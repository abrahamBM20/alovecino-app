import React from 'react';
import { Redirect } from 'expo-router';
import DashboardAlmacenScreen from '../../../features/almacenes/screens/DashboardAlmacenScreen';
import { useAuthStore } from '../../../store/authStore';

export default function DashboardAlmacenRoute() {
  const user = useAuthStore((state) => state.user);

  // Solo almaceneros pueden acceder a este dashboard
  if (user?.rol?.toUpperCase() !== 'ALMACEN') {
    return <Redirect href="/home" />;
  }

  return <DashboardAlmacenScreen />;
}
