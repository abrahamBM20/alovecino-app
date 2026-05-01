import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import { useRegisterForm } from '../hooks/useRegisterForm';

function formatDate(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function FieldInput({ label, error, ...props }) {
  return (
    <View style={styles.fieldWrapper}>
      <View style={[styles.fieldContainer, error ? styles.fieldError : null]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor="#9ca3af"
          {...props}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { control, errors, isLoading, registerError, onSubmit, canSubmit } = useRegisterForm(navigation);

  return (
    <ScreenContainer scroll keyboard>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>
          Crear Cuenta
        </Text>

        <Controller
          control={control}
          name="nombreCompleto"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Nombre completo"
              autoCapitalize="words"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nombreCompleto?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="fechaNacimiento"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Fecha de nacimiento"
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(formatDate(text))}
              value={value}
              error={errors.fechaNacimiento?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="nombreUsuario"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Nombre de usuario"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nombreUsuario?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Correo electronico"
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
            <FieldInput
              label="Contrasena"
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

        <Controller
          control={control}
          name="confirmarPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Confirmar contrasena"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmarPassword?.message}
            />
          )}
        />

        {!!registerError && <Text style={styles.errorText}>{registerError}</Text>}

        <View style={styles.actions}>
          <AppButton
            title={isLoading ? 'Creando cuenta...' : 'REGISTRARSE'}
            onPress={onSubmit}
            disabled={!canSubmit}
            accessibilityLabel="Crear cuenta"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
        >
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
  title: {
    color: '#044E81',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  fieldContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  fieldError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  fieldLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldInput: {
    color: '#0f172a',
    fontSize: 15,
    paddingVertical: 2,
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  actions: {
    width: '100%',
    marginTop: 10,
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
});
