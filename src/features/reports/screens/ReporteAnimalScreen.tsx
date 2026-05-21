import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { pdfModule } from '../../../native/pdfModule';
import { shareModule } from '../../../native/shareModule';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type ReporteAnimalScreenProps = {
  animalId: number;
  arete: string;
  onBack: () => void;
};

export function ReporteAnimalScreen({ animalId, arete, onBack }: ReporteAnimalScreenProps) {
  const [cargando, setCargando] = useState(false);
  const [rutaPdf, setRutaPdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generarPdf = () => {
    setCargando(true);
    setError(null);
    pdfModule
      .generateAnimalPdf(animalId)
      .then(r => setRutaPdf(r))
      .catch(e => setError((e as Error).message || 'Error al generar PDF'))
      .finally(() => setCargando(false));
  };

  const [compartiendo, setCompartiendo] = useState(false);

  const compartirPdf = async () => {
    if (!rutaPdf) return;
    setCompartiendo(true);
    try {
      await shareModule.sharePdf(rutaPdf, `Reporte Animal #${arete} — AgroApp`);
    } catch (e: any) {
      Alert.alert('Error al compartir', e.message || 'No se pudo compartir el PDF.');
    } finally {
      setCompartiendo(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Reporte de Animal</Text>
          <Text style={styles.headerSubtitle}>Datos, historial y gastos individuales</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chip de arete */}
        <View style={styles.areteChipRow}>
          <View style={styles.areteChip}>
            <Text style={styles.areteChipLabel}>ARETE</Text>
            <Text style={styles.areteChipValue}>#{arete}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🐄</Text>
          <Text style={styles.infoTitle}>¿Qué incluye este reporte?</Text>
          {[
            'Datos del animal: especie, sexo, raza, peso y estado',
            'Historial clínico completo con fechas y veterinarios',
            'Todos los gastos registrados con categoría y monto',
            'Inversión total acumulada en MXN',
          ].map(item => (
            <View key={item} style={styles.infoRow}>
              <Text style={styles.infoBullet}>✓</Text>
              <Text style={styles.infoText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Estado: cargando */}
        {cargando && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#07612d" />
            <Text style={styles.loadingText}>Generando PDF…</Text>
          </View>
        )}

        {/* Estado: éxito */}
        {rutaPdf && !cargando && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>PDF generado correctamente</Text>
            <Text style={styles.successPath} numberOfLines={4} selectable>
              {rutaPdf}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.shareButton,
                (pressed || compartiendo) && styles.shareButtonPressed,
              ]}
              onPress={compartirPdf}
              disabled={compartiendo}
            >
              {compartiendo
                ? <ActivityIndicator size="small" color="#07612d" />
                : <Text style={styles.shareButtonText}>↑ Compartir PDF</Text>}
            </Pressable>
          </View>
        )}

        {/* Estado: error */}
        {error && !cargando && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>No se pudo generar el PDF</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Botón principal */}
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            (pressed || cargando) && styles.generateButtonPressed,
            cargando && styles.generateButtonDisabled,
          ]}
          onPress={generarPdf}
          disabled={cargando}
        >
          <Text style={styles.generateButtonText}>
            {cargando ? 'Generando…' : '📄 Generar PDF Individual'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f8f0',
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // Chip de arete
  areteChipRow: {
    alignItems: 'flex-start',
  },
  areteChip: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areteChipLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  areteChipValue: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },

  // Tarjeta info
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8dece',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 18,
    elevation: 1,
    shadowColor: '#07612d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  infoIcon: { fontSize: 30, marginBottom: 10 },
  infoTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1c2b1d',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  infoBullet: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#4a6350',
    lineHeight: 20,
  },

  // Cargando
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: '#07612d',
  },

  // Éxito
  successCard: {
    backgroundColor: '#e8f5ec',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a8d5b5',
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  successIcon: { fontSize: 32 },
  successTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#07612d',
  },
  successPath: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#3a5e43',
    textAlign: 'center',
    lineHeight: 18,
  },
  shareButton: {
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#07612d',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  shareButtonPressed: { backgroundColor: '#f0faf3' },
  shareButtonText: {
    color: '#07612d',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },

  // Error
  errorCard: {
    backgroundColor: '#fff0f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  errorIcon: { fontSize: 30 },
  errorTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#c0392b',
  },
  errorMessage: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#922b21',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Botón generar
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#07612d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  generateButtonPressed: {
    backgroundColor: '#055226',
    elevation: 1,
  },
  generateButtonDisabled: { opacity: 0.65 },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
