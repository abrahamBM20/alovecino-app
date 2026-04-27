import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const LOGO_IMAGE = 'https://www.figma.com/api/mcp/asset/b301fda7-1922-45cc-b693-56b0c7ba9654';

export default function AuthSelectionScreen({ onLoginPress, onSignupPress }) {
  const { width, height } = Dimensions.get('window');
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  const logoWidth = 219 * scaleX;
  const logoHeight = 123 * scaleY;
  const actionWidth = 320 * scaleX;
  const actionHeight = 55 * scaleY;

  return (
    <LinearGradient colors={['#ffffff', '#044e81']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.gradient}>
      <View style={styles.content}>
        <Image
          source={{ uri: LOGO_IMAGE }}
          style={[
            styles.logo,
            {
              left: width / 2 - logoWidth / 2,
              top: 200 * scaleY,
              width: logoWidth,
              height: logoHeight,
            },
          ]}
          resizeMode="contain"
        />

        <Text style={[styles.title, { top: 390 * scaleY, fontSize: 30 * scaleX * 0.5 }]}>Bienvenido</Text>
        <Text style={[styles.subtitle, { top: 430 * scaleY, fontSize: 16 * scaleX * 0.5 }]}>Selecciona como quieres continuar</Text>

        <Pressable
          onPress={onLoginPress}
          style={[
            styles.primaryButton,
            {
              left: width / 2 - actionWidth / 2,
              top: 510 * scaleY,
              width: actionWidth,
              height: actionHeight,
              borderRadius: 35 * scaleX,
            },
          ]}
        >
          <Text style={[styles.primaryText, { fontSize: 34 * scaleX * 0.5 }]}>INICIAR SESION</Text>
        </Pressable>

        <Pressable
          onPress={onSignupPress}
          style={[
            styles.secondaryButton,
            {
              left: width / 2 - actionWidth / 2,
              top: 580 * scaleY,
              width: actionWidth,
              height: actionHeight,
              borderRadius: 35 * scaleX,
            },
          ]}
        >
          <Text style={[styles.secondaryText, { fontSize: 34 * scaleX * 0.5 }]}>CREAR CUENTA</Text>
        </Pressable>
      </View>
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
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
  subtitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '500',
  },
  primaryButton: {
    position: 'absolute',
    backgroundColor: '#044e81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#044e81',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});