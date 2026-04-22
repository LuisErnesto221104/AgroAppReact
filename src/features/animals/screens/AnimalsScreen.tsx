import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { RegistrarAnimalScreen } from '../../../screens/animales/RegistrarAnimalScreen';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type AnimalsScreenProps = {
  onBack: () => void;
};

type AnimalsView = 'menu' | 'register';

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  const [view, setView] = useState<AnimalsView>('menu');

  if (view === 'register') {
    return <RegistrarAnimalScreen onBack={() => setView('menu')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Text style={styles.title}>Gestion de Animales</Text>
        <Text style={styles.subtitle}>Selecciona una opcion disponible por ahora.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.menuCard} onPress={() => setView('register')}>
          <View style={styles.menuIconWrap}>
            <Text style={styles.menuIcon}>🐄</Text>
          </View>
          <View style={styles.menuBody}>
            <Text style={styles.menuTitle}>Registrar Animal</Text>
            <Text style={styles.menuDescription}>Alta de un nuevo animal con validacion de arete RD001.</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Proximamente</Text>
          <Text style={styles.comingSoonText}>Inventario, detalle, edicion y eliminacion de animales.</Text>
        </View>

        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1e7',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  subtitle: {
    marginTop: 4,
    color: '#dbe9db',
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eaf3e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuBody: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  menuDescription: {
    marginTop: 4,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  menuChevron: {
    color: COLORS.primary,
    fontSize: 28,
    fontFamily: FONTS.bold,
    marginLeft: 4,
  },
  comingSoonCard: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ece6d7',
  },
  comingSoonTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  comingSoonText: {
    marginTop: 4,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
