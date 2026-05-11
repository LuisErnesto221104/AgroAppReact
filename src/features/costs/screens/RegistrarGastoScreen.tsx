import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeModules } from 'react-native';
import { CategoriaGasto, CATEGORIA_GASTO_LABELS, InsertGastoPayload } from '../../../types/Costos';
import { AnimalModel } from '../../../types/Animal';

const { AgroBridgeModule } = NativeModules;

interface RegistrarGastoScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  gastoId?: number; // Si se proporciona, es edición
}

export function RegistrarGastoScreen({ onBack, onSuccess, gastoId }: RegistrarGastoScreenProps) {
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [esGastoGeneral, setEsGastoGeneral] = useState(true);
  const [categoria, setCategoria] = useState<CategoriaGasto>(CategoriaGasto.ALIMENTACION);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [notas, setNotas] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [animales, setAnimales] = useState<AnimalModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);

  useEffect(() => {
    cargarAnimales();
  }, []);

  const cargarAnimales = async () => {
    try {
      const resultado = await AgroBridgeModule.obtenerAnimales?.();
      if (resultado && Array.isArray(resultado)) {
        setAnimales(resultado);
      }
    } catch (error) {
      console.error('Error cargando animales:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const formatoFecha = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatoMoneda = (value: string) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const validarFormulario = (): boolean => {
    if (!categoria || !descripcion.trim() || !monto.trim() || !fecha) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return false;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0');
      return false;
    }

    if (!esGastoGeneral && !animalId) {
      Alert.alert('Error', 'Selecciona un animal para este gasto');
      return false;
    }

    return true;
  };

  const guardarGasto = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const payload: InsertGastoPayload = {
        animalId: esGastoGeneral ? null : animalId,
        categoria,
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        fecha: formatoFecha(fecha),
        notas: notas.trim() || null,
      };

      if (gastoId) {
        // Edición
        await AgroBridgeModule.updateGasto({
          ...payload,
          id: gastoId,
        });
      } else {
        // Inserción
        await AgroBridgeModule.registrarGasto(payload);
      }

      Alert.alert('Éxito', gastoId ? 'Gasto actualizado' : 'Gasto registrado');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{gastoId ? 'Editar Gasto' : 'Registrar Gasto'}</Text>
      </View>

      {/* Toggle General / Por Animal */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, esGastoGeneral && styles.toggleActive]}
          onPress={() => setEsGastoGeneral(true)}
        >
          <Text style={esGastoGeneral ? styles.toggleTextActive : styles.toggleText}>
            📋 Gasto General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, !esGastoGeneral && styles.toggleActive]}
          onPress={() => setEsGastoGeneral(false)}
        >
          <Text style={!esGastoGeneral ? styles.toggleTextActive : styles.toggleText}>
            🐄 Por Animal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Animal (si es por animal) */}
      {!esGastoGeneral && (
        <View style={styles.section}>
          <Text style={styles.label}>Animal *</Text>
          <TouchableOpacity
            style={styles.animalButton}
            onPress={() => setShowAnimalPicker(true)}
          >
            <Text style={styles.buttonText}>
              {animalId
                ? animales.find(a => a.id === animalId)?.nombre || `Animal #${animalId}`
                : 'Seleccionar animal'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categoría */}
      <View style={styles.section}>
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={categoria}
            onValueChange={setCategoria}
          >
            {Object.values(CategoriaGasto).map(cat => (
              <Picker.Item
                key={cat}
                label={CATEGORIA_GASTO_LABELS[cat]}
                value={cat}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Sacos de alimento balanceado"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholderTextColor="#999"
        />
      </View>

      {/* Monto */}
      <View style={styles.section}>
        <Text style={styles.label}>Monto (MXN) *</Text>
        <View style={styles.montoContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.inputMonto}
            placeholder="0.00"
            value={monto}
            onChangeText={(text) => setMonto(formatoMoneda(text))}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatoFecha(fecha)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Notas */}
      <View style={styles.section}>
        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observaciones o detalles adicionales"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={guardarGasto}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? '⏳ Guardando...' : '✅ Guardar'}
        </Text>
      </TouchableOpacity>

      {/* Modal de Animales */}
      <Modal
        visible={showAnimalPicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Animal</Text>
            <ScrollView>
              {animales.map(animal => (
                <TouchableOpacity
                  key={animal.id}
                  style={[
                    styles.animalOption,
                    animalId === animal.id && styles.animalOptionSelected,
                  ]}
                  onPress={() => {
                    setAnimalId(animal.id);
                    setShowAnimalPicker(false);
                  }}
                >
                  <Text style={styles.animalOptionText}>
                    {animal.nombre} (#{animal.numeroArete})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowAnimalPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#07612d',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#07612d',
    borderColor: '#07612d',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  toggleTextActive: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  montoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
    marginRight: 8,
  },
  inputMonto: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  animalButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#07612d',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  animalOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  animalOptionSelected: {
    backgroundColor: '#f0f8f0',
  },
  animalOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
    marginBottom: 24,
  },
  modalCloseText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#07612d',
  },
});
