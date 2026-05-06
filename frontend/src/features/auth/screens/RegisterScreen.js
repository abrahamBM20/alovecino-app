import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import AppInput from '../../../shared/ui/AppInput';
import { useRegisterForm } from '../hooks/useRegisterForm';

const USER_TYPES = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'almacen', label: 'Almacén' },
];

function formatDate(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function RegisterScreen({ navigation }) {
  const { control, errors, isLoading, registerError, onSubmit, canSubmit } = useRegisterForm(navigation);

  return (
    <ScreenContainer scroll keyboard>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>
          Crear cuenta
        </Text>

        <Controller
          control={control}
          name="tipoUsuario"
          render={({ field: { onChange, value } }) => (
            <View style={styles.segmentWrapper}>
              <Text style={styles.segmentLabel}>Tipo de usuario</Text>
              <View style={styles.segmentControl}>
                {USER_TYPES.map((option) => {
                  const selected = value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onChange(option.value)}
                      style={[styles.segmentOption, selected ? styles.segmentOptionSelected : null]}
                    >
                      <Text style={[styles.segmentText, selected ? styles.segmentTextSelected : null]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!!errors.tipoUsuario?.message && (
                <Text style={styles.errorText}>{errors.tipoUsuario.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="nombreCompleto"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
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
            <AppInput
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

        <Controller
          control={control}
          name="confirmarPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Confirmar contraseña"
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
    marginBottom: 18,
    textAlign: 'center',
  },
  segmentWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  segmentLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 8,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 22,
    padding: 4,
  },
  segmentOption: {
    flex: 1,
    minHeight: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  segmentOptionSelected: {
    backgroundColor: '#044e81',
  },
  segmentText: {
    color: '#044e81',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: '#ffffff',
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
