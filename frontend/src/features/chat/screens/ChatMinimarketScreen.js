import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useValoracion } from '../../valoracion/hooks/useValoracion';
import { colors } from '../theme/colors';

const STAR_FILLED = '★';
const STAR_EMPTY = '☆';

const INITIAL_MESSAGES = [
  { id: '1', from: 'almacen', text: 'Hola! En que podemos ayudarte?' },
];

const TAB_ITEMS = [
  { id: 'filtro', icon: 'location-outline' },
  { id: 'inicio', icon: 'home-outline' },
  { id: 'configuracion', icon: 'settings-outline' },
  { id: 'perfil', icon: 'person-outline' },
];

function StarSelector({ value, onChange }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
          <Text style={[styles.starIcon, n <= value && styles.starFilled]}>
            {n <= value ? STAR_FILLED : STAR_EMPTY}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ValoracionModal({ visible, nombre, miValoracion, isLoading, isSaving, isDeleting, error, estrellas, setEstrellas, contenido, setContenido, guardar, actualizar, eliminar, onClose }) {
  const [editMode, setEditMode] = useState(false);

  async function handleAgregar() {
    const ok = editMode ? await actualizar() : await guardar();
    if (ok) { setEditMode(false); onClose(); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>★ Valorar este almacén</Text>
        {!!nombre && <Text style={styles.sheetSubtitle}>{nombre}</Text>}

        {isLoading ? (
          <ActivityIndicator size="small" color="#044e81" style={{ marginVertical: 20 }} />
        ) : miValoracion && !editMode ? (
          <View>
            <View style={styles.miValRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={[styles.starIcon, n <= miValoracion.cantidadEstrellas && styles.starFilled]}>
                  {n <= miValoracion.cantidadEstrellas ? STAR_FILLED : STAR_EMPTY}
                </Text>
              ))}
            </View>
            {!!miValoracion.contenido && <Text style={styles.miContenido}>{miValoracion.contenido}</Text>}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => { setEstrellas(miValoracion.cantidadEstrellas); setContenido(miValoracion.contenido ?? ''); setEditMode(true); }} activeOpacity={0.75}>
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={async () => { await eliminar(); onClose(); }} disabled={isDeleting} activeOpacity={0.75}>
                {isDeleting ? <ActivityIndicator size="small" color="#dc2626" /> : <Text style={styles.deleteBtnText}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.skipBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.skipBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            <StarSelector value={estrellas} onChange={setEstrellas} />
            <TextInput
              style={styles.valoracionInput}
              placeholder="Escribe tu comentario..."
              placeholderTextColor="#94a3b8"
              value={contenido}
              onChangeText={setContenido}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.addBtn, (isSaving || estrellas === 0) && styles.addBtnDisabled]}
              onPress={handleAgregar}
              disabled={isSaving || estrellas === 0}
              activeOpacity={0.75}
            >
              {isSaving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.addBtnText}>{editMode ? 'Actualizar' : 'Agregar'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={() => { setEditMode(false); onClose(); }} activeOpacity={0.75}>
              <Text style={styles.skipBtnText}>Omitir</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

export default function ChatMinimarketScreen({ idAlmacen, nombre }) {
  const router = useRouter();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const listRef = useRef(null);

  const { miValoracion, isLoading, isSaving, isDeleting, error, estrellas, setEstrellas, contenido, setContenido, guardar, actualizar, eliminar } = useValoracion(idAlmacen);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowModal(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  function handleLeave() {
    setShowModal(true);
  }

  function handleModalClose() {
    setShowModal(false);
    router.back();
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), from: 'usuario', text }]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function renderMessage({ item }) {
    const isAlmacen = item.from === 'almacen';
    return (
      <View style={[styles.messageRow, isAlmacen ? styles.messageRowLeft : styles.messageRowRight]}>
        {isAlmacen && (
          <View style={styles.msgAvatar}>
            <Ionicons name="storefront-outline" size={24} color={colors.white} />
          </View>
        )}
        <View style={[styles.bubble, isAlmacen ? styles.bubbleLeft : styles.bubbleRight]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={40} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>{nombre || 'Almacen'}</Text>
        <View style={styles.avatar}>
          <Ionicons name="storefront-outline" size={36} color={colors.white} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe aqui"
            placeholderTextColor={colors.primaryLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.75}>
            <Ionicons name="arrow-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.tabBar}>
        {TAB_ITEMS.map(({ id, icon }) => (
          <TouchableOpacity key={id} style={styles.tabBtn} activeOpacity={0.75} onPress={handleLeave}>
            <Ionicons name={icon} size={28} color={colors.white} />
          </TouchableOpacity>
        ))}
      </View>

      <ValoracionModal
        visible={showModal}
        nombre={nombre}
        miValoracion={miValoracion}
        isLoading={isLoading}
        isSaving={isSaving}
        isDeleting={isDeleting}
        error={error}
        estrellas={estrellas}
        setEstrellas={setEstrellas}
        contenido={contenido}
        setContenido={setContenido}
        guardar={guardar}
        actualizar={actualizar}
        eliminar={eliminar}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: colors.white },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: 220,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  bubbleLeft: { borderBottomLeftRadius: 4 },
  bubbleRight: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, fontWeight: '500', color: colors.primary, lineHeight: 21 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 63,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    height: 87,
    backgroundColor: colors.primary,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tabBtn: {
    width: 63,
    height: 63,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44, height: 4, backgroundColor: '#cbd5e1',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#044e81', marginBottom: 4, textAlign: 'center', letterSpacing: 0.2 },
  sheetSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20, fontWeight: '500' },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  starIcon: { fontSize: 40, color: '#b0c8e0', marginHorizontal: 6 },
  starFilled: { color: '#f59e0b' },
  miValRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  miContenido: { fontSize: 15, color: '#1a3550', lineHeight: 22, marginBottom: 16, textAlign: 'center', fontWeight: '500' },
  valoracionInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  addBtn: {
    backgroundColor: '#5BB8F5',
    borderRadius: 28,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.4 },
  editBtn: {
    flex: 1, minHeight: 52, borderWidth: 2, borderColor: '#044e81',
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { color: '#044e81', fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flex: 1, minHeight: 52, borderWidth: 2, borderColor: '#dc2626',
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipBtnText: { color: '#94a3b8', fontSize: 15, fontWeight: '500' },
  errorText: {
    color: '#dc2626', fontSize: 13, marginBottom: 12,
    backgroundColor: '#fee2e2', padding: 10, borderRadius: 14, textAlign: 'center',
  },
});
