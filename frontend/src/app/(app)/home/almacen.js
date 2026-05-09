import React from 'react';
import { Redirect } from 'expo-router';
import AlmacenRegisterScreen from '../../../features/almacenes/screens/AlmacenRegisterScreen';
import { useAuthStore } from '../../../store/authStore';

export default function AlmacenRoute() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  return <AlmacenRegisterScreen />;
}
