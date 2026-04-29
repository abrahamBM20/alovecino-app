import React from 'react';
import { Redirect } from 'expo-router';
import HomeScreen from '../../features/home/screens/HomeScreen';
import { useAuthStore } from '../../store/authStore';

export default function HomeRoute() {
  const status = useAuthStore((state) => state.status);

  if (status !== 'authenticated') {
    return <Redirect href="/auth" />;
  }

  return <HomeScreen />;
}
