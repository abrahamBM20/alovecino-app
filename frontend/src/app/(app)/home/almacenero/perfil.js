import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../../store/authStore';
import PerfilAlmacenScreen from '../../../../features/almacenero/screens/PerfilAlmacenScreen';

export default function PerfilAlmacenRoute() {
  const role = useAuthStore((state) => state.role);

  if (role !== 'ALMACEN') {
    return <Redirect href="/home" />;
  }

  return <PerfilAlmacenScreen />;
}
