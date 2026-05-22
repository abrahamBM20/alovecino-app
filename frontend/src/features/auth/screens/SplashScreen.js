import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../../shared/ui/ScreenContainer';
import { ASSETS } from '../../../shared/constants/assets';

export default function SplashScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Image source={ASSETS.logoMain} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo AloVecino" />
        <Image source={ASSETS.logoText} style={styles.logoText} resizeMode="contain" accessibilityLabel="Texto AloVecino" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 280,
    height: 160,
  },
  logoText: {
    width: 170,
    height: 30,
    marginTop: 10,
  },
});
