import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import { ASSETS } from '../../../shared/constants/assets';

export default function AuthSelectionScreen({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Image source={{ uri: ASSETS.logoCompact }} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo AloVecino" />
        <Text accessibilityRole="header" style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Selecciona como quieres continuar</Text>

        <View style={styles.actions}>
          <AppButton title="Iniciar sesion" onPress={() => navigation.navigate('Login')} accessibilityLabel="Ir a inicio de sesion" />
          <View style={styles.buttonGap} />
          <AppButton title="Crear cuenta" variant="secondary" onPress={() => navigation.navigate('Register')} accessibilityLabel="Ir a crear cuenta" />
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
  logo: {
    width: 240,
    height: 136,
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 360,
  },
  buttonGap: {
    height: 12,
  },
});
