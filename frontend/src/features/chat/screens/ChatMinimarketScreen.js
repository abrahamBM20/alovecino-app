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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const INITIAL_MESSAGES = [
  { id: '1', from: 'almacen', text: 'Hola! En que podemos ayudarte?' },
];

const TAB_ITEMS = [
  { id: 'filtro', icon: 'location-outline' },
  { id: 'inicio', icon: 'home-outline' },
  { id: 'configuracion', icon: 'settings-outline' },
  { id: 'perfil', icon: 'person-outline' },
];

export default function ChatMinimarketScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: 'usuario', text },
    ]);
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
        <Text style={styles.headerTitle}>Almacen</Text>
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
          <TouchableOpacity
            key={id}
            style={styles.tabBtn}
            activeOpacity={0.75}
            onPress={() => navigation?.navigate(id)}
          >
            <Ionicons name={icon} size={28} color={colors.white} />
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
  flex: {
    flex: 1,
  },
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
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
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
  bubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    lineHeight: 21,
  },
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
});
