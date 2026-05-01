import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AnimalFotoCaptura } from '../../components/animales/AnimalFotoCaptura';
import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, UpdateAnimalPayload } from '../../types/Animal';

const ESPECIES_OPTIONS = [
  'Holstein',
  'Suizo Pardo',
  'Jersey',
  'Brahman',
  'Angus',
  'Hereford',
  'Charolais',
  'Simmental',
  'Criollo',
  'Limousin',
];

const SEXO_OPTIONS = [
  { label: 'M', value: 'M' },
  { label: 'F', value: 'F' },
];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

type EditarAnimalScreenProps = {
  animal: AnimalModel;
  onBack: () => void;
  onSaved: () => void;
};

type EditFormState = {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  fotoPath: string | null;
  estado: 'ACTIVO' | 'FALLECIDO';
  fechaBaja: string;
  motivoBaja: string;
};

export function EditarAnimalScreen({ animal, onBack, onSaved }: EditarAnimalScreenProps) {
  const [form, setForm] = useState<EditFormState>({
    arete: animal.arete,
    especie: animal.especie,
    sexo: animal.sexo,
    fecha: animal.fecha,
    peso: animal.peso == null ? '' : String(Math.trunc(animal.peso)),
    fotoPath: null,
    estado: animal.estado === 'FALLECIDO' ? 'FALLECIDO' : 'ACTIVO',
    fechaBaja: animal.fecha_baja ?? '',
    motivoBaja: animal.motivo_baja ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  const canSubmit = useMemo(() => {
    if (form.estado === 'FALLECIDO') {
      return (
        form.especie.trim().length > 0 &&
        form.sexo.trim().length > 0 &&
        form.fecha.trim().length > 0 &&
        form.fechaBaja.trim().length > 0 &&
        form.motivoBaja.trim().length > 0
      );
    }
    return form.especie.trim().length > 0 && form.sexo.trim().length > 0 && form.fecha.trim().length > 0;
  }, [form]);

  const setField = (key: keyof EditFormState, value: string | null) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseCalendarDate = (year: number, month: number, day: number) => {
    return new Date(year, month, day);
  };

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(parseCalendarDate(year, month, day));
    }

    return cells;
  };

  const openCalendar = () => {
    setCalendarMonth(form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date());
    setDatePickerVisible(true);
  };

  const closeCalendar = () => setDatePickerVisible(false);

  const selectDate = (date: Date) => {
    setField('fecha', formatDate(date));
    setDatePickerVisible(false);
  };

  const goPreviousMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onGuardar = async () => {
    if (!canSubmit || loading) {
      return;
    }

    const payload: UpdateAnimalPayload = {
      id: animal.id,
      arete: animal.arete,
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: form.peso.trim().length === 0 ? null : Number(form.peso),
      foto_path: form.fotoPath,
    };

    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.updateAnimal(payload);

      if (animal.estado === 'ACTIVO' && form.estado === 'FALLECIDO') {
        await AnimalModule.changeEstado({
          id: animal.id,
          estado: 'FALLECIDO',
          fecha_baja: form.fechaBaja.trim(),
          motivo_baja: form.motivoBaja.trim(),
        });
      }

      Alert.alert('Actualizado', `Animal ${animal.arete} actualizado correctamente.`);
      onSaved();
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : 'No se pudo guardar los cambios del animal.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.title}>Editar Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Numero de Arete SINIIGA *</Text>
        <TextInput value={form.arete} style={[styles.input, styles.inputDisabled]} editable={false} />

        <Text style={styles.label}>Estado</Text>
        <View style={styles.estadoRow}>
          <EstadoBadge estado={form.estado} />
        </View>

        {animal.estado === 'ACTIVO' ? (
          <Pressable
            style={[styles.fallecidoToggle, form.estado === 'FALLECIDO' && styles.fallecidoToggleActive]}
            onPress={() =>
              setForm(prev => ({
                ...prev,
                estado: prev.estado === 'ACTIVO' ? 'FALLECIDO' : 'ACTIVO',
              }))
            }
          >
            <Text style={styles.fallecidoToggleText}>
              {form.estado === 'FALLECIDO' ? 'Quitar marca de fallecido' : 'Marcar como fallecido'}
            </Text>
          </Pressable>
        ) : null}

        {form.estado === 'FALLECIDO' ? (
          <>
            <Text style={styles.label}>Fecha de baja *</Text>
            <TextInput
              value={form.fechaBaja}
              onChangeText={value => setField('fechaBaja', value)}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />

            <Text style={styles.label}>Causa de fallecimiento *</Text>
            <TextInput
              value={form.motivoBaja}
              onChangeText={value => setField('motivoBaja', value)}
              placeholder="Describe la causa"
              style={styles.input}
            />
          </>
        ) : null}

        <Text style={styles.label}>Especie / Raza</Text>
        <View style={styles.chipWrap}>
          {ESPECIES_OPTIONS.map(option => {
            const selected = form.especie === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setField('especie', option)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.chipWrap}>
          {SEXO_OPTIONS.map(option => {
            const selected = form.sexo === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.sexChip, selected && styles.sexChipSelected]}
                onPress={() => setField('sexo', option.value)}
              >
                <Text style={[styles.sexChipText, selected && styles.sexChipTextSelected]}>
                  {option.value} ({option.label})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Fecha de ingreso</Text>
        <Pressable style={styles.dateField} onPress={openCalendar}>
          <Text style={[styles.dateFieldText, !form.fecha && styles.dateFieldPlaceholder]}>
            {form.fecha || 'Selecciona una fecha'}
          </Text>
          <Text style={styles.dateFieldIcon}>📅</Text>
        </Pressable>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', sanitizeDigits(value))}
          placeholder="Ej. 352"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>Fotografia del animal</Text>
        <AnimalFotoCaptura rutaLocal={form.fotoPath} onRutaLocalChange={rutaLocal => setField('fotoPath', rutaLocal)} />

        <Pressable
          onPress={onGuardar}
          disabled={!canSubmit || loading}
          style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>‹</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable onPress={goNextMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const isSelected = form.fecha === formatDate(day);
                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    onPress={() => selectDate(day)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarCloseButton} onPress={closeCalendar}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
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
    backgroundColor: '#f5f1e7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#2f5d3a',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e8edd8',
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
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: '#1c2b1d',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1c2b1d',
  },
  inputDisabled: {
    backgroundColor: '#ecefe6',
    color: '#5f6e5e',
  },
  estadoRow: {
    marginTop: 4,
  },
  fallecidoToggle: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c5d2c1',
    backgroundColor: '#ffffff',
    paddingVertical: 11,
    alignItems: 'center',
  },
  fallecidoToggleActive: {
    borderColor: '#9a2f2f',
    backgroundColor: '#fff4f4',
  },
  fallecidoToggleText: {
    color: '#344b36',
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  chipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  sexChip: {
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sexChipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  sexChipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  sexChipTextSelected: {
    color: '#ffffff',
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateFieldText: {
    color: '#1c2b1d',
    fontSize: 14,
  },
  dateFieldPlaceholder: {
    color: '#8b9784',
  },
  dateFieldIcon: {
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    color: '#0f6f35',
    fontSize: 22,
    fontWeight: '800',
  },
  calendarTitle: {
    color: '#1c2b1d',
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#6b7b67',
    fontWeight: '700',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#0f6f35',
  },
  dayText: {
    color: '#1c2b1d',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  calendarCloseButton: {
    marginTop: 14,
    backgroundColor: '#0f6f35',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  calendarCloseText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#2f5d3a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
