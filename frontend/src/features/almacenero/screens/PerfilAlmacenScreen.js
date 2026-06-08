import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { fetchAlmacenPerfil, fetchMisAlmacenes, updateAlmacenPerfil } from '../services/almacenService';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#0F2D45';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const SURFACE = 'rgba(255,255,255,0.97)';
const BORDER = '#E0EEF6';

const CARD_SHADOW = {
  shadowColor: '#0A2540',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 4,
};

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={PRIMARY} />
      </View>
      <View style={styles.infoTexts}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'No informado'}</Text>
      </View>
    </View>
  );
}

function buildForm(almacen) {
  return {
    nombre: almacen?.nombre ?? '',
    telefono: almacen?.telefono ?? '',
    calle: almacen?.calle ?? '',
    numero: almacen?.numero ?? '',
    comuna: almacen?.comuna ?? '',
    region: almacen?.region ?? '',
    codigoPostal: almacen?.codigoPostal ?? '',
  };
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT_MUTED}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function PerfilAlmacenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);
  const [almacen, setAlmacen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState(buildForm(null));

  const loadPerfil = useCallback(async () => {
    setError(null);
    const almacenes = await fetchMisAlmacenes();
    const principal = almacenes[0] ?? null;

    if (!principal) {
      setAlmacen(null);
      return;
    }

    const detalle = await fetchAlmacenPerfil(principal.id);
    const nextAlmacen = detalle ?? principal;
    setAlmacen(nextAlmacen);
    setForm(buildForm(nextAlmacen));
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    loadPerfil()
      .catch(() => {
        if (mounted) setError('No pudimos cargar el perfil del almacén.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadPerfil]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPerfil();
    } catch {
      setError('No pudimos actualizar el perfil del almacén.');
    } finally {
      setRefreshing(false);
    }
  }, [loadPerfil]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  }, []);

  const startEditing = useCallback(() => {
    setForm(buildForm(almacen));
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  }, [almacen]);

  const cancelEditing = useCallback(() => {
    setForm(buildForm(almacen));
    setIsEditing(false);
    setSaveError(null);
  }, [almacen]);

  const savePerfil = useCallback(async () => {
    if (!almacen?.id) return;

    const required = ['nombre', 'telefono', 'calle', 'numero', 'comuna', 'region'];
    if (required.some((field) => !String(form[field] ?? '').trim())) {
      setSaveError('Completa nombre, teléfono y dirección del almacén.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const actualizado = await updateAlmacenPerfil(almacen.id, {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        direccion: {
          calle: form.calle.trim(),
          numero: form.numero.trim(),
          comuna: form.comuna.trim(),
          region: form.region.trim(),
          codigoPostal: form.codigoPostal?.trim() || null,
        },
      });
      setAlmacen(actualizado);
      setForm(buildForm(actualizado));
      setIsEditing(false);
      setSaveSuccess(true);
    } catch {
      setSaveError('No pudimos guardar los cambios del almacén.');
    } finally {
      setIsSaving(false);
    }
  }, [almacen?.id, form]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/auth/login');
  }, [logout, router]);

  const estadoPerfil = almacen?.estado ?? 'Sin estado';
  const estadoActivo = ['ACTIVO', 'APROBADO', 'HABILITADO'].includes(String(estadoPerfil).toUpperCase());
  const coordenadas = almacen?.latitud && almacen?.longitud
    ? `${almacen.latitud}, ${almacen.longitud}`
    : null;

  return (
    <LinearGradient
      colors={['#E5F2F9', '#7AAEC8', PRIMARY]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Ionicons name="chevron-back" size={26} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Perfil del almacén</Text>
            <Text style={styles.headerSubtitle}>Datos visibles y operativos</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
        >
          {isLoading && (
            <View style={styles.messageCard}>
              <ActivityIndicator color={PRIMARY} />
              <Text style={styles.messageText}>Cargando perfil real...</Text>
            </View>
          )}

          {!!error && (
            <TouchableOpacity style={styles.messageCard} onPress={onRefresh} activeOpacity={0.8}>
              <Ionicons name="alert-circle-outline" size={22} color="#B91C1C" />
              <Text style={styles.messageText}>{error} Toca para reintentar.</Text>
            </TouchableOpacity>
          )}

          {!isLoading && !error && !almacen && (
            <View style={styles.messageCard}>
              <Ionicons name="storefront-outline" size={24} color={TEXT_MUTED} />
              <Text style={styles.messageText}>No encontramos un almacén asociado a tu usuario.</Text>
            </View>
          )}

          {!!almacen && (
            <>
              <View style={styles.heroCard}>
                <View style={styles.logoWrap}>
                  {almacen.imagenUrl ? (
                    <Image source={{ uri: almacen.imagenUrl }} style={styles.logo} resizeMode="cover" />
                  ) : (
                    <Ionicons name="storefront-outline" size={42} color={TEXT_MUTED} />
                  )}
                </View>
                <View style={styles.heroTexts}>
                  <Text style={styles.nombre}>{almacen.nombre || 'Almacén'}</Text>
                  <View style={styles.estadoRow}>
                    <View
                      style={[
                        styles.estadoDot,
                        { backgroundColor: estadoActivo ? '#22C55E' : '#F59E0B' },
                      ]}
                    />
                    <Text style={styles.estadoText}>{estadoPerfil}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información</Text>
                <InfoRow icon="location-outline" label="Dirección" value={almacen.direccion} />
                <InfoRow icon="map-outline" label="Comuna y región" value={[almacen.comuna, almacen.region].filter(Boolean).join(', ')} />
                <InfoRow icon="call-outline" label="Teléfono principal" value={almacen.telefono} />
                <InfoRow icon="navigate-outline" label="Coordenadas" value={coordenadas} />
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Configuración</Text>
                  {!isEditing && (
                    <TouchableOpacity
                      style={styles.iconAction}
                      activeOpacity={0.8}
                      onPress={startEditing}
                      accessibilityRole="button"
                      accessibilityLabel="Editar datos del almacén"
                    >
                      <Ionicons name="create-outline" size={18} color={PRIMARY} />
                    </TouchableOpacity>
                  )}
                </View>

                {!isEditing ? (
                  <Text style={styles.helpText}>Mantén actualizados los datos visibles para clientes.</Text>
                ) : (
                  <View style={styles.form}>
                    <Field label="Nombre del almacén" value={form.nombre} onChangeText={(v) => updateField('nombre', v)} placeholder="Nombre comercial" />
                    <Field label="Teléfono principal" value={form.telefono} onChangeText={(v) => updateField('telefono', v)} placeholder="+56 9 1234 5678" keyboardType="phone-pad" />
                    <Field label="Calle" value={form.calle} onChangeText={(v) => updateField('calle', v)} placeholder="Calle o avenida" />
                    <Field label="Número" value={form.numero} onChangeText={(v) => updateField('numero', v)} placeholder="1234" />
                    <Field label="Comuna" value={form.comuna} onChangeText={(v) => updateField('comuna', v)} placeholder="Peñalolén" />
                    <Field label="Región" value={form.region} onChangeText={(v) => updateField('region', v)} placeholder="Metropolitana de Santiago" />
                    <Field label="Código postal" value={form.codigoPostal} onChangeText={(v) => updateField('codigoPostal', v)} placeholder="Opcional" keyboardType="number-pad" />

                    {!!saveError && <Text style={styles.errorText}>{saveError}</Text>}

                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[styles.secondaryBtn, isSaving && styles.disabledBtn]}
                        activeOpacity={0.85}
                        onPress={cancelEditing}
                        disabled={isSaving}
                      >
                        <Text style={styles.secondaryBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveBtn, isSaving && styles.disabledBtn]}
                        activeOpacity={0.85}
                        onPress={savePerfil}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="save-outline" size={18} color="#fff" />
                            <Text style={styles.saveBtnText}>Guardar cambios</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {saveSuccess && !isEditing && (
                  <Text style={styles.successText}>Datos del almacén actualizados.</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/home/almacenero/bandeja')}
                accessibilityRole="button"
                accessibilityLabel="Ir a la bandeja de consultas"
              >
                <Ionicons name="mail-outline" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Ver bandeja de consultas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                activeOpacity={0.85}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
              >
                <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
                <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    ...CARD_SHADOW,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    ...CARD_SHADOW,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#E8F1F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 76,
    height: 76,
  },
  heroTexts: { flex: 1 },
  nombre: {
    fontSize: 21,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  estadoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  estadoText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  section: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    ...CARD_SHADOW,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  sectionHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1F8',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SECONDARY,
  },
  form: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_SECONDARY,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },
  successText: {
    marginTop: 12,
    color: '#166534',
    fontSize: 13,
    fontWeight: '800',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryBtnText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 1.35,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledBtn: {
    opacity: 0.65,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1F8',
  },
  infoTexts: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    lineHeight: 20,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...CARD_SHADOW,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '800',
  },
});
