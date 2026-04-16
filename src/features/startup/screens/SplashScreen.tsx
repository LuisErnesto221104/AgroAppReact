import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../../shared/theme/identity';

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.container}>
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <Image
          source={require('../../../Logos/Logo_Blanco_Nombre.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AgroApp</Text>
        <Text style={styles.subtitle}>Gestion Ganadera Offline</Text>
        <Text style={styles.caption}>Cargando inicio...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundCircleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -90,
    right: -70,
  },
  backgroundCircleBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -110,
    left: -80,
  },
  logoBadge: {
    display: 'none',
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  caption: {
    marginTop: 28,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: COLORS.white,
  },
});
