import React from 'react';
import { Controller } from 'react-hook-form';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import AppInput from '../../../shared/ui/AppInput';
import { ASSETS } from '../../../shared/constants/assets';
import { useLoginForm } from '../hooks/useLoginForm';

export default function LoginScreen({ navigation }) {
  const { control, errors, isLoading, authError, onSubmit, canSubmit } = useLoginForm();

  return (
    <ScreenContainer scroll keyboard>
      <View style={styles.container}>
        <Image source={{ uri: ASSETS.logoCompact }} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo AloVecino" />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {!!authError && <Text style={styles.authError}>{authError}</Text>}

        <View style={styles.actions}>
          <AppButton
            title={isLoading ? 'Ingresando...' : 'Entrar'}
            onPress={onSubmit}
            disabled={!canSubmit}
            accessibilityLabel="Iniciar sesion"
          />
        </View>

        <Pressable accessibilityRole="button" onPress={() => {}} style={styles.linkButton}>
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.linkText}>Volver</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingTop: 30,
  },
  logo: {
    width: 220,
    height: 126,
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    marginTop: 6,
  },
  linkButton: {
    marginTop: 12,
    minHeight: 28,
    justifyContent: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  authError: {
    color: '#fee2e2',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    width: '100%',
  },
});
