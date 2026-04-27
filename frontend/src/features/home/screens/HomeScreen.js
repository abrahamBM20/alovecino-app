import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import { useAuthStore } from '../../../store/authStore';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a AloVecino</Text>
        <Text style={styles.subtitle}>{user?.email || 'Sesion iniciada'}</Text>
        <View style={styles.actions}>
          <AppButton title="Cerrar sesion" onPress={logout} variant="secondary" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 10,
    textAlign: 'center',
  },
  actions: {
    marginTop: 28,
    width: '100%',
  },
});
