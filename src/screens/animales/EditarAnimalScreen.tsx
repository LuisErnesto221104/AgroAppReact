import React, { useEffect, useMemo, useState } from 'react';
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
import { VentaAnimalModal } from '../../components/animales/VentaAnimalModal';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, UpdateAnimalPayload } from '../../types/Animal';

const ESPECIES_BASE = [
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
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
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
  estado: 'ACTIVO' | 'VENDIDO' | 'FALLECIDO';
  fechaBaja: string;
  motivoBaja: string;
};

export function EditarAnimalScreen({ animal, onBack, onSaved }: EditarAnimalScreenProps) {
  // Derivados de estado original — inmutables durante la sesión
  const isVendido = animal.estado === 'VENDIDO';
  const isFallecidoOriginal = animal.estado === 'FALLECIDO';

  const normalizeSexo = (sexo: string | null | undefined) => {
    if (sexo === 'F') return 'H';
    return sexo ?? 'M';
  };

  const initialPhotoUri = useMemo(() => {
    const raw = animal.foto?.trim();
    if (!raw) return null;
    if (raw.startsWith('file://') || raw.startsWith('content://') || raw.startsWith('http')) return raw;
    return `file://${raw}`;
  }, [animal.foto]);

  const [form, setForm] = useState<EditFormState>({
    arete: animal.arete,
    especie: animal.especie,
    sexo: normalizeSexo(animal.sexo),
    fecha: animal.fecha,
    peso: animal.peso == null ? '' : String(Math.trunc(animal.peso)),
    fotoPath: initialPhotoUri,
    estado: animal.estado === 'FALLECIDO' ? 'FALLECIDO' : animal.estado === 'VENDIDO' ? 'VENDIDO' : 'ACTIVO',
    fechaBaja: animal.fecha_baja ?? '',
    motivoBaja: animal.motivo_baja ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerBajaVisible, setDatePickerBajaVisible] = useState(false);
  const [ventaModalVisible, setVentaModalVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  // Determina si la especie actual es "Otro" (no está en la lista base)
  const isOtroSelected = !ESPECIES_BASE.includes(form.especie);

  const canSubmit = useMemo(() => {
    if (isVendido) return false;
    return form.especie.trim().length > 0 && form.sexo.trim().length > 0 && form.fecha.trim().length > 0;
  }, [form, isVendido]);

  useEffect(() => {
    if (form.estado !== 'FALLECIDO') return;

    setForm(prev => {
      const today = formatDate(new Date());
      const nextFechaBaja = prev.fechaBaja.trim().length > 0 ? prev.fechaBaja : today;
      const nextMotivoBaja = prev.motivoBaja.trim().length > 0 ? prev.motivoBaja : 'Cambio de estado registrado desde editar';

      if (nextFechaBaja === prev.fechaBaja && nextMotivoBaja === prev.motivoBaja) return prev;

      return { ...prev, fechaBaja: nextFechaBaja, motivoBaja: nextMotivoBaja };
    });
  }, [form.estado]);

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

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate.getTime() > today.getTime();
  };

  const parseCalendarDate = (year: number, month: number, day: number) => new Date(year, month, day);

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(parseCalendarDate(year, month, day));

    return cells;
  };

  const openCalendar = () => {
    if (isVendido) return;
    setCalendarMonth(form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date());
    setDatePickerVisible(true);
  };

  const openCalendarBaja = () => {
    if (isVendido) return;
    setCalendarMonth(form.fechaBaja ? new Date(`${form.fechaBaja}T00:00:00`) : new Date());
    setDatePickerBajaVisible(true);
  };

  const closeCalendar = () => setDatePickerVisible(false);
  const closeCalendarBaja = () => setDatePickerBajaVisible(false);

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fecha', formatDate(date));
    setDatePickerVisible(false);
  };

  const selectDateBaja = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fechaBaja', formatDate(date));
    setDatePickerBajaVisible(false);
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
    if (isAtCurrentMonth()) return;
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onGuardar = async () => {
    if (isVendido) {
      Alert.alert('No permitido', 'Este animal fue vendido y no puede modificarse.');
      return;
    }
    if (!canSubmit || loading) return;

    const normalizedSelectedPhoto = form.fotoPath?.trim() ?? '';
    const normalizedInitialPhoto = initialPhotoUri?.trim() ?? '';
    const hasNewPhoto = normalizedSelectedPhoto.length > 0 && normalizedSelectedPhoto !== normalizedInitialPhoto;

    const payload: UpdateAnimalPayload = {
      id: animal.id,
      arete: animal.arete,
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: form.peso.trim().length === 0 ? null : Number(form.peso),
      foto_path: hasNewPhoto ? form.fotoPath : null,
    };

    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.updateAnimal(payload);

      // ACTIVO → FALLECIDO: permitido
      if (animal.estado === 'ACTIVO' && form.estado === 'FALLECIDO') {
        await AnimalModule.changeEstado({
          id: animal.id,
          estado: 'FALLECIDO',
          fecha_baja: form.fechaBaja.trim().length > 0 ? form.fechaBaja.trim() : formatDate(new Date()),
          motivo_baja: form.motivoBaja.trim().length > 0 ? form.motivoBaja.trim() : 'Cambio de estado registrado desde editar',
        });
      }
      // FALLECIDO → ACTIVO: NO permitido (regla de negocio)
      // VENDIDO → cualquiera: bloqueado arriba

      Alert.alert('Actualizado', `Animal ${animal.arete} actualizado correctamente.`);
      onSaved();
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'No se pudo guardar los cambios del animal.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Editar Animal</Text>
          <Text style={styles.subtitle}>La {animal.especie} • #{animal.arete}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Banner de VENDIDO */}
        {isVendido && (
          <View style={styles.vendidoBanner}>
            <Text style={styles.vendidoBannerTitle}>🔒 Animal Vendido</Text>
            <Text style={styles.vendidoBannerText}>Este animal fue vendido y no puede modificarse.</Text>
            {animal.fecha_venta && <Text style={styles.vendidoBannerText}>Fecha de venta: {animal.fecha_venta}</Text>}
            {animal.precio_venta && <Text style={styles.vendidoBannerText}>Precio: ${animal.precio_venta.toFixed(2)}</Text>}
          </View>
        )}

        <Text style={styles.label}>Número de Arete SINIIGA 🔒</Text>
        <TextInput value={form.arete} style={[styles.input, styles.inputDisabled]} editable={false} />
        <Text style={styles.helperText}>El arete oficial no se puede modificar</Text>

        {/* Selector de Estado */}
        <Text style={styles.label}>Estado actual del animal *</Text>
        <View style={styles.estadoSelectorRow}>
          {/* Chip ACTIVO: deshabilitado si VENDIDO o si ya es FALLECIDO original */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'ACTIVO' && styles.estadoSelectorChipActive,
              (isVendido || isFallecidoOriginal) && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido || isFallecidoOriginal) return;
              setField('estado', 'ACTIVO');
            }}
            disabled={isVendido || isFallecidoOriginal}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'ACTIVO' && styles.estadoSelectorTextActive,
              (isVendido || isFallecidoOriginal) && styles.estadoSelectorTextDisabled,
            ]}>
              🟢 Activo
            </Text>
          </Pressable>

          {/* Chip VENDIDO: deshabilitado si ya está VENDIDO */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'VENDIDO' && styles.estadoSelectorChipVendido,
              isVendido && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido) return;
              setVentaModalVisible(true);
            }}
            disabled={isVendido}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'VENDIDO' && styles.estadoSelectorTextVendido,
            ]}>
              🟠 Vendido {form.estado === 'VENDIDO' && '✓'}
            </Text>
          </Pressable>

          {/* Chip FALLECIDO: deshabilitado si ya está VENDIDO */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'FALLECIDO' && styles.estadoSelectorChipFallecido,
              isVendido && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido) return;
              setField('estado', 'FALLECIDO');
            }}
            disabled={isVendido}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'FALLECIDO' && styles.estadoSelectorTextFallecido,
              isVendido && styles.estadoSelectorTextDisabled,
            ]}>
              🟣 Fallecido
            </Text>
          </Pressable>
        </View>

        {animal.estado === 'VENDIDO' && (
          <View style={styles.ventaDetailsCard}>
            <Text style={styles.ventaDetailsTitle}>Información de venta</Text>
            {animal.fecha_venta && (
              <View style={styles.ventaDetailRow}>
                <Text style={styles.ventaDetailLabel}>Fecha:</Text>
                <Text style={styles.ventaDetailValue}>{animal.fecha_venta}</Text>
              </View>
            )}
            {animal.precio_venta && (
              <View style={styles.ventaDetailRow}>
                <Text style={styles.ventaDetailLabel}>Precio:</Text>
                <Text style={styles.ventaDetailValue}>${animal.precio_venta.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Toggle fallecido: solo cuando el animal ORIGINAL es ACTIVO */}
        {animal.estado === 'ACTIVO' && !isVendido ? (
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

        {form.estado === 'FALLECIDO' && !isVendido ? (
          <>
            <Text style={styles.label}>Fecha de baja *</Text>
            <Pressable style={styles.dateField} onPress={openCalendarBaja}>
              <Text style={[styles.dateFieldText, !form.fechaBaja && styles.dateFieldPlaceholder]}>
                {form.fechaBaja || 'Selecciona una fecha'}
              </Text>
              <Text style={styles.dateFieldIcon}>📅</Text>
            </Pressable>

            <Text style={styles.label}>Causa de fallecimiento *</Text>
            <TextInput
              value={form.motivoBaja}
              onChangeText={value => setField('motivoBaja', value)}
              placeholder="Describe la causa"
              style={styles.input}
              editable={!isVendido}
            />
          </>
        ) : null}

        {/* Raza */}
        <Text style={styles.label}>Raza / Especie</Text>
        <View style={styles.chipWrap}>
          {ESPECIES_BASE.map(option => {
            const selected = form.especie === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected, isVendido && styles.chipDisabled]}
                onPress={() => {
                  if (isVendido) return;
                  setField('especie', option);
                }}
                disabled={isVendido}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
          {/* Chip "Otro" */}
          <Pressable
            key="Otro"
            style={[styles.chip, isOtroSelected && styles.chipSelected, isVendido && styles.chipDisabled]}
            onPress={() => {
              if (isVendido) return;
              if (!isOtroSelected) {
                setField('especie', '');
              }
            }}
            disabled={isVendido}
          >
            <Text style={[styles.chipText, isOtroSelected && styles.chipTextSelected]}>Otro</Text>
          </Pressable>
        </View>
        {isOtroSelected && (
          <TextInput
            value={form.especie}
            onChangeText={value => setField('especie', value)}
            placeholder="Escribe la raza..."
            style={[styles.input, { marginTop: 8 }]}
            editable={!isVendido}
            maxLength={50}
            autoFocus={form.especie === ''}
          />
        )}

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.chipWrap}>
          {SEXO_OPTIONS.map(option => {
            const selected = form.sexo === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.sexChip, selected && styles.sexChipSelected, isVendido && styles.chipDisabled]}
                onPress={() => {
                  if (isVendido) return;
                  setField('sexo', option.value);
                }}
                disabled={isVendido}
              >
                <Text style={[styles.sexChipText, selected && styles.sexChipTextSelected]}>
                  {option.value} ({option.label})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Fecha de Ingreso</Text>
        <Pressable style={[styles.dateField, isVendido && styles.inputDisabled]} onPress={openCalendar}>
          <Text style={[styles.dateFieldText, !form.fecha && styles.dateFieldPlaceholder]}>
            {form.fecha || 'Selecciona una fecha'}
          </Text>
          <Text style={styles.dateFieldIcon}>📅</Text>
        </Pressable>

        <Text style={styles.label}>Peso actual (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', sanitizeDigits(value))}
          placeholder="Ej. 352"
          style={[styles.input, isVendido && styles.inputDisabled]}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isVendido}
        />

        <Text style={styles.label}>Fotografia del animal</Text>
        {isVendido ? (
          <View style={styles.fotoDisabledMsg}>
            <Text style={styles.fotoDisabledText}>Foto bloqueada — animal vendido</Text>
          </View>
        ) : (
          <AnimalFotoCaptura
            rutaLocal={form.fotoPath ?? initialPhotoUri}
            onRutaLocalChange={rutaLocal => setField('fotoPath', rutaLocal)}
          />
        )}

        {/* Botón guardar: oculto si está VENDIDO */}
        {!isVendido && (
          <Pressable
            onPress={onGuardar}
            disabled={!canSubmit || loading}
            style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
          >
            <Text style={styles.submitText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Calendar fechaIngreso */}
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
                <Text key={day} style={styles.weekLabel}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
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

      {/* Calendar fechaBaja */}
      <Modal visible={datePickerBajaVisible} transparent animationType="fade" onRequestClose={closeCalendarBaja}>
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
                <Text key={`baja-label-${day}`} style={styles.weekLabel}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`baja-empty-${index}`} style={styles.dayCell} />;
                const isSelected = form.fechaBaja === formatDate(day);
                const isDisabled = isFutureDate(day);
                return (
                  <Pressable
                    key={`baja-${day.toISOString()}`}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isDisabled && styles.dayCellDisabled]}
                    onPress={() => selectDateBaja(day)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarCloseButton} onPress={closeCalendarBaja}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <VentaAnimalModal
        visible={ventaModalVisible}
        animalId={animal.id}
        arete={animal.arete}
        precioVentaExistente={animal.precio_venta}
        fechaVentaExistente={animal.fecha_venta}
        onVentaExitosa={() => {
          setField('estado', 'VENDIDO');
          setVentaModalVisible(false);
          onSaved();
        }}
        onCancelar={() => setVentaModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0a6b33',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    color: '#d5e8d8',
    fontWeight: '600',
    fontSize: 12,
  },
  container: {
    padding: 12,
    paddingBottom: 40,
  },
  vendidoBanner: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6f00',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  vendidoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e65100',
    marginBottom: 4,
  },
  vendidoBannerText: {
    fontSize: 12,
    color: '#795548',
    fontWeight: '600',
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: '#1d1d1d',
    fontWeight: '700',
  },
  helperText: {
    marginTop: 4,
    color: '#7d7d7d',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1f1f1f',
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#646464',
    opacity: 0.7,
  },
  estadoSelectorRow: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 8,
  },
  estadoSelectorChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  estadoSelectorChipActive: {
    borderColor: '#0a6b33',
    backgroundColor: '#0a6b33',
  },
  estadoSelectorChipDisabled: {
    opacity: 0.45,
  },
  estadoSelectorChipFallecido: {
    borderColor: '#9145aa',
    backgroundColor: '#f6eefa',
  },
  estadoSelectorChipVendido: {
    borderColor: '#ff6f00',
    backgroundColor: '#ffe0b2',
    borderWidth: 2,
  },
  estadoSelectorText: {
    color: '#2a2a2a',
    fontWeight: '700',
    fontSize: 12,
  },
  estadoSelectorTextActive: {
    color: '#ffffff',
  },
  estadoSelectorTextDisabled: {
    color: '#9b9b9b',
    fontWeight: '700',
    fontSize: 12,
  },
  estadoSelectorTextFallecido: {
    color: '#7a3a8d',
  },
  estadoSelectorTextVendido: {
    color: '#e65100',
  },
  ventaDetailsCard: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f0f9f0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0a6b33',
  },
  ventaDetailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a6b33',
    marginBottom: 8,
  },
  ventaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  ventaDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  ventaDetailValue: {
    fontSize: 12,
    color: '#0a6b33',
    fontWeight: '700',
  },
  fallecidoToggle: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d2d2d2',
    backgroundColor: '#f0f0f0',
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
    borderColor: '#d7d7d7',
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  chipDisabled: {
    opacity: 0.5,
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
    borderColor: '#d7d7d7',
    backgroundColor: '#f0f0f0',
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
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
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
  fotoDisabledMsg: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  fotoDisabledText: {
    color: '#777',
    fontWeight: '600',
    fontSize: 13,
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
    backgroundColor: '#0a6b33',
    borderRadius: 10,
    paddingVertical: 16,
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
