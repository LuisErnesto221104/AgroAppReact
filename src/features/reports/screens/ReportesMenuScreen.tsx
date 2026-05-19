import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  NativeModules,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { pdfModule } from '../../../native/pdfModule';
import { ReporteAnimalScreen } from './ReporteAnimalScreen';
import { COLORS, FONTS } from '../../../shared/theme/identity';

/* ─── Tipos ────────────────────────────────────────────────────────────── */

type SubView = 'menu' | 'hato' | 'selector' | 'reporte_animal';

type AnimalItem = { id: number; arete: string; especie: string; estado: string };

type ReportesMenuScreenProps = { onBack: () => void };

type ReportCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

/* ─── Tarjeta de reporte ───────────────────────────────────────────────── */

function ReportCard({ icon, title, description, onPress }: ReportCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

/* ─── Pantalla principal ───────────────────────────────────────────────── */

export function ReportesMenuScreen({ onBack }: ReportesMenuScreenProps) {
  const [view, setView] = useState<SubView>('menu');
  const [animalSeleccionado, setAnimalSeleccionado] = useState<AnimalItem | null>(null);

  if (view === 'hato') {
    return <ReporteHatoView onBack={() => setView('menu')} />;
  }

  if (view === 'selector') {
    return (
      <SelectorAnimalView
        onBack={() => setView('menu')}
        onSelect={animal => {
          setAnimalSeleccionado(animal);
          setView('reporte_animal');
        }}
      />
    );
  }

  if (view === 'reporte_animal' && animalSeleccionado) {
    return (
      <ReporteAnimalScreen
        animalId={animalSeleccionado.id}
        arete={animalSeleccionado.arete}
        onBack={() => setView('selector')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

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

        <ReportCard
          icon="🐄"
          title="Reporte por Animal"
          description="Datos, historial clínico y gastos de un animal específico."
          onPress={() => setView('selector')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Sub-vista: Selector de animal ───────────────────────────────────── */

type SelectorAnimalViewProps = {
  onBack: () => void;
  onSelect: (animal: AnimalItem) => void;
};

function SelectorAnimalView({ onBack, onSelect }: SelectorAnimalViewProps) {
  const [animales, setAnimales] = useState<AnimalItem[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const { AgroBridgeModule } = NativeModules;
    AgroBridgeModule.obtenerAnimales()
      .then((lista: AnimalItem[]) => setAnimales(lista))
      .catch(() => Alert.alert('Error', 'No se pudo cargar la lista de animales.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Reporte por Animal</Text>
          <Text style={styles.headerSubtitle}>Selecciona un animal</Text>
        </View>
      </View>

      {cargando ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : animales.length === 0 ? (
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>No hay animales registrados.</Text>
        </View>
      ) : (
        <FlatList
          data={animales}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.animalRow, pressed && styles.animalRowPressed]}
              onPress={() => onSelect(item)}
            >
              <View style={styles.animalIconWrap}>
                <Text style={styles.animalIcon}>🐄</Text>
              </View>
              <View style={styles.animalInfo}>
                <Text style={styles.animalArete}>#{item.arete}</Text>
                <Text style={styles.animalMeta}>{item.especie || '—'}</Text>
              </View>
              <View style={[
                styles.estadoBadge,
                item.estado === 'ACTIVO' && styles.estadoActivo,
                item.estado === 'VENDIDO' && styles.estadoVendido,
                item.estado === 'FALLECIDO' && styles.estadoFallecido,
              ]}>
                <Text style={styles.estadoBadgeText}>{item.estado}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

/* ─── Sub-vista: Reporte del Hato ─────────────────────────────────────── */

type ReporteHatoViewProps = { onBack: () => void };

function ReporteHatoView({ onBack }: ReporteHatoViewProps) {
  const [generando, setGenerando] = useState(false);
  const [rutaPdf, setRutaPdf] = useState<string | null>(null);

  const handleGenerar = async () => {
    setGenerando(true);
    setRutaPdf(null);
    try {
      const ruta = await pdfModule.generateHatoPdf();
      setRutaPdf(ruta);
      Alert.alert('PDF generado', `Archivo guardado en:\n${ruta}`, [{ text: 'OK' }]);
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
          style={({ pressed }) => [styles.generateBtn, (pressed || generando) && styles.generateBtnPressed]}
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
  safeArea: { flex: 1, backgroundColor: '#f4f8f0' },

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
  backButtonText: { color: '#ffffff', fontSize: 14, fontFamily: FONTS.bold },
  headerTextBlock: { flex: 1 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontFamily: FONTS.bold },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#6a8a72',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Tarjeta de reporte del menú
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
  cardPressed: { backgroundColor: '#f0f8f3', elevation: 0 },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f5ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: FONTS.bold, color: '#1c2b1d' },
  cardDesc: { marginTop: 4, fontSize: 12, fontFamily: FONTS.regular, color: '#4a6350', lineHeight: 18 },
  chevron: { fontSize: 22, color: COLORS.primary, fontFamily: FONTS.bold, opacity: 0.7 },

  // Selector de animal
  listContent: { padding: 12, paddingBottom: 100 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#777', fontFamily: FONTS.regular, fontSize: 14 },
  animalRow: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddeee3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 12,
    elevation: 1,
  },
  animalRowPressed: { backgroundColor: '#f0faf3' },
  animalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e8f5ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalIcon: { fontSize: 20 },
  animalInfo: { flex: 1 },
  animalArete: { fontSize: 15, fontFamily: FONTS.bold, color: '#1c2b1d' },
  animalMeta: { fontSize: 12, fontFamily: FONTS.regular, color: '#6a8a72', marginTop: 2 },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#eee',
  },
  estadoActivo: { backgroundColor: '#e8f5ec' },
  estadoVendido: { backgroundColor: '#fff3e0' },
  estadoFallecido: { backgroundColor: '#fce8e8' },
  estadoBadgeText: { fontSize: 9, fontFamily: FONTS.bold, color: '#333' },

  // Reporte Hato — tarjeta info
  hatoInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8dece',
    padding: 18,
    marginBottom: 20,
    elevation: 1,
  },
  hatoInfoIcon: { fontSize: 32, marginBottom: 10 },
  hatoInfoTitle: { fontSize: 15, fontFamily: FONTS.bold, color: '#1c2b1d', marginBottom: 12 },
  hatoInfoList: { gap: 8 },
  hatoInfoItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  hatoInfoBullet: { fontSize: 13, color: COLORS.primary, fontFamily: FONTS.bold, marginTop: 1 },
  hatoInfoText: { flex: 1, fontSize: 13, fontFamily: FONTS.regular, color: '#4a6350', lineHeight: 20 },

  successCard: {
    backgroundColor: '#e8f5ec',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    gap: 6,
  },
  successIcon: { fontSize: 28 },
  successTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#07612d' },
  successPath: { fontFamily: FONTS.regular, fontSize: 11, color: '#4a6350', textAlign: 'center' },

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
  generateBtnPressed: { backgroundColor: '#055226', elevation: 1 },
  generateBtnText: { color: '#ffffff', fontSize: 15, fontFamily: FONTS.bold },
});
