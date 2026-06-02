import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../../store/authStore';
import PanelAlmaceneroScreen from '../../../../features/almacenero/screens/PanelAlmaceneroScreen';

export default function PanelAlmaceneroRoute() {
  const role = useAuthStore((state) => state.role);

  if (role !== 'ALMACEN') {
    return <Redirect href="/home" />;
  }

  return <PanelAlmaceneroScreen />;
}
