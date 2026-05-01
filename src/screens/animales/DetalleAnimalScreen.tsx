import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel } from '../../types/Animal';

type DetalleAnimalScreenProps = {
  animal: AnimalModel;
  onBack: () => void;
  onEdit: (animal: AnimalModel) => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

export function DetalleAnimalScreen({
  animal,
  onBack,
  onEdit,
  onDeleted,
}: DetalleAnimalScreenProps) {
  const [currentAnimal, setCurrentAnimal] = useState<AnimalModel>(animal);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar animal',
      `Esta accion eliminara el animal con arete ${animal.arete}. ¿Deseas continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingDelete(true);
              await AnimalModule.deleteAnimal(animal.id);
              Alert.alert('Eliminado', 'El animal fue eliminado correctamente.');
              onDeleted();
            } catch (deleteError) {
              const message =
                deleteError instanceof Error
                  ? deleteError.message
                  : 'No se pudo eliminar el animal en este momento.';
              Alert.alert('Error', message);
            } finally {
              setLoadingDelete(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver al listado</Text>
        </Pressable>
        <Text style={styles.title}>Detalle del animal</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Arete</Text>
          <Text style={styles.value}>{currentAnimal.arete}</Text>

          <Text style={styles.label}>Estado</Text>
          <View style={styles.estadoRow}>
            <EstadoBadge estado={currentAnimal.estado} />
          </View>

          <Text style={styles.label}>Especie / Raza</Text>
          <Text style={styles.value}>{currentAnimal.especie}</Text>

          <Text style={styles.label}>Sexo</Text>
          <Text style={styles.value}>{currentAnimal.sexo}</Text>

          <Text style={styles.label}>Fecha de ingreso</Text>
          <Text style={styles.value}>{currentAnimal.fecha}</Text>

          {currentAnimal.fecha_baja ? (
            <>
              <Text style={styles.label}>Fecha de baja</Text>
              <Text style={styles.value}>{currentAnimal.fecha_baja}</Text>
            </>
          ) : null}

          {currentAnimal.motivo_baja ? (
            <>
              <Text style={styles.label}>Motivo / detalle baja</Text>
              <Text style={styles.value}>{currentAnimal.motivo_baja}</Text>
            </>
          ) : null}

          <Text style={styles.label}>Peso (kg)</Text>
          <Text style={styles.value}>{currentAnimal.peso ?? 'Sin registro'}</Text>
        </View>

        <Pressable style={styles.editButton} onPress={() => onEdit(currentAnimal)}>
          <Text style={styles.editButtonText}>Editar animal</Text>
        </Pressable>

        <Text style={styles.estadoHint}>Para marcar como fallecido, usa la pantalla Editar animal.</Text>

        <Pressable
          style={[styles.deleteButton, loadingDelete && styles.deleteButtonDisabled]}
          onPress={confirmDelete}
          disabled={loadingDelete}
        >
          <Text style={styles.deleteButtonText}>{loadingDelete ? 'Eliminando...' : 'Eliminar animal'}</Text>
        </Pressable>
      </View>
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
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#2f5d3a',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8edd8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  backText: {
    color: '#2f5d3a',
    fontWeight: '700',
  },
  title: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    padding: 14,
  },
  label: {
    marginTop: 10,
    color: '#5f6e5e',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 4,
    color: '#1c2b1d',
    fontWeight: '800',
    fontSize: 16,
  },
  estadoRow: {
    marginTop: 5,
  },
  editButton: {
    marginTop: 18,
    backgroundColor: '#0f6f35',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  estadoHint: {
    marginTop: 10,
    color: '#5b6b5d',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#be3434',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#be3434',
    fontWeight: '800',
    fontSize: 15,
  },
});
