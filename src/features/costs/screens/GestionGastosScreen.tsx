import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { NativeModules } from 'react-native';

import { GastoModel, CATEGORIA_GASTO_LABELS, CATEGORIA_COLORES } from '../../../types/Costos';
import { CostosModule } from '../../../native/CostosModule';
import { FiltroGastosModal, FiltroGastosParams } from '../components/FiltroGastosModal';

const { AgroBridgeModule, AnimalModule } = NativeModules;

interface AnimalRef {
  id: number;
  arete: string;
}

interface GestionGastosScreenProps {
  onBack: () => void;
  onNewGasto: () => void;
  onEditGasto: (gastoId: number) => void;
}

export function GestionGastosScreen({
  onBack,
  onNewGasto,
  onEditGasto,
}: GestionGastosScreenProps) {
  const [gastos, setGastos]         = useState<GastoModel[]>([]);
  const [animales, setAnimales]     = useState<AnimalRef[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filtroVisible, setFiltroVisible] = useState(false);
  const [filtros, setFiltros] = useState<FiltroGastosParams>({
    fechaDesde: null,
    fechaHasta: null,
    categoria:  null,
  });

  const filtrosActivos =
    filtros.fechaDesde !== null ||
    filtros.fechaHasta !== null ||
    filtros.categoria  !== null;

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarAnimales = useCallback(async () => {
    try {
      const resultado = await AnimalModule.listAnimals();
      if (resultado && Array.isArray(resultado)) {
        setAnimales(resultado.map((a: any) => ({ id: a.id, arete: a.arete })));
      }
    } catch {
      // Si falla simplemente mostramos el ID
    }
  }, []);

  const cargarGastos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CostosModule.getGastosFiltrados(
        filtros.fechaDesde,
        filtros.fechaHasta,
        filtros.categoria,
      );
      setGastos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    void cargarAnimales();
  }, [cargarAnimales]);

  useEffect(() => {
    void cargarGastos();
  }, [cargarGastos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([cargarGastos(), cargarAnimales()]);
    setRefreshing(false);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getAreteAnimal = (animalId: number | null | undefined): string | null => {
    if (!animalId || animalId <= 0) return null;
    return animales.find(a => a.id === animalId)?.arete ?? null;
  };

  const formatoMoneda = (monto: number) =>
    new Intl.NumberFormat('es-MX', {
      style:                 'currency',
      currency:              'MXN',
      minimumFractionDigits: 2,
    }).format(monto);

  // ── Eliminar ──────────────────────────────────────────────────────────────

  const confirmarEliminar = (gasto: GastoModel) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar gasto: ${gasto.descripcion}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarGasto(gasto.id) },
      ],
    );
  };

  const eliminarGasto = async (id: number) => {
    try {
      await AgroBridgeModule.deleteGasto(id);
      Alert.alert('Éxito', 'Gasto eliminado');
      await cargarGastos();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Error al eliminar el gasto');
    }
  };

  // ── Render de tarjeta ─────────────────────────────────────────────────────

  const renderGasto = ({ item }: { item: GastoModel }) => (
    <View style={styles.gastoCard}>
      <View style={styles.gastoHeader}>
        <View style={styles.gastoInfo}>
          <Text style={styles.categoria} numberOfLines={1}>
            {CATEGORIA_GASTO_LABELS[item.categoria]}
          </Text>
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
          {item.animalId && item.animalId > 0 ? (
            <Text style={styles.animal}>
              🐄 Arete: {getAreteAnimal(item.animalId) ?? `#${item.animalId}`}
            </Text>
          ) : (
            <Text style={styles.animal}>📋 Gasto General</Text>
          )}
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>

        <View style={[styles.montoBadge, { backgroundColor: CATEGORIA_COLORES[item.categoria] }]}>
          <Text style={styles.montoText}>{formatoMoneda(item.monto)}</Text>
        </View>
      </View>

      {item.notas && <Text style={styles.notas}>{item.notas}</Text>}

      <View style={styles.gastoActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEditGasto(item.id)}>
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmarEliminar(item)}>
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Resumen ───────────────────────────────────────────────────────────────

  const totalGastos      = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosGenerales  = gastos.filter(g => !g.animalId || g.animalId <= 0);
  const gastosPorAnimal  = gastos.filter(g => g.animalId && g.animalId > 0);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading && gastos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#07612d" />
      </View>
    );
  }

  // ── UI principal ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonWrap}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Gestión de Gastos</Text>

        {/* Botón filtrar con badge */}
        <Pressable
          style={({ pressed }) => [styles.filtrarBtn, pressed && { opacity: 0.7 }]}
          onPress={() => setFiltroVisible(true)}
        >
          <Text style={styles.filtrarBtnText}>⊿ Filtrar</Text>
          {filtrosActivos && <View style={styles.filtrosBadge} />}
        </Pressable>
      </View>

      {/* Banner de filtros activos */}
      {filtrosActivos && (
        <View style={styles.filtrosBanner}>
          <Text style={styles.filtrosBannerText}>
            {[
              filtros.categoria    && `Categoría: ${CATEGORIA_GASTO_LABELS[filtros.categoria]}`,
              filtros.fechaDesde   && `Desde: ${filtros.fechaDesde}`,
              filtros.fechaHasta   && `Hasta: ${filtros.fechaHasta}`,
            ]
              .filter(Boolean)
              .join('  ·  ')}
          </Text>
          <Pressable
            onPress={() => setFiltros({ fechaDesde: null, fechaHasta: null, categoria: null })}
          >
            <Text style={styles.filtrosBannerLimpiar}>Limpiar ✕</Text>
          </Pressable>
        </View>
      )}

      {/* Resumen */}
      <View style={styles.resumeContainer}>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>Total Invertido</Text>
          <Text style={styles.resumeValue}>{formatoMoneda(totalGastos)}</Text>
        </View>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>Registros</Text>
          <Text style={styles.resumeValue}>{gastos.length}</Text>
        </View>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>General / Animal</Text>
          <Text style={styles.resumeValue}>
            {gastosGenerales.length} / {gastosPorAnimal.length}
          </Text>
        </View>
      </View>

      {/* Lista */}
      {gastos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{filtrosActivos ? '🔍' : '📭'}</Text>
          <Text style={styles.emptyTitle}>
            {filtrosActivos ? 'Sin resultados' : 'Sin gastos registrados'}
          </Text>
          <Text style={styles.emptyDescription}>
            {filtrosActivos
              ? 'No hay gastos que coincidan con los filtros aplicados.'
              : 'Toca el botón + para registrar tu primer gasto'}
          </Text>
          {!filtrosActivos && (
            <TouchableOpacity style={styles.emptyButton} onPress={onNewGasto}>
              <Text style={styles.emptyButtonText}>Registrar Gasto</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={gastos}
          renderItem={renderGasto}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          style={styles.list}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onNewGasto}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Overlay de carga para recargas parciales (cambio de filtros) */}
      {loading && gastos.length > 0 && (
        <ActivityIndicator size="large" color="#07612d" style={styles.loaderOverlay} />
      )}

      {/* Modal de filtros */}
      <FiltroGastosModal
        visible={filtroVisible}
        onClose={() => setFiltroVisible(false)}
        onAplicar={f => { setFiltros(f); setFiltroVisible(false); }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },

  // Header
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonWrap: {
    paddingVertical:   6,
    paddingHorizontal: 12,
    borderRadius:      999,
    backgroundColor:   '#e8f5ec',
    marginRight:       12,
  },
  backButtonText: {
    fontSize:    14,
    color:       '#07612d',
    fontFamily:  'Poppins-SemiBold',
    fontWeight:  '700',
  },
  title: {
    fontSize:   20,
    fontFamily: 'Poppins-Bold',
    color:      '#1a1a1a',
    flex:       1,
  },
  filtrarBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical:   7,
    paddingHorizontal: 12,
    borderRadius:    999,
    backgroundColor: '#e8f5ec',
    borderWidth:     1,
    borderColor:     '#c8dece',
  },
  filtrarBtnText: {
    fontSize:   13,
    color:      '#07612d',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
  },
  filtrosBadge: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: '#e53935',
    marginLeft:      5,
  },

  // Banner filtros activos
  filtrosBanner: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   8,
    backgroundColor:   '#e8f5ec',
    borderBottomWidth: 1,
    borderBottomColor: '#c8dece',
  },
  filtrosBannerText: {
    flex:       1,
    fontSize:   11,
    fontFamily: 'Poppins-Regular',
    color:      '#07612d',
  },
  filtrosBannerLimpiar: {
    fontSize:   11,
    fontFamily: 'Poppins-SemiBold',
    color:      '#e53935',
    marginLeft: 8,
  },

  // Resumen
  resumeContainer: {
    flexDirection:   'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap:             12,
  },
  resumeBox: {
    flex:            1,
    backgroundColor: 'white',
    borderRadius:    8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     '#e0e0e0',
  },
  resumeLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#999', marginBottom: 4 },
  resumeValue: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#07612d' },

  // Lista
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 160 },

  // Tarjeta de gasto
  gastoCard: {
    backgroundColor: 'white',
    borderRadius:    12,
    marginBottom:    12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth:     1,
    borderColor:     '#e0e0e0',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    3,
    elevation:       2,
  },
  gastoHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   8,
  },
  gastoInfo:   { flex: 1, marginRight: 12 },
  categoria:   { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#666', marginBottom: 4 },
  descripcion: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1a1a1a', marginBottom: 6 },
  animal:      { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#07612d', marginBottom: 4 },
  fecha:       { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#999' },
  montoBadge: {
    paddingHorizontal: 12,
    paddingVertical:   8,
    borderRadius:      8,
    justifyContent:    'center',
    alignItems:        'center',
    minWidth:          80,
  },
  montoText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: 'white' },
  notas: {
    fontSize:          12,
    fontFamily:        'Poppins-Regular',
    color:             '#666',
    fontStyle:         'italic',
    marginBottom:      8,
    paddingVertical:   8,
    paddingHorizontal: 8,
    backgroundColor:   '#f9f9f9',
    borderRadius:      6,
    borderLeftWidth:   3,
    borderLeftColor:   '#07612d',
  },
  gastoActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editButton: {
    flex:            1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius:    10,
    alignItems:      'center',
  },
  editButtonText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: 'white' },
  deleteButton: {
    flex:            1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius:    10,
    alignItems:      'center',
  },
  deleteButtonText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: 'white' },

  // FAB
  fab: {
    position:        'absolute',
    bottom:          84,
    right:           24,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#07612d',
    justifyContent:  'center',
    alignItems:      'center',
    elevation:       5,
  },
  fabText: { fontSize: 28, fontFamily: 'Poppins-Bold', color: 'white' },

  // Vacío
  emptyContainer: {
    flex:              1,
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 24,
  },
  emptyIcon:        { fontSize: 48, marginBottom: 16 },
  emptyTitle:       { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  emptyDescription: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#666', textAlign: 'center', marginBottom: 24 },
  emptyButton: {
    backgroundColor:   '#07612d',
    paddingVertical:   12,
    paddingHorizontal: 24,
    borderRadius:      8,
  },
  emptyButtonText: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: 'white' },
});
