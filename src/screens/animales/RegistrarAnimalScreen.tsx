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
import { AnimalModule } from '../../native/AnimalModule';
import type { AnimalFormState, InsertAnimalPayload } from '../../types/Animal';
import { validateArete } from '../../utils/validaciones/areteValidator';

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
  { label: 'Macho', value: 'M' },
  { label: 'Hembra', value: 'H' },
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

type RegistrarAnimalScreenProps = {
  onBack: () => void;
  onSuccess?: () => void;
};

const INITIAL_FORM_STATE: AnimalFormState = {
  arete: '',
  especie: ESPECIES_OPTIONS[0],
  sexo: SEXO_OPTIONS[0].value,
  fecha: '',
  peso: '',
  fotoPath: null,
  precioCompra: '',
  nacioEnRancho: false,
};

export function RegistrarAnimalScreen({ onBack, onSuccess }: RegistrarAnimalScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const submittingRef = React.useRef(false);
  const [areteError, setAreteError] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  const canSubmit = useMemo(() => {
    const areteValidation = validateArete(form.arete);
    return (
      areteValidation.valid &&
      form.especie.trim().length > 0 &&
      form.sexo.trim().length > 0 &&
      form.fecha.trim().length > 0
    );
  }, [form]);

  const setField = (key: keyof AnimalFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate.getTime() > today.getTime();
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
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fecha', formatDate(date));
    setDatePickerVisible(false);
  };

  const goPreviousMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const isAtCurrentMonth = () => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() > now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() >= now.getMonth())
    );
  };

  const goNextMonth = () => {
    if (isAtCurrentMonth()) {
      return;
    }
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onAreteChange = (value: string) => {
    setField('arete', value);
    const result = validateArete(value);
    setAreteError(result.errorMsg);
  };

  const buildPayload = (): InsertAnimalPayload => {
    const pesoValue = form.peso.trim();
    const precioValue = form.precioCompra.trim();
    return {
      arete: form.arete.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: pesoValue.length > 0 ? Number(pesoValue) : null,
      foto_path: form.fotoPath,
      precio_compra: form.nacioEnRancho ? 0 : (precioValue.length > 0 ? Number(precioValue) : 0),
    };
  };

  const onRegistrar = async () => {
    if (!canSubmit || loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    const areteValidation = validateArete(form.arete);
    if (!areteValidation.valid) {
      setAreteError(areteValidation.errorMsg);
      return;
    }

    setAreteError(null);

    const payload = buildPayload();
    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.insertAnimal(payload);
      Alert.alert('Registro exitoso', `Animal con arete ${payload.arete} registrado.`);
      setForm(INITIAL_FORM_STATE);
      setAreteError(null);
      onSuccess?.();
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : null;

      if (errorCode === 'ERR_ARETE_EMPTY') {
        setAreteError('El numero de arete es obligatorio.');
        return;
      }

      if (errorCode === 'ERR_ARETE_FORMAT') {
        setAreteError('El arete debe tener 10 digitos y no puede iniciar en 0.');
        return;
      }

      if (errorCode === 'ERR_ARETE_DUPLICATE') {
        setAreteError('El arete ya existe en el registro SINIIGA.');
        return;
      }

      const message = error instanceof Error ? error.message : 'No se pudo registrar el animal.';
      Alert.alert('Error de registro', message);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Numero de Arete SINIIGA *</Text>
        <TextInput
          value={form.arete}
          onChangeText={value => onAreteChange(sanitizeDigits(value))}
          placeholder="0013482956"
          style={[styles.input, areteError ? styles.inputError : undefined]}
          keyboardType="number-pad"
          maxLength={10}
        />
        {areteError ? <Text style={styles.errorText}>{areteError}</Text> : null}

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
          placeholder="Ej. 352.7"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>Precio de compra</Text>
        <View style={styles.origenContainer}>
          <Pressable
            style={[styles.origenChip, form.nacioEnRancho && styles.origenChipSelected]}
            onPress={() => setForm(prev => ({ ...prev, nacioEnRancho: true, precioCompra: '' }))}
          >
            <Text style={[styles.origenChipText, form.nacioEnRancho && styles.origenChipTextSelected]}>
              Nació en el rancho ($0)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.origenChip, !form.nacioEnRancho && styles.origenChipSelected]}
            onPress={() => setForm(prev => ({ ...prev, nacioEnRancho: false }))}
          >
            <Text style={[styles.origenChipText, !form.nacioEnRancho && styles.origenChipTextSelected]}>
              Comprado
            </Text>
          </Pressable>
        </View>
        {!form.nacioEnRancho && (
          <View style={styles.precioRow}>
            <Text style={styles.precioSimbolo}>$</Text>
            <TextInput
              value={form.precioCompra}
              onChangeText={value => setField('precioCompra', value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              style={styles.precioInput}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        <Text style={styles.label}>Fotografia del animal</Text>
        <AnimalFotoCaptura
          rutaLocal={form.fotoPath}
          onRutaLocalChange={rutaLocal => setForm(prev => ({ ...prev, fotoPath: rutaLocal }))}
        />

        <Pressable
          onPress={onRegistrar}
          disabled={!canSubmit || loading}
          style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
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
              <Pressable
                onPress={goNextMonth}
                style={[styles.calendarNavButton, isAtCurrentMonth() && styles.calendarNavButtonDisabled]}
                disabled={isAtCurrentMonth()}
              >
                <Text style={[styles.calendarNavText, isAtCurrentMonth() && styles.calendarNavTextDisabled]}>›</Text>
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
                const isDisabled = isFutureDate(day);
                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isDisabled && styles.dayCellDisabled]}
                    onPress={() => selectDate(day)}
                    disabled={isDisabled}
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
  inputError: {
    borderColor: '#d23d3d',
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
  errorText: {
    marginTop: 6,
    color: '#d23d3d',
    fontSize: 12,
    fontWeight: '600',
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
  calendarNavButtonDisabled: {
    opacity: 0.3,
  },
  calendarNavTextDisabled: {
    color: '#aaaaaa',
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
  dayCellDisabled: {
    opacity: 0.35,
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
  origenContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  origenChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  origenChipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  origenChipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 12,
  },
  origenChipTextSelected: {
    color: '#ffffff',
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
  },
  precioSimbolo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f6f35',
    marginRight: 6,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#1c2b1d',
    fontSize: 15,
  },
});
