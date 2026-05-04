import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from 'react-native';

import { useEventoSanitario } from '../../hooks/useEventoSanitario';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { TipoEvento } from '../../types/Sanitario';

const TIPOS_EVENTO = Object.values(TipoEvento);
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

type RegistrarEventoSanitarioProps = {
  onBack: () => void;
  animalId?: number;
};

type FormState = {
  animalIdInput: string;
  tipoEvento: TipoEvento;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
};

const INITIAL_FORM: FormState = {
  animalIdInput: '',
  tipoEvento: TipoEvento.VACUNA,
  descripcion: '',
  veterinario: '',
  dosis: '',
  observaciones: '',
  fechaEvento: '',
  fechaProximoEvento: '',
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const normalizeToday = (date: Date) => {
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  return candidate;
};

const validateInline = (form: FormState, animalIdResolved: number | null) => {
  const errors: Partial<Record<keyof FormState | 'general', string>> = {};

  if (!animalIdResolved || animalIdResolved <= 0) {
    errors.animalIdInput = 'Ingresa un arete valido.';
  }

  if (!TIPOS_EVENTO.includes(form.tipoEvento)) {
    errors.tipoEvento = 'Selecciona un tipo valido.';
  }

  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripcion es obligatoria.';
  }

  if (!form.fechaEvento) {
    errors.fechaEvento = 'Selecciona la fecha del evento.';
  }

  if (!form.fechaProximoEvento) {
    errors.fechaProximoEvento = 'Selecciona la proxima fecha.';
  }

  if (form.fechaEvento && form.fechaProximoEvento) {
    const fechaEvento = parseDate(form.fechaEvento);
    const fechaProximo = parseDate(form.fechaProximoEvento);
    const today = normalizeToday(new Date());

    if (fechaEvento.getTime() > today.getTime()) {
      errors.fechaEvento = 'La fecha no puede ser futura.';
    }

    if (fechaProximo.getTime() < fechaEvento.getTime()) {
      errors.fechaProximoEvento = 'La fecha proxima debe ser mayor o igual a la inicial.';
    }
  }

  return errors;
};

export function RegistrarEventoSanitario({ onBack, animalId }: RegistrarEventoSanitarioProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    animalIdInput: animalId ? String(animalId) : '',
  }));
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState | 'general', string>>>({});
  const [calendarTarget, setCalendarTarget] = useState<'fechaEvento' | 'fechaProximoEvento' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [listVisible, setListVisible] = useState(false);

  const { loading, error, eventos, registrar, listar } = useEventoSanitario();

  const animalIdResolved = useMemo(() => {
    const raw = animalId ?? Number.parseInt(form.animalIdInput, 10);
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  }, [animalId, form.animalIdInput]);

  useEffect(() => {
    if (!animalIdResolved) {
      return;
    }

    void listar(animalIdResolved).then(() => {
      setListVisible(true);
    }).catch(() => {
      setListVisible(false);
    });
  }, [animalIdResolved, listar]);

  const setField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const openCalendar = (target: 'fechaEvento' | 'fechaProximoEvento') => {
    const currentValue = form[target];
    setCalendarMonth(currentValue ? parseDate(currentValue) : new Date());
    setCalendarTarget(target);
  };

  const closeCalendar = () => setCalendarTarget(null);

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const isFutureDate = (date: Date) => {
    const today = normalizeToday(new Date());
    return normalizeToday(date).getTime() > today.getTime();
  };

  const canGoNextMonth = () => {
    if (calendarTarget === 'fechaProximoEvento') {
      return true;
    }

    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const selectDate = (date: Date) => {
    if (!calendarTarget) {
      return;
    }

    if (calendarTarget === 'fechaEvento' && isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'La fecha del evento no puede ser futura.');
      return;
    }

    setField(calendarTarget, formatDate(date));
    setCalendarTarget(null);
  };

  const onSubmit = async () => {
    const errors = validateInline(form, animalIdResolved);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || !animalIdResolved) {
      return;
    }

    try {
      await registrar({
        animalId: animalIdResolved,
        tipoEvento: form.tipoEvento,
        descripcion: form.descripcion.trim(),
        veterinario: form.veterinario.trim(),
        dosis: form.dosis.trim(),
        observaciones: form.observaciones.trim(),
        fechaEvento: form.fechaEvento,
        fechaProximoEvento: form.fechaProximoEvento,
      });

      Alert.alert('Guardado', 'El evento sanitario fue registrado correctamente.');
      setForm(prev => ({
        ...INITIAL_FORM,
        animalIdInput: animalId ? String(animalId) : prev.animalIdInput,
      }));

      if (animalIdResolved) {
        await listar(animalIdResolved);
        setListVisible(true);
      }
    } catch {
      // El estado del hook ya refleja el error.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Evento Sanitario</Text>
        <Text style={styles.subtitle}>Vacunas, desparasitaciones y seguimiento clínico.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!animalId ? (
          <View style={styles.card}>
            <Text style={styles.label}>Arete</Text>
            <TextInput
              value={form.animalIdInput}
              onChangeText={value => setField('animalIdInput', value.replace(/\s/g, ''))}
              placeholder="Ingresa el arete"
              keyboardType="default"
              onFocus={() => setFocusedField('animalIdInput')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                fieldErrors.animalIdInput ? styles.inputError : undefined,
                focusedField === 'animalIdInput' && styles.inputFocused,
              ]}
            />
            {fieldErrors.animalIdInput ? <Text style={styles.errorText}>{fieldErrors.animalIdInput}</Text> : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de evento</Text>
          <View style={styles.chipsRow}>
            {TIPOS_EVENTO.map(tipo => {
              const selected = form.tipoEvento === tipo;
              return (
                <Pressable
                  key={tipo}
                  onPress={() => setField('tipoEvento', tipo)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{tipo}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Descripcion *</Text>
          <TextInput
            value={form.descripcion}
            onChangeText={value => setField('descripcion', value)}
            placeholder="Descripcion del evento"
            onFocus={() => setFocusedField('descripcion')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.input,
              fieldErrors.descripcion ? styles.inputError : undefined,
              focusedField === 'descripcion' && styles.inputFocused,
            ]}
            multiline
          />
          {fieldErrors.descripcion ? <Text style={styles.errorText}>{fieldErrors.descripcion}</Text> : null}

          <Text style={styles.label}>Veterinario</Text>
          <TextInput
            value={form.veterinario}
            onChangeText={value => setField('veterinario', value)}
            placeholder="Nombre del veterinario"
            onFocus={() => setFocusedField('veterinario')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'veterinario' && styles.inputFocused]}
          />

          <Text style={styles.label}>Dosis</Text>
          <TextInput
            value={form.dosis}
            onChangeText={value => setField('dosis', value)}
            placeholder="Ej. 5 ml"
            onFocus={() => setFocusedField('dosis')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'dosis' && styles.inputFocused]}
          />

          <Text style={styles.label}>Observaciones</Text>
          <TextInput
            value={form.observaciones}
            onChangeText={value => setField('observaciones', value)}
            placeholder="Notas adicionales"
            onFocus={() => setFocusedField('observaciones')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'observaciones' && styles.inputFocused]}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Fecha del evento</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaEvento')}
          >
            <Text style={[styles.dateText, !form.fechaEvento && styles.datePlaceholder]}>
              {form.fechaEvento || 'Seleccionar fecha'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>
          {fieldErrors.fechaEvento ? <Text style={styles.errorText}>{fieldErrors.fechaEvento}</Text> : null}

          <Text style={styles.label}>Fecha proxima</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaProximoEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaProximoEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaProximoEvento')}
          >
            <Text style={[styles.dateText, !form.fechaProximoEvento && styles.datePlaceholder]}>
              {form.fechaProximoEvento || 'Seleccionar fecha'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>
          {fieldErrors.fechaProximoEvento ? (
            <Text style={styles.errorText}>{fieldErrors.fechaProximoEvento}</Text>
          ) : null}
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Programar Recordatorio</Text>
            <Text style={styles.reminderHint}>(Al día de la próxima dosis)</Text>
          </View>
          <View style={styles.reminderToggleWrap}>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ true: COLORS.primary, false: '#d0d0d0' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {error || fieldErrors.general ? (
          <Text style={styles.errorBanner}>{error ?? fieldErrors.general}</Text>
        ) : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.saveButton, (pressed || loading) && styles.saveButtonPressed]}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Evento Sanitario'}</Text>
        </Pressable>

        {listVisible && animalIdResolved ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Eventos registrados</Text>
            {eventos.length === 0 ? (
              <Text style={styles.emptyText}>Aun no hay eventos para este animal.</Text>
            ) : (
              eventos.map(evento => (
                <View key={String(evento.id)} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{evento.tipoEvento}</Text>
                  <Text style={styles.eventBody}>{evento.descripcion || 'Sin descripcion'}</Text>
                  <Text style={styles.eventMeta}>{evento.fechaEvento}</Text>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={calendarTarget != null} transparent animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                style={styles.calendarNavButton}
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </Pressable>
              <Text style={styles.calendarTitleText}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => {
                  if (canGoNextMonth()) {
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                  }
                }}
                style={[styles.calendarNavButton, !canGoNextMonth() && styles.calendarNavButtonDisabled]}
              >
                <Text style={[styles.calendarNavText, !canGoNextMonth() && styles.calendarNavTextDisabled]}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const disableDay = calendarTarget === 'fechaEvento' && isFutureDate(day);

                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, disableDay && styles.dayCellDisabled]}
                    disabled={disableDay}
                    onPress={() => selectDate(day)}
                  >
                    <Text style={styles.dayCellText}>{day.getDate()}</Text>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
  },
  backText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  title: {
    marginTop: 14,
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    marginTop: 4,
    color: '#d9eadc',
    fontFamily: FONTS.regular,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  label: {
    marginBottom: 6,
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9e1d8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    marginBottom: 12,
    backgroundColor: '#fbfcfa',
  },
  inputError: {
    borderColor: '#c84141',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c8d5c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f6f8f3',
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#d9e1d8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fbfcfa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    color: COLORS.black,
    fontFamily: FONTS.regular,
  },
  datePlaceholder: {
    color: '#8b9889',
  },
  dateIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#c84141',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    marginBottom: 10,
  },
  errorBanner: {
    color: '#9d2f2f',
    backgroundColor: '#fdeeee',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontFamily: FONTS.semiBold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  sectionTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    color: '#667066',
    fontFamily: FONTS.regular,
  },
  eventItem: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#f5f9f3',
    marginBottom: 10,
  },
  eventTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  eventBody: {
    marginTop: 3,
    color: COLORS.black,
    fontFamily: FONTS.regular,
  },
  eventMeta: {
    marginTop: 4,
    color: '#6c7869',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2e9',
  },
  calendarNavButtonDisabled: {
    opacity: 0.35,
  },
  calendarNavText: {
    color: COLORS.primary,
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  calendarNavTextDisabled: {
    color: '#8a9387',
  },
  calendarTitleText: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#788277',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: 12,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  calendarCloseButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calendarCloseText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
  },
  reminderCard: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e6efe6',
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderLabel: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  reminderHint: {
    color: '#7a8b7a',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  reminderToggleWrap: {
    marginLeft: 12,
  },
  saveButtonFull: {
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 999,
  },
});