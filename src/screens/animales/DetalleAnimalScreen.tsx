import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel } from '../../types/Animal';

type DetalleAnimalScreenProps = {
  animal: AnimalModel;
  onBack: () => void;
  onEdit: (animal: AnimalModel) => void;
  onDeleted: () => void;
};

export function DetalleAnimalScreen({ animal, onBack, onEdit, onDeleted }: DetalleAnimalScreenProps) {
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
          <Text style={styles.value}>{animal.arete}</Text>

          <Text style={styles.label}>Especie / Raza</Text>
          <Text style={styles.value}>{animal.especie}</Text>

          <Text style={styles.label}>Sexo</Text>
          <Text style={styles.value}>{animal.sexo}</Text>

          <Text style={styles.label}>Fecha de ingreso</Text>
          <Text style={styles.value}>{animal.fecha}</Text>

          <Text style={styles.label}>Peso (kg)</Text>
          <Text style={styles.value}>{animal.peso ?? 'Sin registro'}</Text>
        </View>

        <Pressable style={styles.editButton} onPress={() => onEdit(animal)}>
          <Text style={styles.editButtonText}>Editar animal</Text>
        </Pressable>

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
