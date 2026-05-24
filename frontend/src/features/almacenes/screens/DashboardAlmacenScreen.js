import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import EstadoNegocioToggle from '../components/EstadoNegocioToggle';
import MetricaIndicador from '../components/MetricaIndicador';
import ConsultasRecientesCard from '../components/ConsultasRecientesCard';
import NotificationBadge from '../components/NotificationBadge';
import { useAlmacenDashboard } from '../hooks/useAlmacenDashboard';

const PRIMARY = '#044E81';

export default function DashboardAlmacenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    almacenActual,
    consultasRecientes,
    estadisticas,
    isLoading,
    error,
    refreshing,
    onRefresh,
    cambiarEstado,
  } = useAlmacenDashboard();

  const handleConsultaPress = useCallback((consulta) => {
    // Navegar a detalle de consulta o abrir modal
    // Por ahora mostramos un toast o navegamos
    router.push({
      pathname: '/almacen/consulta/[id]',
      params: { id: consulta.idConsulta },
    });
  }, [router]);

  const handleNavigateToChat = useCallback(() => {
    router.push('/chat');
  }, [router]);

  const handleNavigateToProfile = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleNavigateToHistory = useCallback(() => {
    router.push('/almacen/historial');
  }, [router]);

  if (isLoading && !almacenActual) {
    return (
      <LinearGradient
        colors={['#ffffff', '#044e81']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>
            Cargando dashboard...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error && !almacenActual) {
    return (
      <LinearGradient
        colors={['#ffffff', '#e8f4f8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <ScreenContainer>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Panel almacén</Text>
              <Text style={styles.almacenName}>Hola, {almacenActual?.nombre || 'Mi Almacén'}!</Text>
            </View>
            <TouchableOpacity
              onPress={handleNavigateToProfile}
              style={styles.profileButton}
            >
              <Ionicons name="person-circle" size={40} color="#ffffff" />
              <View style={styles.badgeProfile}>
                <NotificationBadge count={estadisticas?.consultasPendientes} size="small" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Estado del Negocio */}
          <EstadoNegocioToggle
            estado={almacenActual?.estado}
            nombre={almacenActual?.nombre}
            onEstadoChange={cambiarEstado}
            isLoading={isLoading}
          />

          {/* Indicadores de Rendimiento */}
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Indicadores</Text>
            <View style={styles.metricsGrid}>
              <MetricaIndicador
                titulo="Consultas hoy"
                valor={estadisticas?.consultasHoy || 0}
                icono="chatbubbles-outline"
                color="#3b82f6"
              />
              <MetricaIndicador
                titulo="Pendientes"
                valor={estadisticas?.consultasPendientes || 0}
                icono="time-outline"
                color="#f59e0b"
              />
            </View>
            <View style={styles.metricsGrid}>
              <MetricaIndicador
                titulo="Respondidas"
                valor={estadisticas?.consultasRespondidas || 0}
                icono="checkmark-circle-outline"
                color="#10b981"
              />
              <MetricaIndicador
                titulo="Tiempo promedio"
                valor={
                  estadisticas?.tiempoPromedioRespuestaMinutos?.toFixed(0) || 0
                }
                unidad="min"
                icono="timer-outline"
                color="#8b5cf6"
              />
            </View>
          </View>

          {/* Consultas Recientes */}
          <View style={styles.consultasSection}>
            <View style={styles.consultasHeader}>
              <Text style={styles.sectionTitle}>Consultas recientes</Text>
              <NotificationBadge
                count={estadisticas?.consultasPendientes}
                size="medium"
              />
            </View>
          </View>
          <ConsultasRecientesCard
            consultas={consultasRecientes}
            isLoading={isLoading}
            onConsultaPress={handleConsultaPress}
          />

          {/* Navegación rápida */}
          <View style={styles.quickNavSection}>
            <Text style={styles.sectionTitle}>Acciones rápidas</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNavigateToChat}
              >
                <Ionicons name="chatbubbles-outline" size={24} color={PRIMARY} />
                <Text style={styles.navButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNavigateToHistory}
              >
                <Ionicons name="list-outline" size={24} color={PRIMARY} />
                <Text style={styles.navButtonText}>Historial</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ScreenContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#1f2937',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  greeting: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  almacenName: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  badgeProfile: {
    position: 'absolute',
    right: -8,
    top: -8,
  },
  metricsSection: {
    marginVertical: 12,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  consultasSection: {
    marginVertical: 12,
  },
  consultasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickNavSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
