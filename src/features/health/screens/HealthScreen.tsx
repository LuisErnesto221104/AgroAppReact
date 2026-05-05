import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CalendarioSanitario from '../../../screens/sanitarios/CalendarioSanitario';
import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  const [view, setView] = useState<'calendario' | 'registro'>('calendario');

  if (view === 'registro') {
    return <RegistrarEventoSanitario onBack={() => setView('calendario')} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Sanidad</Text>
        <Pressable onPress={() => setView('registro')} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Registrar Evento</Text>
        </Pressable>
      </View>

      <CalendarioSanitario />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backButtonText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  title: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  primaryAction: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
    borderRadius: 999,
  },
  primaryActionText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
});
