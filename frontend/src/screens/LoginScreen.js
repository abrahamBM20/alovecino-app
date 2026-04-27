import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const LOGIN_LOGO_IMAGE = 'https://www.figma.com/api/mcp/asset/b301fda7-1922-45cc-b693-56b0c7ba9654';

export default function LoginScreen({ onBack, onLoginSuccess }) {
  const { width, height } = Dimensions.get('window');
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  const logoWidth = 219 * scaleX;
  const logoHeight = 123 * scaleY;
  const fieldWidth = 320 * scaleX;
  const fieldHeight = 44 * scaleY;
  const buttonHeight = 55 * scaleY;

  return (
    <LinearGradient colors={['#ffffff', '#044e81']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image
          source={{ uri: LOGIN_LOGO_IMAGE }}
          style={[
            styles.logo,
            {
              left: width / 2 - logoWidth / 2,
              top: 194 * scaleY,
              width: logoWidth,
              height: logoHeight,
            },
          ]}
          resizeMode="contain"
        />

        <Text style={[styles.label, { left: 37 * scaleX, top: 356 * scaleY, fontSize: 15 * scaleX }]}>Correo electrónico</Text>
        <TextInput
          style={[
            styles.input,
            {
              left: width / 2 - fieldWidth / 2,
              top: 382 * scaleY,
              width: fieldWidth,
              height: fieldHeight,
              borderRadius: 35 * scaleX,
            },
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder=""
          placeholderTextColor="#9ca3af"
        />

        <Text style={[styles.label, { left: 37 * scaleX, top: 439 * scaleY, fontSize: 15 * scaleX }]}>Contraseña</Text>
        <TextInput
          style={[
            styles.input,
            {
              left: width / 2 - fieldWidth / 2,
              top: 463 * scaleY,
              width: fieldWidth,
              height: fieldHeight,
              borderRadius: 35 * scaleX,
            },
          ]}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder=""
          placeholderTextColor="#9ca3af"
        />

        <Pressable
          onPress={onLoginSuccess}
          style={[
            styles.loginButton,
            {
              left: width / 2 - fieldWidth / 2,
              top: 528 * scaleY,
              width: fieldWidth,
              height: buttonHeight,
              borderRadius: 35 * scaleX,
            },
          ]}
        >
          <Text style={[styles.loginButtonText, { fontSize: 38 * scaleX * 0.5 }]}>ENTRAR</Text>
        </Pressable>

        <Pressable style={[styles.linkButton, { top: 605 * scaleY, left: 0, right: 0 }]}>
          <Text style={[styles.linkText, { fontSize: 15 * scaleX }]}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        <Pressable onPress={onBack} style={[styles.linkButton, { top: 636 * scaleY, left: 0, right: 0 }]}>
          <Text style={[styles.linkText, { fontSize: 15 * scaleX }]}>Volver</Text>
        </Pressable>

        <Pressable style={[styles.linkButton, { top: 666 * scaleY, left: 0, right: 0 }]}>
          <Text style={[styles.linkText, { fontSize: 15 * scaleX }]}>¿No tienes cuenta? Crear una cuenta</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  logo: {
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    color: '#ffffff',
    fontWeight: '500',
  },
  input: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#0f172a',
  },
  loginButton: {
    position: 'absolute',
    backgroundColor: '#044e81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkButton: {
    position: 'absolute',
    alignItems: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});
