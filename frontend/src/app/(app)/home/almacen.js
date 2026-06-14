import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

export default function AlmacenRoute() {
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  if (role !== 'ALMACEN') {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/home/almacenero" />;
}
