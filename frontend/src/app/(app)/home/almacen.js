import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

export default function AlmacenRoute() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/home" />;
}
