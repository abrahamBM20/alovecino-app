import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

export default function AlmacenRoute() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  // Si es almacenero, ir al dashboard del almacén
  if (user?.rol === 'ALMACEN') {
    return <Redirect href="/home/dashboard-almacen" />;
  }

  // Si es cliente, ir a la pantalla de inicio normal
  return <Redirect href="/home" />;
}
