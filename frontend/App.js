import { StatusBar } from 'expo-status-bar';
import AppProviders from './src/app/AppProviders';

export default function App() {
  return (
    <>
      <AppProviders />
      <StatusBar style="light" />
    </>
  );
}
