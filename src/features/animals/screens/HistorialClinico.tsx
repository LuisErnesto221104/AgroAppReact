import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';
import { useHistorialClinico } from '../../../hooks/useHistorialClinico';
import EventoClinicoCard from '../../../components/EventoClinicoCard';
import { COLORS, FONTS } from '../../../shared/theme/identity';
import { pdfModule } from '../../../native/pdfModule';

type Props = {
  route: any;
  navigation: any;
};

export default function HistorialClinico({ route, navigation }: Props) {
  const animalId = route?.params?.animalId || 0;

  // ── Lógica de carga existente — sin cambios ──────────────────────────
  const [showRegistrar, setShowRegistrar] = useState(false);
  const { eventos, loading, hasMore, cargarMas, recargar } = useHistorialClinico(animalId);

  // ── Exportación PDF ───────────────────────────────────────────────────
  const [exportando, setExportando] = useState(false);
  const [rutaExportada, setRutaExportada] = useState<string | null>(null);

  const exportarHistorialPdf = async () => {
    setExportando(true);
    try {
      const ruta = await pdfModule.generateHistorialPdf(animalId);
      setRutaExportada(ruta);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo exportar');
    } finally {
      setExportando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header — sin cambios */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Historial Clínico</Text>
      </View>

      {/* Botón exportar + confirmación de ruta — debajo del header */}
      <View style={styles.exportWrap}>
        <Pressable
          onPress={exportarHistorialPdf}
          disabled={exportando}
          style={[styles.btnExportar, exportando && { opacity: 0.6 }]}
        >
          {exportando
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.btnExportarTxt}>📄 Exportar PDF</Text>
          }
        </Pressable>

        {rutaExportada && (
          <Text style={styles.rutaText} numberOfLines={1}>
            PDF listo: {rutaExportada.split('/').pop()}
          </Text>
        )}
      </View>

      {/* Lista / estado vacío — sin cambios */}
      {eventos.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Sin historial clínico registrado</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <EventoClinicoCard evento={item} />}
          onEndReached={() => { if (hasMore) cargarMas(); }}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={recargar}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        />
      )}

      {/* FAB — sin cambios */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          try {
            if (navigation && typeof navigation.navigate === 'function') {
              navigation.navigate('NuevoEvento', { animalId });
              return;
            }
          } catch (e) {
            // fallthrough to local modal
          }
          setShowRegistrar(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {showRegistrar ? (
        <RegistrarEventoSanitario onBack={() => setShowRegistrar(false)} animalId={animalId} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },

  header: {
    backgroundColor: COLORS.primary,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
  },
  backTxt: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold },
  title: { color: '#fff', fontSize: 18, fontFamily: FONTS.bold },

  // Exportar PDF
  exportWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4ede6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnExportar: {
    backgroundColor: '#07612d',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnExportarTxt: {
    color: '#fff',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  rutaText: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#3a5e43',
  },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', fontFamily: FONTS.regular },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 24, fontFamily: FONTS.bold },
});
