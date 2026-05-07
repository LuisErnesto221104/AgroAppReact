import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EventoSanitarioItem } from '../../components/animales/EventoSanitarioItem';
import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, HistorialResumen } from '../../types/Animal';
import { RegistrarEventoSanitario } from '../sanitarios/RegistrarEventoSanitario';

const calcularTiempoEnRancho = (fechaIngreso: string | null | undefined): string => {
  if (!fechaIngreso) return 'Sin dato';
  const ingreso = new Date(fechaIngreso);
  const hoy = new Date();
  let años = hoy.getFullYear() - ingreso.getFullYear();
  let meses = hoy.getMonth() - ingreso.getMonth();
  let dias = hoy.getDate() - ingreso.getDate();
  if (dias < 0) {
    meses -= 1;
    dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  }
  if (meses < 0) { años -= 1; meses += 12; }
  if (años > 0) return meses > 0 ? `${años} año${años > 1 ? 's' : ''}, ${meses} mes${meses > 1 ? 'es' : ''}` : `${años} año${años > 1 ? 's' : ''}`;
  if (meses > 0) return `${meses} mes${meses > 1 ? 'es' : ''}`;
  return `${dias} día${dias !== 1 ? 's' : ''}`;
};

const formatSexo = (sexo: string | null | undefined) => {
  if (!sexo) {
    return 'Sin dato';
  }
  if (sexo === 'F') {
    return 'H';
  }
  return sexo;
};

type DetalleAnimalScreenProps = {
  animalId: number;
  refreshToken: number;
  onBack: () => void;
  onEdit: (animal: AnimalModel) => void;
  onDeleted: () => void;
  onOpenHistorial?: (animalId: number) => void;
};

export function DetalleAnimalScreen({ animalId, refreshToken, onBack, onEdit, onDeleted, onOpenHistorial }: DetalleAnimalScreenProps) {
  const [currentAnimal, setCurrentAnimal] = useState<AnimalModel | null>(null);
  const [historial, setHistorial] = useState<HistorialResumen>({
    historial_peso: [],
    eventos_recientes: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [showRegistrarEvento, setShowRegistrarEvento] = useState(false);


  const loadDetalle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPhotoLoadFailed(false);

    try {
      const [animal, historialResumen] = await Promise.all([
        AnimalModule.getAnimalById(animalId),
        AnimalModule.getHistorialResumen(animalId),
      ]);
      setCurrentAnimal(animal);
      setHistorial(historialResumen);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'No se pudo cargar el detalle del animal.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    void loadDetalle();
  }, [loadDetalle, refreshToken]);

  const photoSource = useMemo(() => {
    if (!currentAnimal?.foto || photoLoadFailed) {
      return null;
    }
    const raw = currentAnimal.foto.trim();
    if (!raw || raw === 'null' || raw === 'undefined') {
      return null;
    }
    const baseUri = raw.startsWith('file://') || raw.startsWith('content://') || raw.startsWith('http')
      ? raw
      : `file://${raw}`;
    return { uri: `${baseUri}?v=${refreshToken}` };
  }, [currentAnimal?.foto, photoLoadFailed, refreshToken]);

  const animalDisplayName = useMemo(() => {
    if (!currentAnimal) {
      return '';
    }
    return currentAnimal.especie?.trim() || `Animal #${currentAnimal.arete}`;
  }, [currentAnimal]);

  const onConfirmDelete = async () => {
    if (!currentAnimal) {
      return;
    }

    try {
      setLoadingDelete(true);
      await AnimalModule.deleteAnimal(currentAnimal.id);
      setDeleteModalVisible(false);
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0b6d33" />
          <Text style={styles.centerText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentAnimal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error ?? 'No se encontro el animal.'}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadDetalle()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
          <Pressable style={styles.backInlineButton} onPress={onBack}>
            <Text style={styles.backInlineText}>Volver al listado</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const eventosRecientes = historial.eventos_recientes.slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Detalle del Animal</Text>
          <Text style={styles.subtitle}>Arete: #{currentAnimal.arete}</Text>
        </View>

        <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.deleteLinkButton}>
          <Text style={styles.deleteLinkText}>Eliminar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryPhotoWrap}>
            {photoSource ? (
              <Image
                key={`${currentAnimal.id}-${currentAnimal.foto ?? 'nofoto'}-${refreshToken}`}
                source={photoSource}
                style={styles.summaryPhoto}
                resizeMode="cover"
                onError={() => setPhotoLoadFailed(true)}
              />
            ) : (
              <View style={styles.summaryPhotoFallback}>
                <Text style={styles.summaryPhotoFallbackText}>🐄</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryName}>{animalDisplayName}</Text>
            <Text style={styles.summaryArete}>#{currentAnimal.arete}</Text>
            <Text style={styles.summaryDate}>Ingreso: {currentAnimal.fecha}</Text>
          </View>

          <EstadoBadge estado={currentAnimal.estado} />
        </View>

        <Text style={styles.sectionTitle}>Datos Generales</Text>
        <View style={styles.generalCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Raza</Text>
              <Text style={styles.infoValue}>{currentAnimal.especie || 'Sin dato'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Sexo</Text>
              <Text style={styles.infoValue}>{formatSexo(currentAnimal.sexo)}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Peso Actual</Text>
              <Text style={styles.infoValue}>{currentAnimal.peso != null ? `${currentAnimal.peso} kg` : 'Sin registro'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValue}>{currentAnimal.estado}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Fecha de Ingreso</Text>
              <Text style={styles.infoValue}>{currentAnimal.fecha || 'Sin dato'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Tiempo en Rancho</Text>
              <Text style={styles.infoValue}>{calcularTiempoEnRancho(currentAnimal.fecha)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ultimos Eventos</Text>
        {eventosRecientes.length === 0 ? (
          <View style={styles.emptyEventsWrap}>
            <Text style={styles.emptyEventsText}>Sin registros aun</Text>
          </View>
        ) : (
          eventosRecientes.map(evento => <EventoSanitarioItem key={String(evento.id)} evento={evento} />)
        )}

        <Pressable onPress={() => onOpenHistorial ? onOpenHistorial(animalId) : Alert.alert('Historial', 'Vista completa de historial clínico: próximamente.') }>
          <Text style={styles.historialLink}>Ver historial clínico completo →</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable style={styles.outlineButton} onPress={() => onEdit(currentAnimal)}>
          <Text style={styles.outlineButtonText}>✏️ Editar Datos del Animal</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setShowRegistrarEvento(true)}
        >
          <Text style={styles.primaryButtonText}>Registrar Nuevo Evento</Text>
        </Pressable>
      </View>

      <Modal
        visible={showRegistrarEvento}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRegistrarEvento(false)}
      >
        <RegistrarEventoSanitario
          animalId={animalId}
          onBack={() => setShowRegistrarEvento(false)}
        />
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconWrap}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>

            <Text style={styles.modalTitle}>¿Eliminar Animal?</Text>
            <Text style={styles.modalText}>¿Eliminar a {animalDisplayName} (arete: {currentAnimal.arete})?</Text>
            <Text style={styles.modalTextMuted}>
              Esta acción eliminará también su historial, eventos sanitarios y gastos.
            </Text>

            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setDeleteModalVisible(false)}
              disabled={loadingDelete}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.modalDeleteButton, loadingDelete && styles.disabledButton]}
              onPress={() => void onConfirmDelete()}
              disabled={loadingDelete}
            >
              <Text style={styles.modalDeleteText}>
                {loadingDelete ? 'Eliminando...' : '🗑 Eliminar Definitivamente'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  header: {
    backgroundColor: '#0a6b33',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d5e8d8',
    marginTop: 2,
    fontWeight: '600',
    fontSize: 12,
  },
  deleteLinkButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  deleteLinkText: {
    color: '#ffd3d3',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    paddingBottom: 140,
  },
  summaryCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryPhotoWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: '#d8e2d8',
  },
  summaryPhoto: {
    width: '100%',
    height: '100%',
  },
  summaryPhotoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPhotoFallbackText: {
    fontSize: 20,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryName: {
    color: '#0b6d33',
    fontSize: 24,
    fontWeight: '900',
  },
  summaryArete: {
    color: '#1f2e1f',
    fontWeight: '700',
    marginTop: 2,
  },
  summaryDate: {
    color: '#8a8a8a',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: '#1d1d1d',
    fontSize: 22,
    fontWeight: '800',
  },
  generalCard: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCell: {
    flex: 1,
  },
  infoLabel: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#1c1c1c',
    fontWeight: '800',
    fontSize: 18,
  },
  infoDivider: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  emptyEventsWrap: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEventsText: {
    color: '#6d7c69',
    fontWeight: '700',
  },
  historialLink: {
    marginTop: 10,
    color: '#0567d9',
    fontWeight: '700',
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#0a6b33',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: '#0a6b33',
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: '#0a6b33',
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  warningIconWrap: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fde8eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    fontSize: 28,
  },
  modalTitle: {
    marginTop: 14,
    textAlign: 'center',
    color: '#1d1d1d',
    fontSize: 22,
    fontWeight: '900',
  },
  modalText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#5f5f5f',
    fontSize: 14,
  },
  modalTextMuted: {
    marginTop: 4,
    textAlign: 'center',
    color: '#8f8f8f',
    fontSize: 13,
  },
  modalCancelButton: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#2c2c2c',
    fontWeight: '700',
  },
  modalDeleteButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalDeleteText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    marginTop: 10,
    color: '#5b6d58',
    fontWeight: '700',
  },
  errorText: {
    color: '#c73d3d',
    textAlign: 'center',
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#0f6f35',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  backInlineButton: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f5d3a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backInlineText: {
    color: '#2f5d3a',
    fontWeight: '800',
  },
});
