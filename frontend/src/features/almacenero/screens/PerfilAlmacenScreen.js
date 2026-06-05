import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchAlmacenPerfil, fetchMisAlmacenes } from '../services/almacenService';

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

export default function PerfilAlmacenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [almacen, setAlmacen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPerfil = useCallback(async () => {
    setError(null);
    const almacenes = await fetchMisAlmacenes();
    const principal = almacenes[0] ?? null;

    if (!principal) {
      setAlmacen(null);
      return;
    }

    const detalle = await fetchAlmacenPerfil(principal.id);
    setAlmacen(detalle ?? principal);
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
});
