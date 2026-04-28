import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalSearchBar } from '../../components/animales/AnimalSearchBar';
import { useSearch } from '../../hooks/useSearch';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalEstado, AnimalModel } from '../../types/Animal';

type ListadoAnimalesScreenProps = {
  onBackHome: () => void;
  onCreateAnimal: () => void;
  onOpenDetail: (animalId: number) => void;
};

export function ListadoAnimalesScreen({
  onBackHome,
  onCreateAnimal,
  onOpenDetail,
}: ListadoAnimalesScreenProps) {
  const [estadoFiltro, setEstadoFiltro] = useState<AnimalEstado>('ACTIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useSearch(searchTerm);
  const [animals, setAnimals] = useState<AnimalModel[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const loadAnimals = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setError(null);
    setRefreshing(true);

    try {
      const rows = await AnimalModule.listAnimals();
      if (requestId !== requestIdRef.current) {
        return;
      }

      setAnimals(rows);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message =
        loadError instanceof Error ? loadError.message : 'No se pudo cargar el listado de animales.';
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAnimals();
  }, [loadAnimals]);

  const visibleAnimals = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return animals.filter(item => {
      const matchesEstado = item.estado === estadoFiltro;
      const matchesSearch =
        normalizedSearch.length === 0 || String(item.arete).toLowerCase().includes(normalizedSearch);

      return matchesEstado && matchesSearch;
    });
  }, [animals, estadoFiltro, debouncedSearch]);

  const onRefresh = useCallback(() => {
    void loadAnimals();
  }, [loadAnimals]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Listado de Animales</Text>
        <Text style={styles.subtitle}>Selecciona un animal para ver detalle, editar o eliminar.</Text>
      </View>

      <View style={styles.topActions}>
        <Pressable style={styles.primaryButton} onPress={onCreateAnimal}>
          <Text style={styles.primaryButtonText}>Registrar animal</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={onBackHome}>
          <Text style={styles.ghostButtonText}>Volver al inicio</Text>
        </Pressable>
      </View>

      <View style={styles.selectorWrap}>
        <AnimalSearchBar value={searchTerm} onSearch={setSearchTerm} />
        <Text style={styles.selectorTitle}>Filtrar por estado</Text>
        <View style={styles.selectorRow}>
          {(['ACTIVO', 'VENDIDO', 'FALLECIDO'] as AnimalEstado[]).map(estado => {
            const selected = estadoFiltro === estado;
            return (
              <Pressable
                key={estado}
                style={[styles.selectorChip, selected && styles.selectorChipSelected]}
                onPress={() => setEstadoFiltro(estado)}
              >
                <EstadoBadge estado={estado} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {initialLoading && animals.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2f5d3a" />
          <Text style={styles.centerStateText}>Cargando animales...</Text>
        </View>
      ) : null}

      {!initialLoading && error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!initialLoading && !error ? (
        <FlatList
          data={visibleAnimals}
          keyExtractor={item => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={visibleAnimals.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay animales registrados todavía.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.itemCard} onPress={() => onOpenDetail(item.id)}>
              <View>
                <Text style={styles.arete}>Arete: {item.arete}</Text>
                <Text style={styles.metaText}>Especie: {item.especie}</Text>
                <Text style={styles.metaText}>Sexo: {item.sexo}</Text>
                <Text style={styles.metaText}>Fecha ingreso: {item.fecha}</Text>
                <View style={styles.itemEstadoWrap}>
                  <EstadoBadge estado={item.estado} />
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1e7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#2f5d3a',
  },
  title: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#dbe9db',
    fontSize: 13,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  selectorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  selectorTitle: {
    color: '#485848',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d6ded0',
    padding: 4,
    backgroundColor: '#ffffff',
  },
  selectorChipSelected: {
    borderColor: '#2f5d3a',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0f6f35',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  ghostButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2f5d3a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#2f5d3a',
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerStateText: {
    marginTop: 10,
    color: '#506152',
    fontWeight: '600',
  },
  errorText: {
    color: '#c73d3d',
    textAlign: 'center',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#59655a',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arete: {
    color: '#1c2b1d',
    fontWeight: '800',
    fontSize: 15,
  },
  metaText: {
    marginTop: 2,
    color: '#4f5f50',
    fontWeight: '600',
    fontSize: 12,
  },
  itemEstadoWrap: {
    marginTop: 7,
  },
  chevron: {
    color: '#2f5d3a',
    fontSize: 26,
    fontWeight: '800',
  },
});
