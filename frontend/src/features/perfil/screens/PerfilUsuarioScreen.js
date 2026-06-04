import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

import BotonFiltro from '../../../../assets/boton_filtro.svg';
import BotonInicio from '../../../../assets/boton_inicio.svg';
import BotonConfiguracion from '../../../../assets/boton_configuracion.svg';
import BotonPerfil from '../../../../assets/boton_perfil.svg';
import { useAuthStore } from '../../../store/authStore';
import { getPerfilUsuario, updatePerfilUsuario } from '../services/perfilService';
import { mapApiError } from '../../../shared/api/errorMapper';

const PRIMARY = '#044E81';
const TEXT_PRIMARY = '#1a3550';
const TEXT_SECONDARY = '#4A6580';
const TEXT_MUTED = '#8FA3B3';
const BORDER = '#d8eef8';

const TAB_ITEMS = [
  { id: 'ubicacion', Component: BotonFiltro, route: '/home' },
  { id: 'inicio', Component: BotonInicio, route: '/home' },
  { id: 'configuracion', Component: BotonConfiguracion, route: '/home/configuracion' },
  { id: 'perfil', Component: BotonPerfil, route: '/home/perfil' },
];

function AvatarCircle({ nombre, fotoUrl, size = 90 }) {
  const iniciales = (nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

  if (fotoUrl) {
    return (
      <Image
        source={{ uri: fotoUrl }}
        style={[styles.avatarImg, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarIniciales, { fontSize: size * 0.36 }]}>{iniciales}</Text>
    </View>
  );
}

function CampoInfo({ icono, etiqueta, valor }) {
  if (!valor) return null;
  return (
    <View style={styles.campoRow}>
      <View style={styles.campoIcono}>
        <Ionicons name={icono} size={18} color={PRIMARY} />
      </View>
      <View style={styles.campoTextos}>
        <Text style={styles.campoEtiqueta}>{etiqueta}</Text>
        <Text style={styles.campoValor}>{valor}</Text>
      </View>
    </View>
  );
}

function CampoEditable({ icono, etiqueta, value, onChangeText, keyboardType, placeholder }) {
  return (
    <View style={styles.campoRow}>
      <View style={styles.campoIcono}>
        <Ionicons name={icono} size={18} color={PRIMARY} />
      </View>
      <View style={styles.campoTextos}>
        <Text style={styles.campoEtiqueta}>{etiqueta}</Text>
        <TextInput
          style={styles.campoInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          placeholder={placeholder || ''}
          placeholderTextColor={TEXT_MUTED}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

function Seccion({ titulo, children }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      <View style={styles.seccionCard}>{children}</View>
    </View>
  );
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const [year, month, day] = (fechaStr || '').split('-');
  if (!day) return fechaStr;
  return `${day}/${month}/${year}`;
}

function isoDesdeFormato(fechaDD) {
  if (!fechaDD) return null;
  const [day, month, year] = fechaDD.split('/');
  if (!year) return null;
  return `${year}-${month}-${day}`;
}

function formatearDireccion(dir) {
  if (!dir) return null;
  return [
    dir.calle && dir.numero ? `${dir.calle} ${dir.numero}` : dir.calle,
    dir.comuna,
    dir.region,
  ]
    .filter(Boolean)
    .join(', ');
}

function formatearFechaInput(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function PerfilUsuarioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exitoGuardado, setExitoGuardado] = useState(false);

  const [campos, setCampos] = useState({
    correo: '',
    fechaNacimiento: '',
    calle: '',
    numero: '',
    comuna: '',
    region: '',
    codigoPostal: '',
  });
  const [originales, setOriginales] = useState(null);

  useEffect(() => {
    if (!user?.id) { setCargando(false); return; }
    (async () => {
      try {
        const data = await getPerfilUsuario(user.id);
        setPerfil(data);
        const vals = {
          correo: data.correo ?? '',
          fechaNacimiento: formatearFecha(data.cliente?.fechaNacimiento),
          calle: data.cliente?.direccion?.calle ?? '',
          numero: data.cliente?.direccion?.numero ?? '',
          comuna: data.cliente?.direccion?.comuna ?? '',
          region: data.cliente?.direccion?.region ?? '',
          codigoPostal: data.cliente?.direccion?.codigoPostal ?? '',
        };
        setCampos(vals);
        setOriginales(vals);
      } catch (e) {
        setError(mapApiError(e));
      } finally {
        setCargando(false);
      }
    })();
  }, [user?.id]);

  const hayCambios = originales
    ? Object.keys(campos).some((k) => campos[k] !== originales[k])
    : false;

  const actualizarCampo = (campo, valor) => {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
    setExitoGuardado(false);
  };

  const cancelarEdicion = () => {
    setCampos(originales);
    setModoEdicion(false);
    setExitoGuardado(false);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const payload = {
        correo: campos.correo,
        fechaNacimiento: isoDesdeFormato(campos.fechaNacimiento),
        direccion: {
          calle: campos.calle,
          numero: campos.numero,
          comuna: campos.comuna,
          region: campos.region,
          codigoPostal: campos.codigoPostal || null,
        },
      };
      await updatePerfilUsuario(user.id, payload);
      setOriginales(campos);
      setModoEdicion(false);
      setExitoGuardado(true);
    } catch (e) {
      setError(mapApiError(e));
    } finally {
      setGuardando(false);
    }
  };

  const nombre = perfil?.nombre ?? user?.name ?? '';
  const nombreUsuario = perfil?.nombreUsuario ?? null;
  const rut = perfil?.rut ?? null;
  const rol = perfil?.nombreRol ?? null;
  const fotoPerfil = perfil?.fotoPerfil ?? null;
  const tieneCliente = !!perfil?.cliente;

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + 110 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título + botón cancelar en edición */}
            <View style={styles.headerRow}>
              <Text style={styles.tituloPagina}>Mi Perfil</Text>
              {modoEdicion && (
                <TouchableOpacity onPress={cancelarEdicion} style={styles.cancelarBtn}>
                  <Text style={styles.cancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>

            {cargando ? (
              <ActivityIndicator size="large" color={PRIMARY} style={styles.loader} />
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            ) : (
              <>
                {/* Avatar */}
                <View style={styles.avatarSeccion}>
                  <AvatarCircle nombre={nombre} fotoUrl={fotoPerfil} size={90} />
                  <Text style={styles.nombreTexto}>{nombre}</Text>
                  {!!nombreUsuario && (
                    <Text style={styles.usernameTexto}>@{nombreUsuario}</Text>
                  )}
                  {!!rol && (
                    <View style={styles.rolBadge}>
                      <Text style={styles.rolTexto}>{rol}</Text>
                    </View>
                  )}
                </View>

                {/* Datos personales */}
                <Seccion titulo="Datos personales">
                  <CampoInfo icono="card-outline" etiqueta="RUT" valor={rut} />
                  {rut && <Separador />}
                  {modoEdicion ? (
                    <CampoEditable
                      icono="mail-outline"
                      etiqueta="Correo"
                      value={campos.correo}
                      onChangeText={(v) => actualizarCampo('correo', v)}
                      keyboardType="email-address"
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <CampoInfo icono="mail-outline" etiqueta="Correo" valor={campos.correo} />
                  )}
                </Seccion>

                {/* Cuenta (cliente) */}
                {tieneCliente && (
                  <Seccion titulo="Cuenta">
                    {modoEdicion ? (
                      <CampoEditable
                        icono="calendar-outline"
                        etiqueta="Fecha de nacimiento"
                        value={campos.fechaNacimiento}
                        onChangeText={(v) => actualizarCampo('fechaNacimiento', formatearFechaInput(v))}
                        keyboardType="numeric"
                        placeholder="DD/MM/AAAA"
                      />
                    ) : (
                      <CampoInfo
                        icono="calendar-outline"
                        etiqueta="Fecha de nacimiento"
                        valor={campos.fechaNacimiento}
                      />
                    )}
                    <Separador />
                    <CampoInfo
                      icono="checkmark-circle-outline"
                      etiqueta="Estado"
                      valor={perfil?.cliente?.estadoCuenta?.nombre}
                    />
                    <Separador />
                    {modoEdicion ? (
                      <>
                        <CampoEditable
                          icono="location-outline"
                          etiqueta="Calle"
                          value={campos.calle}
                          onChangeText={(v) => actualizarCampo('calle', v)}
                          placeholder="Calle"
                        />
                        <Separador />
                        <CampoEditable
                          icono="home-outline"
                          etiqueta="Número"
                          value={campos.numero}
                          onChangeText={(v) => actualizarCampo('numero', v)}
                          placeholder="Número"
                        />
                        <Separador />
                        <CampoEditable
                          icono="business-outline"
                          etiqueta="Comuna"
                          value={campos.comuna}
                          onChangeText={(v) => actualizarCampo('comuna', v)}
                          placeholder="Comuna"
                        />
                        <Separador />
                        <CampoEditable
                          icono="map-outline"
                          etiqueta="Región"
                          value={campos.region}
                          onChangeText={(v) => actualizarCampo('region', v)}
                          placeholder="Región"
                        />
                        <Separador />
                        <CampoEditable
                          icono="mail-open-outline"
                          etiqueta="Código postal"
                          value={campos.codigoPostal}
                          onChangeText={(v) => actualizarCampo('codigoPostal', v)}
                          keyboardType="numeric"
                          placeholder="Código postal"
                        />
                      </>
                    ) : (
                      <CampoInfo
                        icono="location-outline"
                        etiqueta="Dirección"
                        valor={formatearDireccion({
                          calle: campos.calle,
                          numero: campos.numero,
                          comuna: campos.comuna,
                          region: campos.region,
                        })}
                      />
                    )}
                  </Seccion>
                )}

                {/* Mensaje éxito */}
                {exitoGuardado && (
                  <View style={styles.exitoBox}>
                    <Text style={styles.exitoTexto}>Cambios guardados correctamente.</Text>
                  </View>
                )}

                {/* Botón guardar (solo si hay cambios) */}
                {modoEdicion && hayCambios && (
                  <Pressable
                    style={({ pressed }) => [styles.botonGuardar, pressed && styles.botonPressed, guardando && styles.botonDisabled]}
                    onPress={guardar}
                    disabled={guardando}
                    accessibilityLabel="Guardar cambios"
                  >
                    <Text style={styles.botonGuardarTexto}>
                      {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </Text>
                  </Pressable>
                )}

                {/* Botón modificar (solo en vista) */}
                {!modoEdicion && (
                  <Pressable
                    style={({ pressed }) => [styles.botonModificar, pressed && styles.botonPressed]}
                    onPress={() => setModoEdicion(true)}
                    accessibilityLabel="Modificar perfil"
                  >
                    <Ionicons name="pencil-outline" size={18} color={PRIMARY} />
                    <Text style={styles.botonModificarTexto}>Modificar</Text>
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Tab bar */}
        <View style={[styles.tabBar, { marginBottom: insets.bottom + 10 }]}>
          {TAB_ITEMS.map(({ id, Component, route }) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Tab ${id}`}
              onPress={() => router.push(route)}
            >
              <Component width={63} height={63} opacity={id === 'perfil' ? 1 : 0.65} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tituloPagina: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
  },
  cancelarBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelarTexto: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },

  loader: { marginTop: 60 },

  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  errorTexto: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  exitoBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  exitoTexto: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Avatar */
  avatarSeccion: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarFallback: {
    backgroundColor: '#DDEEF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: {
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarIniciales: {
    fontWeight: '700',
    color: PRIMARY,
  },
  nombreTexto: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  usernameTexto: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  rolBadge: {
    marginTop: 8,
    backgroundColor: '#E8F1F8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  rolTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  /* Secciones */
  seccion: { marginBottom: 20 },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  seccionCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  /* Campos */
  campoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  campoIcono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F1F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campoTextos: { flex: 1 },
  campoEtiqueta: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  campoValor: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  campoInput: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },

  separador: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 48,
  },

  /* Botones */
  botonModificar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 28,
    minHeight: 52,
    marginTop: 4,
    marginBottom: 8,
  },
  botonModificarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  botonGuardar: {
    backgroundColor: PRIMARY,
    borderRadius: 28,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  botonPressed: { opacity: 0.86 },
  botonDisabled: { opacity: 0.6 },

  /* Tab bar */
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
