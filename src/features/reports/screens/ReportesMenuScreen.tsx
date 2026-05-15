import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, FONTS } from '../../../shared/theme/identity';

type SubView = 'menu' | 'hato';

type ReportesMenuScreenProps = {
  onBack: () => void;
};

type ReportCardProps = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
  disabled?: boolean;
};

function ReportCard({ icon, title, description, badge, onPress, disabled }: ReportCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && !disabled && styles.cardPressed]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function ReportesMenuScreen({ onBack }: ReportesMenuScreenProps) {
  const [view, setView] = useState<SubView>('menu');

  if (view === 'hato') {
    return (
      <ReporteHatoView onBack={() => setView('menu')} />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Reportes</Text>
          <Text style={styles.headerSubtitle}>Genera reportes PDF sin internet</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>DISPONIBLES</Text>

        <ReportCard
          icon="📋"
          title="Reporte del Hato"
          description="Inventario completo — animales activos con inversión total acumulada."
          onPress={() => setView('hato')}
        />

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PRÓXIMAMENTE</Text>

        <ReportCard
          icon="🐄"
          title="Reporte por Animal"
          description="Datos, historial clínico y gastos de un animal específico."
          badge="Próximamente"
          disabled
          onPress={() =>
            Alert.alert(
              'Próximamente',
              'El reporte por animal estará disponible en la próxima versión.',
              [{ text: 'Entendido' }],
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Sub-vista: Reporte del Hato ─────────────────────────────────────── */

import { pdfModule } from '../../../native/pdfModule';

type ReporteHatoViewProps = {
  onBack: () => void;
};

function ReporteHatoView({ onBack }: ReporteHatoViewProps) {
  const [generando, setGenerando] = useState(false);
  const [rutaPdf, setRutaPdf] = useState<string | null>(null);

  const handleGenerar = async () => {
    setGenerando(true);
    setRutaPdf(null);
    try {
      const ruta = await pdfModule.generateHatoPdf();
      setRutaPdf(ruta);
      Alert.alert(
        'PDF generado',
        `Archivo guardado en:\n${ruta}`,
        [{ text: 'OK' }],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Reporte del Hato</Text>
          <Text style={styles.headerSubtitle}>Inventario de animales activos</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hatoInfoCard}>
          <Text style={styles.hatoInfoIcon}>📋</Text>
          <Text style={styles.hatoInfoTitle}>¿Qué incluye este reporte?</Text>
          <View style={styles.hatoInfoList}>
            {[
              'Número de arete de cada animal',
              'Especie, sexo y estado',
              'Peso actual en kg',
              'Inversión total acumulada en MXN',
            ].map(item => (
              <View key={item} style={styles.hatoInfoItem}>
                <Text style={styles.hatoInfoBullet}>✓</Text>
                <Text style={styles.hatoInfoText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {rutaPdf && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>PDF listo</Text>
            <Text style={styles.successPath} numberOfLines={3}>{rutaPdf}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.generateBtn,
            (pressed || generando) && styles.generateBtnPressed,
          ]}
          onPress={handleGenerar}
          disabled={generando}
        >
          <Text style={styles.generateBtnText}>
            {generando ? 'Generando PDF…' : '📄 Generar PDF'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Estilos ─────────────────────────────────────────────────────────── */

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Etiqueta de sección
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#6a8a72',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Tarjeta de reporte
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8dece',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#07612d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 12,
  },
  cardPressed: {
    backgroundColor: '#f0f8f3',
    elevation: 0,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f5ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1c2b1d',
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#4a6350',
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    opacity: 0.7,
  },

  // Badge "Próximamente"
  badge: {
    backgroundColor: '#e8f5ec',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  // Reporte Hato — tarjeta de info
  hatoInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8dece',
    padding: 18,
    marginBottom: 20,
    elevation: 1,
  },
  hatoInfoIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  hatoInfoTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1c2b1d',
    marginBottom: 12,
  },
  hatoInfoList: {
    gap: 8,
  },
  hatoInfoItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  hatoInfoBullet: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginTop: 1,
  },
  hatoInfoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#4a6350',
    lineHeight: 20,
  },

  // Tarjeta de éxito post-generación
  successCard: {
    backgroundColor: '#e8f5ec',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    gap: 6,
  },
  successIcon: {
    fontSize: 28,
  },
  successTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#07612d',
  },
  successPath: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#4a6350',
    textAlign: 'center',
  },

  // Botón generar
  generateBtn: {
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
  generateBtnPressed: {
    backgroundColor: '#055226',
    elevation: 1,
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
});
