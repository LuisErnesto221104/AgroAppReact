import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel } from '../../types/Animal';

type ListadoAnimalesScreenProps = {
  reloadToken: number;
  onBackHome: () => void;
  onCreateAnimal: () => void;
  onOpenDetail: (animal: AnimalModel) => void;
};

export function ListadoAnimalesScreen({
  reloadToken,
  onBackHome,
  onCreateAnimal,
  onOpenDetail,
}: ListadoAnimalesScreenProps) {
  const [animals, setAnimals] = useState<AnimalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAnimals = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await AnimalModule.listAnimals();
        if (!mounted) {
          return;
        }
        setAnimals(rows);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        const message =
          loadError instanceof Error ? loadError.message : 'No se pudo cargar el listado de animales.';
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAnimals();

    return () => {
      mounted = false;
    };
  }, [reloadToken]);

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

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2f5d3a" />
          <Text style={styles.centerStateText}>Cargando animales...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={animals}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={animals.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay animales registrados todavía.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.itemCard} onPress={() => onOpenDetail(item)}>
              <View>
                <Text style={styles.arete}>Arete: {item.arete}</Text>
                <Text style={styles.metaText}>Especie: {item.especie}</Text>
                <Text style={styles.metaText}>Sexo: {item.sexo}</Text>
                <Text style={styles.metaText}>Fecha ingreso: {item.fecha}</Text>
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
    paddingBottom: 8,
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
  chevron: {
    color: '#2f5d3a',
    fontSize: 26,
    fontWeight: '800',
  },
});
