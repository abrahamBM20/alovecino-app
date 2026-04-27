import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const LOGO_IMAGE = 'https://www.figma.com/api/mcp/asset/e99030b5-7b2a-4ce0-97e9-4dad3088f390';
const LOGO_TEXT_IMAGE = 'https://www.figma.com/api/mcp/asset/ae228208-b1d7-415d-b765-808cf08aa306';

export default function LoadingScreen() {
  const { width, height } = Dimensions.get('window');
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  return (
    <LinearGradient colors={['#ffffff', '#044e81']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.gradient}>
      <View style={styles.canvas}>
        <Image
          source={{ uri: LOGO_IMAGE }}
          style={[
            styles.logo,
            {
              left: width / 2 - (328 * scaleX) / 2,
              width: 328 * scaleX,
              height: 185 * scaleY,
              top: 333 * scaleY,
            },
          ]}
          resizeMode="contain"
        />
        <Image
          source={{ uri: LOGO_TEXT_IMAGE }}
          style={[
            styles.logoText,
            {
              left: width / 2 - (172 * scaleX) / 2,
              width: 172 * scaleX,
              height: 28 * scaleY,
              top: 536 * scaleY,
            },
          ]}
          resizeMode="contain"
        />
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
  canvas: {
    flex: 1,
  },
  logo: {
    position: 'absolute',
  },
  logoText: {
    position: 'absolute',
  },
});
