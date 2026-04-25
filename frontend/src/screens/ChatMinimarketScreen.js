import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';

const INITIAL_MESSAGES = [
  { id: '1', from: 'almacen', text: '¡Hola! ¿En qué podemos ayudarte?' },
];

const TAB_ITEMS = [
  { id: 'filtro',        label: '≡' },
  { id: 'inicio',        label: '⌂' },
  { id: 'configuracion', label: '⚙' },
  { id: 'perfil',        label: '👤' },
];

export default function ChatMinimarketScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), from: 'usuario', text },
    ]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function renderMessage({ item }) {
    const isAlmacen = item.from === 'almacen';
    return (
      <View style={[styles.bubble, isAlmacen ? styles.bubbleLeft : styles.bubbleRight]}>
        <Text style={styles.bubbleText}>{item.text}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.headerTitle}>Almacén</Text>
        <View style={styles.avatar} />
      </View>

      {/* Mensajes */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí"
            placeholderTextColor={colors.primaryLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.75}>
            <Text style={styles.sendBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            style={styles.tabBtn}
            activeOpacity={0.75}
            onPress={() => navigation?.navigate(id)}
          >
            <Text style={styles.tabBtnText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.white,
  },

  // Mensajes
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  bubble: {
    maxWidth: 237,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    lineHeight: 21,
  },

  // Input
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
  sendBtnText: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '700',
  },

  // Tab bar
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
  tabBtnText: {
    fontSize: 22,
    color: colors.white,
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
