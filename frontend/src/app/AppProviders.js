import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from '../navigation/RootNavigator';
import AppErrorBoundary from './AppErrorBoundary';

export default function AppProviders() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <RootNavigator />
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
