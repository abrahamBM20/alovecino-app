import React from 'react';
import RootNavigator from '../navigation/RootNavigator';
import AppErrorBoundary from './AppErrorBoundary';

export default function AppProviders() {
  return (
    <AppErrorBoundary>
      <RootNavigator />
    </AppErrorBoundary>
  );
}
