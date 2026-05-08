import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { VentaAnimalResult } from '../../types/Animal';

interface VentaAnimalModalProps {
  visible: boolean;
  animalId: number;
  arete: string;
  precioVentaExistente?: number | null;
  fechaVentaExistente?: string | null;
  onVentaExitosa: (resultado: VentaAnimalResult) => void;
  onCancelar: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export function VentaAnimalModal({
  visible,
  animalId,
  arete,
  precioVentaExistente,
  fechaVentaExistente,
  onVentaExitosa,
  onCancelar,
}: VentaAnimalModalProps) {
  const [precioVenta, setPrecioVenta] = useState('');
  const [fechaVenta, setFechaVenta] = useState('');
  const [comprador, setComprador] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);
  const [errorFecha, setErrorFecha] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Precargar datos cuando el modal se abre
  React.useEffect(() => {
    if (visible) {
      // Precargar datos existentes sin validación estricta
      if (precioVentaExistente != null) {
        setPrecioVenta(precioVentaExistente.toString());
      }
      if (fechaVentaExistente != null) {
        setFechaVenta(fechaVentaExistente);
      }
    } else {
      // Limpiar cuando el modal se cierra (excepto si el modal vuelve a abrir)
      setTimeout(() => {
        if (!visible) {
          setPrecioVenta('');
          setFechaVenta('');
          setComprador('');
          setErrorPrecio(null);
          setErrorFecha(null);
        }
      }, 300);
    }
  }, [visible]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseDate = (value: string) => new Date(`${value}T00:00:00`);

  const normalizeToday = (date: Date) => {
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate;
  };

  const isFutureDate = (date: Date) => {
    const today = normalizeToday(new Date());
    return normalizeToday(date).getTime() > today.getTime();
  };

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

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha inválida', 'La fecha de venta no puede ser futura.');
      return;
    }
    setFechaVenta(formatDate(date));
    setDatePickerVisible(false);
  };

  const canGoNextMonth = () => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const onConfirmarVenta = async () => {
    const precioNum = parseFloat(precioVenta.replace(',', '.'));

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      setErrorPrecio('El precio debe ser mayor a $0');
      return;
    }
    setErrorPrecio(null);

    if (!fechaVenta) {
      setErrorFecha('La fecha de venta es obligatoria');
      return;
    }
    setErrorFecha(null);

    setLoading(true);
    try {
      const motivoBaja = comprador.trim() ? `Venta - ${comprador.trim()}` : 'Venta';
      await NativeModules.AnimalModule.changeEstado({
        id: animalId,
        estado: 'VENDIDO',
        precioVenta: precioNum,
        fechaVenta: fechaVenta,
        fecha_baja: fechaVenta,
        motivo_baja: motivoBaja,
      });

      setLoading(false);
      onVentaExitosa({
        ok: true,
        animalId,
        precioVenta: precioNum,
        margenEstimado: null,
      });

      // Limpiar estado
      setPrecioVenta('');
      setFechaVenta('');
      setComprador('');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo registrar la venta');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>¿Registrar venta del animal #{arete}?</Text>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Precio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Precio de venta *</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={precioVenta}
                  onChangeText={val => {
                    setPrecioVenta(val);
                    setErrorPrecio(null);
                  }}
                />
                <Text style={styles.priceSuffix}>MXN</Text>
              </View>
              {errorPrecio && <Text style={styles.errorText}>{errorPrecio}</Text>}
            </View>

            {/* Fecha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Fecha de venta *</Text>
              <Pressable
                style={[styles.dateField, errorFecha && styles.dateFieldError]}
                onPress={() => {
                  setDatePickerVisible(true);
                  setCalendarMonth(fechaVenta ? parseDate(fechaVenta) : new Date());
                }}
              >
                <Text style={[styles.dateText, !fechaVenta && styles.datePlaceholder]}>
                  {fechaVenta ? formatDisplayDate(fechaVenta) : 'DD/MM/AAAA'}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
              </Pressable>
              {errorFecha && <Text style={styles.errorText}>{errorFecha}</Text>}
            </View>

            {/* Comprador */}
            <View style={styles.fieldGroup}>
              <Text style={styles.labelOptional}>Comprador (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del comprador (opcional)"
                value={comprador}
                onChangeText={setComprador}
              />
            </View>
          </ScrollView>

          {/* Footer - Botones */}
          <View style={styles.footer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancelar}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmButton,
                (!precioVenta.trim() || Number.isNaN(parseFloat(precioVenta)) || parseFloat(precioVenta) <= 0 || !fechaVenta.trim() || loading) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={onConfirmarVenta}
              disabled={
                !precioVenta.trim() ||
                Number.isNaN(parseFloat(precioVenta)) ||
                parseFloat(precioVenta) <= 0 ||
                !fechaVenta.trim() ||
                loading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar Venta</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.datePickerBackdrop}>
          <View style={styles.datePickerCard}>
            <View style={styles.datePickerHeader}>
              <Pressable
                onPress={() =>
                  setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                style={styles.datePickerNavButton}
              >
                <Text style={styles.datePickerNavText}>‹</Text>
              </Pressable>
              <Text style={styles.datePickerTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => {
                  if (canGoNextMonth()) {
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                  }
                }}
                style={[styles.datePickerNavButton, !canGoNextMonth() && styles.datePickerNavButtonDisabled]}
              >
                <Text style={[styles.datePickerNavText, !canGoNextMonth() && styles.datePickerNavTextDisabled]}>›</Text>
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
                const disableDay = isFutureDate(day);
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

            <Pressable
              style={styles.datePickerCloseButton}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.datePickerCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    minHeight: '65%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1b',
    marginBottom: 8,
    fontFamily: FONTS.semiBold,
  },
  labelOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  pricePrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#07612d',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#333',
  },
  priceSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginLeft: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 6,
    fontFamily: FONTS.regular,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  dateFieldError: {
    borderColor: '#D32F2F',
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#333',
  },
  datePlaceholder: {
    color: '#bbb',
  },
  dateIcon: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.regular,
    backgroundColor: '#fafafa',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: FONTS.semiBold,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  // Date Picker Styles
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2e9',
  },
  datePickerNavButtonDisabled: {
    opacity: 0.35,
  },
  datePickerNavText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  datePickerNavTextDisabled: {
    color: '#8a9387',
  },
  datePickerTitle: {
    color: '#1d1d1b',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
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
    marginBottom: 12,
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: '#1d1d1b',
    fontWeight: '700',
    fontFamily: FONTS.semiBold,
  },
  datePickerCloseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
});
