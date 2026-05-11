import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { NativeModules } from 'react-native';
import { GastoModel, CATEGORIA_GASTO_LABELS, CATEGORIA_COLORES } from '../../../types/Costos';

const { AgroBridgeModule } = NativeModules;

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
  const [gastos, setGastos] = useState<GastoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const resultado = await AgroBridgeModule.obtenerTodosGastos();
      if (resultado && Array.isArray(resultado)) {
        setGastos(resultado);
      }
    } catch (error) {
      console.error('Error cargando gastos:', error);
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarGastos();
    setRefreshing(false);
  };

  const confirmarEliminar = (gasto: GastoModel) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar gasto: ${gasto.descripcion}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarGasto(gasto.id),
        },
      ]
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

  const formatoMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(monto);
  };

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
          {item.animalId && item.animalId > 0 && (
            <Text style={styles.animal}>🐄 Animal ID: {item.animalId}</Text>
          )}
          {!item.animalId && (
            <Text style={styles.animal}>📋 Gasto General</Text>
          )}
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>

        <View style={[styles.montoBadge, { backgroundColor: CATEGORIA_COLORES[item.categoria] }]}>
          <Text style={styles.montoText}>{formatoMoneda(item.monto)}</Text>
        </View>
      </View>

      {item.notas && (
        <Text style={styles.notas}>{item.notas}</Text>
      )}

      <View style={styles.gastoActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEditGasto(item.id)}
        >
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmarEliminar(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosGenerales = gastos.filter(g => !g.animalId || g.animalId <= 0);
  const gastosPorAnimal = gastos.filter(g => g.animalId && g.animalId > 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>⏳ Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Gastos</Text>
      </View>

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

      {/* Lista de gastos */}
      {gastos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
          <Text style={styles.emptyDescription}>
            Toca el botón + para registrar tu primer gasto
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onNewGasto}>
            <Text style={styles.emptyButtonText}>Registrar Gasto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gastos}
          renderItem={renderGasto}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          scrollEnabled
          style={styles.list}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onNewGasto}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    color: '#07612d',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    flex: 1,
  },
  resumeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resumeBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resumeLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 4,
  },
  resumeValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gastoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  gastoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gastoInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoria: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  animal: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#07612d',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  montoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  montoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  notas: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#07612d',
  },
  gastoActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#07612d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#07612d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
