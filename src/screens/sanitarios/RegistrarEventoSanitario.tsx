import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ActivityIndicator,
  NativeModules,
} from 'react-native';

import { useEventoSanitario } from '../../hooks/useEventoSanitario';
import { AnimalModule } from '../../native/AnimalModule';
import { programarNotificacionEvento } from '../../shared/services/notificacionSanitaria';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { TipoEvento } from '../../types/Sanitario';
import type { AnimalModel } from '../../types/Animal';

const TIPOS_EVENTO = Object.values(TipoEvento);
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

type AnimalSeleccionado = { id: number; arete: string };

type RegistrarEventoSanitarioProps = {
  onBack: () => void;
  animalId?: number;
};

type FormState = {
  tipoEvento: TipoEvento;
  subtipo: string;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
  fechaProximoEventoSugerida?: string;
};

const INITIAL_FORM: FormState = {
  tipoEvento: TipoEvento.VACUNA,
  subtipo: '',
  descripcion: '',
  veterinario: '',
  dosis: '',
  observaciones: '',
  fechaEvento: '',
  fechaProximoEvento: '',
};

const SUBTIPOS_POR_TIPO = {
  [TipoEvento.VACUNA]: ['AFTOSA', 'BRUCELOSIS'],
  [TipoEvento.DESPARASITACION]: ['INTERNA', 'EXTERNA'],
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const normalizeToday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isFutureDate = (date: Date) => normalizeToday(date).getTime() > normalizeToday(new Date()).getTime();
const isPastDate = (date: Date) => normalizeToday(date).getTime() < normalizeToday(new Date()).getTime();

const validateForm = (form: FormState, animalesCount: number) => {
  const errors: Record<string, string> = {};

  if (animalesCount === 0) {
    errors.animales = 'Selecciona al menos un animal.';
  }

  if (!TIPOS_EVENTO.includes(form.tipoEvento)) {
    errors.tipoEvento = 'Selecciona un tipo valido.';
  }

  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripcion es obligatoria.';
  }

  if (!form.fechaEvento) {
    errors.fechaEvento = 'Selecciona la fecha del evento.';
  } else if (isFutureDate(parseDate(form.fechaEvento))) {
    errors.fechaEvento = 'La fecha del evento no puede ser futura.';
  }

  if (!form.fechaProximoEvento) {
    errors.fechaProximoEvento = 'Selecciona la proxima fecha.';
  } else {
    const fechaProximo = parseDate(form.fechaProximoEvento);
    const today = normalizeToday(new Date());
    if (fechaProximo.getTime() < today.getTime()) {
      errors.fechaProximoEvento = 'La proxima fecha no puede ser pasada.';
    }
    if (form.fechaEvento) {
      const fechaEvento = parseDate(form.fechaEvento);
      if (fechaProximo.getTime() < fechaEvento.getTime()) {
        errors.fechaProximoEvento = 'La fecha proxima debe ser mayor o igual a la del evento.';
      }
    }
  }

  return errors;
};

export function RegistrarEventoSanitario({ onBack, animalId }: RegistrarEventoSanitarioProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [calendarTarget, setCalendarTarget] = useState<'fechaEvento' | 'fechaProximoEvento' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [listVisible, setListVisible] = useState(false);

  // Multi-animal selector
  const [animalesSeleccionados, setAnimalesSeleccionados] = useState<AnimalSeleccionado[]>([]);
  const [areteSearch, setAreteSearch] = useState('');
  const [sugerencias, setSugerencias] = useState<AnimalModel[]>([]);
  const [buscando, setBuscando] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { loading, error, eventos, registrar, listar } = useEventoSanitario();

  // Carga el animal inicial si se recibe animalId por prop
  useEffect(() => {
    if (!animalId) return;
    const cargar = async () => {
      try {
        const animal = await AnimalModule.getAnimalById(animalId);
        if (animal.estado !== 'ACTIVO') {
          Alert.alert(
            'Animal no activo',
            `El animal #${animal.arete} está ${animal.estado.toLowerCase()} y no puede recibir nuevos eventos sanitarios.`,
            [{ text: 'OK', onPress: onBack }],
          );
          return;
        }
        setAnimalesSeleccionados([{ id: animal.id, arete: animal.arete }]);
      } catch {
        setAnimalesSeleccionados([{ id: animalId, arete: `ID:${animalId}` }]);
      }
    };
    void cargar();
  }, [animalId]);

  // Cargar eventos del primer animal seleccionado para mostrar historial
  useEffect(() => {
    const primerAnimal = animalesSeleccionados[0];
    if (!primerAnimal) return;

    void listar(primerAnimal.id)
      .then(() => setListVisible(true))
      .catch(() => setListVisible(false));
  }, [animalesSeleccionados, listar]);

  // Calcular próxima fecha NOM-041
  useEffect(() => {
    const calcular = async () => {
      if (
        form.tipoEvento &&
        form.subtipo &&
        form.fechaEvento &&
        (form.tipoEvento === TipoEvento.VACUNA || form.tipoEvento === TipoEvento.DESPARASITACION)
      ) {
        try {
          const proximaFecha = await NativeModules.AgroBridgeModule.calcularProximaFechaNOM(
            form.tipoEvento,
            form.subtipo,
            form.fechaEvento,
          );
          if (proximaFecha) {
            setForm(prev => ({ ...prev, fechaProximoEventoSugerida: proximaFecha }));
          }
        } catch {
          // Si falla el cálculo el usuario ingresa manualmente
        }
      }
    };
    void calcular();
  }, [form.tipoEvento, form.subtipo, form.fechaEvento]);

  // Búsqueda por arete con debounce
  const handleAreteSearch = useCallback(
    (term: string) => {
      const sanitized = term.replace(/\D/g, '').slice(0, 10);
      setAreteSearch(sanitized);
      setSugerencias([]);

      if (searchTimer.current) clearTimeout(searchTimer.current);

      if (sanitized.length < 2) return;

      searchTimer.current = setTimeout(async () => {
        setBuscando(true);
        try {
          const resultados = await AnimalModule.buscarPorArete(sanitized, 'ACTIVO');
          // Excluir los ya seleccionados
          const filtrados = resultados.filter(a => !animalesSeleccionados.find(sel => sel.id === a.id));
          setSugerencias(filtrados);
        } catch {
          setSugerencias([]);
        } finally {
          setBuscando(false);
        }
      }, 400);
    },
    [animalesSeleccionados],
  );

  const agregarAnimal = (animal: AnimalModel) => {
    if (!animalesSeleccionados.find(a => a.id === animal.id)) {
      setAnimalesSeleccionados(prev => [...prev, { id: animal.id, arete: animal.arete }]);
    }
    setAreteSearch('');
    setSugerencias([]);
    setFieldErrors(prev => ({ ...prev, animales: '' }));
  };

  const removerAnimal = (id: number) => {
    // No se puede remover el animal fijado por prop
    if (id === animalId) return;
    setAnimalesSeleccionados(prev => prev.filter(a => a.id !== id));
  };

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

    for (let index = 0; index < firstDay; index += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));

    return cells;
  };

  const canGoNextMonth = () => {
    if (calendarTarget === 'fechaProximoEvento') return true;
    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const selectDate = (date: Date) => {
    if (!calendarTarget) return;

    if (calendarTarget === 'fechaEvento' && isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'La fecha del evento no puede ser futura.');
      return;
    }

    if (calendarTarget === 'fechaProximoEvento' && isPastDate(date)) {
      Alert.alert('Fecha invalida', 'La proxima fecha no puede ser pasada.');
      return;
    }

    setField(calendarTarget, formatDate(date));
    setCalendarTarget(null);
  };

  const onSubmit = async () => {
    const errors = validateForm(form, animalesSeleccionados.length);
    setFieldErrors(errors);

    if (Object.keys(errors).filter(k => errors[k]).length > 0) return;

    let exitosos = 0;
    const fallidos: string[] = [];

    for (const animal of animalesSeleccionados) {
      try {
        await registrar({
          animalId: animal.id,
          tipoEvento: form.tipoEvento,
          descripcion: form.descripcion.trim(),
          veterinario: form.veterinario.trim(),
          dosis: form.dosis.trim(),
          observaciones: form.observaciones.trim(),
          fechaEvento: form.fechaEvento,
          fechaProximoEvento: form.fechaProximoEvento,
        });

        if (reminderEnabled && form.fechaProximoEvento) {
          try {
            await programarNotificacionEvento({
              id: 0,
              animalId: animal.id,
              tipoEvento: form.tipoEvento,
              descripcion: form.descripcion.trim() || null,
              fechaEvento: form.fechaEvento,
              veterinario: form.veterinario.trim() || null,
              dosis: form.dosis.trim() || null,
              observaciones: form.observaciones.trim() || null,
              fechaProximoEvento: form.fechaProximoEvento,
            });
          } catch {
            // No bloqueamos el guardado si la notificación falla
          }
        }

        exitosos++;
      } catch {
        fallidos.push(animal.arete);
      }
    }

    if (exitosos > 0) {
      const msg =
        animalesSeleccionados.length > 1
          ? `Evento registrado para ${exitosos} de ${animalesSeleccionados.length} animales.`
          : 'El evento sanitario fue registrado correctamente.';

      if (fallidos.length > 0) {
        Alert.alert('Guardado con errores', `${msg}\nFallaron: ${fallidos.join(', ')}`, [
          { text: 'OK', onPress: () => onBack() },
        ]);
      } else {
        Alert.alert('Guardado', msg, [{ text: 'OK', onPress: () => onBack() }]);
      }

      setForm(INITIAL_FORM);
      setAnimalesSeleccionados(prev => (animalId ? prev.filter(a => a.id === animalId) : []));
    } else if (fallidos.length > 0) {
      Alert.alert('Error', `No se pudo registrar para: ${fallidos.join(', ')}`);
    }
  };

  const isAnimalFijo = (id: number) => id === animalId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Evento Sanitario</Text>
        <Text style={styles.subtitle}>Vacunas, desparasitaciones y seguimiento clínico.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── SELECTOR DE ANIMALES ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animales a tratar</Text>

          {/* Chips de animales seleccionados */}
          {animalesSeleccionados.length > 0 && (
            <View style={styles.animalChipsWrap}>
              {animalesSeleccionados.map(a => (
                <Pressable
                  key={a.id}
                  style={[styles.animalChip, isAnimalFijo(a.id) && styles.animalChipFijo]}
                  onPress={() => removerAnimal(a.id)}
                >
                  <Text style={styles.animalChipText}>
                    #{a.arete}{isAnimalFijo(a.id) ? ' 🔒' : ' ✕'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Input de búsqueda por arete */}
          <Text style={styles.label}>
            {animalesSeleccionados.length === 0 ? 'Buscar animal por arete *' : 'Agregar otro animal'}
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              value={areteSearch}
              onChangeText={handleAreteSearch}
              placeholder="Ingresa el arete (ej: 1234567890)"
              keyboardType="number-pad"
              maxLength={10}
              onFocus={() => setFocusedField('areteSearch')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                fieldErrors.animales ? styles.inputError : undefined,
                focusedField === 'areteSearch' && styles.inputFocused,
                { flex: 1 },
              ]}
            />
            {buscando && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />}
          </View>

          {/* Lista de sugerencias */}
          {sugerencias.length > 0 && (
            <View style={styles.sugerenciasBox}>
              {sugerencias.map(s => (
                <Pressable
                  key={s.id}
                  style={styles.sugerenciaItem}
                  onPress={() => agregarAnimal(s)}
                >
                  <Text style={styles.sugerenciaArete}>#{s.arete}</Text>
                  <Text style={styles.sugerenciaEspecie}>{s.especie}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {areteSearch.length >= 2 && sugerencias.length === 0 && !buscando && (
            <Text style={styles.noResultsText}>No se encontraron animales activos con ese arete.</Text>
          )}

          {fieldErrors.animales ? <Text style={styles.errorText}>{fieldErrors.animales}</Text> : null}
        </View>

        {/* ── TIPO DE EVENTO ── */}
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

          {(form.tipoEvento === TipoEvento.VACUNA || form.tipoEvento === TipoEvento.DESPARASITACION) && (
            <View>
              <Text style={styles.label}>Subtipo</Text>
              <View style={styles.chipsRow}>
                {(SUBTIPOS_POR_TIPO[form.tipoEvento] ?? []).map(sub => {
                  const selected = form.subtipo === sub;
                  return (
                    <Pressable
                      key={sub}
                      onPress={() => setField('subtipo', sub)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{sub}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ── DETALLES DEL EVENTO ── */}
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

          <Text style={styles.label}>Dosis (opcional)</Text>
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

        {/* ── FECHAS ── */}
        <View style={styles.card}>
          <Text style={styles.label}>Fecha del evento *</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaEvento')}
          >
            <Text style={[styles.dateText, !form.fechaEvento && styles.datePlaceholder]}>
              {form.fechaEvento || 'Seleccionar fecha (pasada o hoy)'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>
          {fieldErrors.fechaEvento ? <Text style={styles.errorText}>{fieldErrors.fechaEvento}</Text> : null}

          <Text style={styles.label}>Fecha proxima *</Text>
          <Text style={styles.labelHint}>Solo fechas actuales o futuras</Text>

          {form.fechaProximoEventoSugerida && !form.fechaProximoEvento && (
            <Pressable
              style={styles.suggestedDateButton}
              onPress={() => setField('fechaProximoEvento', form.fechaProximoEventoSugerida!)}
            >
              <Text style={styles.suggestedDateLabel}>Sugerido NOM-041</Text>
              <Text style={styles.suggestedDateValue}>{form.fechaProximoEventoSugerida}</Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaProximoEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaProximoEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaProximoEvento')}
          >
            <Text style={[styles.dateText, !form.fechaProximoEvento && styles.datePlaceholder]}>
              {form.fechaProximoEvento || 'Seleccionar fecha futura'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>
          {fieldErrors.fechaProximoEvento ? <Text style={styles.errorText}>{fieldErrors.fechaProximoEvento}</Text> : null}
        </View>

        {/* ── RECORDATORIO ── */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Programar Recordatorio</Text>
            <Text style={styles.reminderHint}>(Al día de la próxima dosis)</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ true: COLORS.primary, false: '#d0d0d0' }}
            thumbColor="#ffffff"
          />
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        {/* ── BOTÓN GUARDAR ── */}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.saveButton, (pressed || loading) && styles.saveButtonPressed]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : (
              <Text style={styles.saveButtonText}>
                {animalesSeleccionados.length > 1
                  ? `Guardar para ${animalesSeleccionados.length} animales`
                  : 'Guardar Evento Sanitario'}
              </Text>
            )}
        </Pressable>

        {/* ── HISTORIAL DEL PRIMER ANIMAL ── */}
        {listVisible && animalesSeleccionados[0] ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Eventos del animal #{animalesSeleccionados[0].arete}</Text>
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

      {/* ── CALENDARIO ── */}
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
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

                const disableDay =
                  calendarTarget === 'fechaEvento'
                    ? isFutureDate(day)
                    : calendarTarget === 'fechaProximoEvento'
                      ? isPastDate(day)
                      : false;

                const isSelected =
                  calendarTarget === 'fechaEvento'
                    ? form.fechaEvento === formatDate(day)
                    : form.fechaProximoEvento === formatDate(day);

                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      disableDay && styles.dayCellDisabled,
                    ]}
                    disabled={disableDay}
                    onPress={() => selectDate(day)}
                  >
                    <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>
                      {day.getDate()}
                    </Text>
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
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
    paddingBottom: 40,
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
  sectionTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  labelHint: {
    marginBottom: 6,
    color: '#6c8060',
    fontFamily: FONTS.regular,
    fontSize: 12,
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
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sugerenciasBox: {
    borderWidth: 1,
    borderColor: '#d0dccf',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  sugerenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ec',
  },
  sugerenciaArete: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    fontSize: 14,
  },
  sugerenciaEspecie: {
    fontFamily: FONTS.regular,
    color: '#666',
    fontSize: 12,
  },
  noResultsText: {
    color: '#888',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  animalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  animalChip: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  animalChipFijo: {
    backgroundColor: '#4a8f6a',
  },
  animalChipText: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
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
    paddingVertical: 14,
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
    paddingVertical: 18,
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
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
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
  suggestedDateButton: {
    backgroundColor: '#f0f9f0',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#c7e9c7',
  },
  suggestedDateLabel: {
    color: '#555555',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  suggestedDateValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginTop: 6,
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
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  dayCellTextSelected: {
    color: COLORS.white,
  },
  calendarCloseButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calendarCloseText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
});
