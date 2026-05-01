import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppErrorBoundary from '../providers/AppErrorBoundary';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="light" />
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
