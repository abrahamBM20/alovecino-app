import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';

export default function HomeLayout() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, backgroundColor: 'transparent' },
        animation: 'none',
      }}
    />
  );
}
