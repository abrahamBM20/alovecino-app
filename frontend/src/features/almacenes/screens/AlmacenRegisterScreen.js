import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import AppButton from '../../../shared/ui/AppButton';
import AppInput from '../../../shared/ui/AppInput';
import { useAlmacenForm } from '../hooks/useAlmacenForm';

export default function AlmacenRegisterScreen() {
  const {
    control,
    errors,
    isLoading,
    submitError,
    createdAlmacen,
    onSubmit,
    canSubmit,
    goBack,
  } = useAlmacenForm();

  return (
    <ScreenContainer scroll keyboard>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>
          Registrar almacén
        </Text>
        <Text style={styles.subtitle}>
          Tu solicitud quedará pendiente de revisión.
        </Text>

        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Nombre del almacén"
              autoCapitalize="words"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.nombre?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="calle"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Calle"
              autoCapitalize="words"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.calle?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="numero"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Número"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.numero?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="comuna"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Comuna"
              autoCapitalize="words"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.comuna?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="region"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Región"
              autoCapitalize="words"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.region?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="codigoPostal"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Código postal"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.codigoPostal?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="telefono"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Teléfono"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.telefono?.message}
            />
          )}
        />

        {!!submitError && <Text style={styles.errorText}>{submitError}</Text>}
        {!!createdAlmacen && (
          <Text style={styles.successText}>
            Almacén registrado con estado {createdAlmacen.estado}.
          </Text>
        )}

        <View style={styles.actions}>
          <AppButton
            title={isLoading ? 'Registrando...' : 'Registrar almacén'}
            onPress={onSubmit}
            disabled={!canSubmit}
          />
          <View style={styles.secondaryAction}>
            <AppButton title="Volver" onPress={goBack} variant="secondary" />
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={goBack} style={styles.linkButton}>
          <Text style={styles.linkText}>Ir al inicio</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 10,
  },
  secondaryAction: {
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
  errorText: {
    color: '#fee2e2',
    fontSize: 12,
    marginTop: 4,
    width: '100%',
  },
  successText: {
    color: '#dcfce7',
    fontSize: 13,
    marginTop: 6,
    width: '100%',
    textAlign: 'center',
  },
});
