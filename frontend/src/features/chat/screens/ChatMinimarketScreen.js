import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ValoracionModal from '../../valoracion/components/ValoracionModal';

const PRIMARY = '#044e81';

const INITIAL_MESSAGES = [
  { id: '1', from: 'almacen', text: 'Hola! En que podemos ayudarte?' },
];

const TAB_ITEMS = [
  { id: 'filtro', source: require('../../../../assets/boton_filtro.png'), label: 'Filtro' },
  { id: 'inicio', source: require('../../../../assets/boton_inicio.png'), label: 'Inicio' },
  { id: 'configuracion', source: require('../../../../assets/boton_configuracion.png'), label: 'Configuracion' },
  { id: 'perfil', source: require('../../../../assets/boton_perfil.png'), label: 'Perfil' },
];

export default function ChatMinimarketScreen({ idAlmacen, nombre, logoUrl }) {
  const router = useRouter();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const listRef = useRef(null);

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
          logoUrl
            ? <Image source={{ uri: logoUrl }} style={styles.msgAvatarImg} resizeMode="cover" />
            : <View style={styles.msgAvatar}><Ionicons name="storefront" size={20} color="#fff" /></View>
        )}
        <View style={[styles.bubble, isAlmacen ? styles.bubbleLeft : styles.bubbleRight]}>
          <Text style={[styles.bubbleText, isAlmacen ? styles.bubbleTextLeft : styles.bubbleTextRight]}>
            {item.text}
          </Text>
        </View>
        {!isAlmacen && (
          <Image source={require('../../../../assets/boton_perfil.png')} style={styles.msgAvatarImg} resizeMode="contain" />
        )}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#044e81']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeave} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          {logoUrl
            ? <Image source={{ uri: logoUrl }} style={styles.headerPhoto} resizeMode="cover" />
            : <View style={styles.msgAvatar}><Ionicons name="storefront" size={20} color="#fff" /></View>
          }
          <Text style={styles.headerTitle}>{nombre || 'Almacen'}</Text>
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
              placeholderTextColor="rgba(4,78,129,0.4)"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.75}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <View style={styles.tabBar}>
          {TAB_ITEMS.map(({ id, source, label }) => (
            <TouchableOpacity
              key={id}
              style={styles.tabBtn}
              activeOpacity={0.8}
              onPress={handleLeave}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Image source={source} style={styles.tabImage} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>

        <ValoracionModal
          visible={showModal}
          onClose={handleModalClose}
          idAlmacen={idAlmacen}
          nombreAlmacen={nombre}
          logoUrl={logoUrl}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: PRIMARY,
  },
  headerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bubble: {
    maxWidth: 220,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleLeft: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  bubbleTextLeft: { color: PRIMARY },
  bubbleTextRight: { color: '#fff' },
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
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: PRIMARY,
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    height: 87,
    backgroundColor: PRIMARY,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,86,219,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tabBtn: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabImage: {
    width: 60,
    height: 60,
  },
});
