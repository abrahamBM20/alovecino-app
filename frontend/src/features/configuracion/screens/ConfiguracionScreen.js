import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';
import { useConfiguracionForm } from '../hooks/useConfiguracionForm';
import { useAuthStore } from '../../../store/authStore';

const PRIMARY = '#044E81';
const MIN_KM = 0.5;
const MAX_KM = 10.0;
const STEP_KM = 0.5;
const THUMB_SIZE = 26;

const TAB_ITEMS = [
  { id: 'ubicacion', Component: BotonFiltro, route: '/home' },
  { id: 'inicio', Component: BotonInicio, route: '/home' },
  { id: 'configuracion', Component: BotonConfiguracion, route: '/home/configuracion' },
  { id: 'perfil', Component: BotonPerfil, route: '/home' },
];

function RadioSlider({ value, onValueChange }) {
  const trackWidthRef = useRef(1);
  const [trackWidth, setTrackWidth] = useState(1);
  const startPosRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onValueChange);

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onValueChange; }, [onValueChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const usable = Math.max(1, trackWidthRef.current - THUMB_SIZE);
        startPosRef.current = ((valueRef.current - MIN_KM) / (MAX_KM - MIN_KM)) * usable;
      },
      onPanResponderMove: (_, { dx }) => {
        const usable = Math.max(1, trackWidthRef.current - THUMB_SIZE);
        const newPos = Math.max(0, Math.min(usable, startPosRef.current + dx));
        const raw = (newPos / usable) * (MAX_KM - MIN_KM) + MIN_KM;
        const stepped = parseFloat((Math.round(raw / STEP_KM) * STEP_KM).toFixed(1));
        onChangeRef.current(Math.min(MAX_KM, Math.max(MIN_KM, stepped)));
      },
    })
  ).current;

  const usable = Math.max(1, trackWidth - THUMB_SIZE);
  const thumbLeft = ((value - MIN_KM) / (MAX_KM - MIN_KM)) * usable;
  const fillWidth = thumbLeft + THUMB_SIZE / 2;

  return (
    <View>
      <View
        style={styles.sliderContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          setTrackWidth(w);
        }}
      >
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: fillWidth }]} />
        </View>
        <View style={[styles.sliderThumb, { left: thumbLeft }]} {...panResponder.panHandlers} />
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelText}>{MIN_KM} km</Text>
        <Text style={styles.sliderValue}>{value.toFixed(1)} km</Text>
        <Text style={styles.sliderLabelText}>{MAX_KM} km</Text>
      </View>
    </View>
  );
}

function ToggleRow({ label, subtitle, value, onToggle }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {!!subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#b0c8e0', true: PRIMARY }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function ConfiguracionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { config, isLoading, isSaving, error, saveSuccess, updateField, save } = useConfiguracionForm();
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Configuración</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={PRIMARY} style={styles.loader} />
          ) : (
            <>
              {!!error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Section title="Notificaciones">
                <ToggleRow
                  label="Notificaciones push"
                  subtitle="Alertas en tu dispositivo"
                  value={config.notificacionesPush}
                  onToggle={(v) => updateField('notificacionesPush', v)}
                />
                <View style={styles.divider} />
                <ToggleRow
                  label="Notificaciones por email"
                  subtitle="Avisos en tu correo"
                  value={config.notificacionesEmail}
                  onToggle={(v) => updateField('notificacionesEmail', v)}
                />
                <View style={styles.divider} />
                <ToggleRow
                  label="Recibir ofertas"
                  subtitle="Promociones de negocios cercanos"
                  value={config.recibirOfertas}
                  onToggle={(v) => updateField('recibirOfertas', v)}
                />
              </Section>

              <Section title="Privacidad">
                <ToggleRow
                  label="Perfil visible"
                  subtitle="Otros usuarios pueden ver tu perfil"
                  value={config.perfilVisible}
                  onToggle={(v) => updateField('perfilVisible', v)}
                />
              </Section>

              <Section title="Radio de búsqueda">
                <Text style={styles.sliderDesc}>
                  Negocios dentro del radio seleccionado aparecerán en el mapa.
                </Text>
                <RadioSlider
                  value={config.radioOfertasKm}
                  onValueChange={(v) => updateField('radioOfertasKm', v)}
                />
              </Section>

              {saveSuccess && (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>Cambios guardados correctamente.</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={save}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Guardar configuración"
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                  loggingOut && styles.saveButtonDisabled,
                ]}
                onPress={handleLogout}
                disabled={loggingOut}
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
              >
                <Text style={styles.logoutButtonText}>
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        <View style={[styles.tabBar, { marginBottom: insets.bottom + 10 }]}>
          {TAB_ITEMS.map(({ id, Component, route }) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.75}
              onPress={() => router.push(route)}
            >
              <Component width={63} height={63} opacity={id === 'configuracion' ? 1 : 0.65} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 24,
  },
  loader: {
    marginTop: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#044e81',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#1a3550',
    fontWeight: '500',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#d8eef8',
  },
  sliderDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 18,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginBottom: 8,
  },
  sliderTrack: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    backgroundColor: '#b0c8e0',
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: PRIMARY,
    borderRadius: 2,
    marginLeft: -(THUMB_SIZE / 2),
  },
  sliderThumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#64748b',
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: PRIMARY,
    borderRadius: 28,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonPressed: {
    opacity: 0.86,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  logoutButton: {
    borderRadius: 28,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  logoutButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  tabBar: {
    height: 87,
    marginHorizontal: 18,
    backgroundColor: PRIMARY,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
