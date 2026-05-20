import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useValoracion } from '../hooks/useValoracion';

const PRIMARY = '#044E81';
const STAR_FILLED = '★';
const STAR_EMPTY = '☆';

function StarDisplay({ value }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={[styles.starIcon, n <= value && styles.starFilled]}>
          {n <= value ? STAR_FILLED : STAR_EMPTY}
        </Text>
      ))}
    </View>
  );
}

function ValoracionCard({ item }) {
  const fecha = item.fechaCreacion
    ? new Date(item.fechaCreacion).toLocaleDateString('es-CL')
    : '';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <StarDisplay value={item.cantidadEstrellas} />
        <Text style={styles.cardFecha}>{fecha}</Text>
      </View>
      {!!item.contenido && <Text style={styles.cardContenido}>{item.contenido}</Text>}
    </View>
  );
}

export default function NegocioDetailScreen({ id, nombre, comuna, region, distancia }) {
  const router = useRouter();
  const { valoraciones, isLoading, error, promedio } = useValoracion(id);

  const distanceLabel = distancia ? `${distancia} m de tu ubicación` : null;

  return (
    <LinearGradient colors={['#ffffff', '#044e81']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.almacenHeader}>
            <Text style={styles.almacenNombre}>{nombre || 'Detalle del Negocio'}</Text>
            {!!comuna && (
              <Text style={styles.almacenInfo}>{comuna}{region ? `, ${region}` : ''}</Text>
            )}
            {!!distanceLabel && <Text style={styles.almacenDistancia}>{distanceLabel}</Text>}
            {promedio !== null && (
              <View style={styles.promedioRow}>
                <Text style={styles.promedioValor}>{promedio}</Text>
                <Text style={styles.promedioStar}> {STAR_FILLED}</Text>
                <Text style={styles.promedioTotal}>
                  {' '}({valoraciones.length} valoración{valoraciones.length !== 1 ? 'es' : ''})
                </Text>
              </View>
            )}
          </View>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Valoraciones ({valoraciones.length})</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={PRIMARY} style={styles.loader} />
            ) : valoraciones.length === 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.emptyText}>Aún no hay valoraciones para este almacén.</Text>
              </View>
            ) : (
              valoraciones.map((v) => <ValoracionCard key={v.idValoracion} item={v} />)
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  backButton: { marginTop: 8, marginBottom: 20 },
  backText: { color: PRIMARY, fontSize: 16, fontWeight: '500' },
  almacenHeader: { marginBottom: 20 },
  almacenNombre: { fontSize: 26, fontWeight: '700', color: PRIMARY, marginBottom: 4 },
  almacenInfo: { fontSize: 14, color: '#555', marginBottom: 2 },
  almacenDistancia: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  promedioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  promedioValor: { fontSize: 18, fontWeight: '700', color: PRIMARY },
  promedioStar: { fontSize: 18, color: '#f59e0b' },
  promedioTotal: { fontSize: 13, color: '#64748b' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardFecha: { fontSize: 12, color: '#94a3b8' },
  cardContenido: { fontSize: 14, color: '#1a3550', lineHeight: 20 },
  starRow: { flexDirection: 'row' },
  starIcon: { fontSize: 18, color: '#b0c8e0', marginRight: 2 },
  starFilled: { color: '#f59e0b' },
  loader: { marginVertical: 20 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingVertical: 8 },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorBannerText: { color: '#dc2626', fontSize: 13 },
});
