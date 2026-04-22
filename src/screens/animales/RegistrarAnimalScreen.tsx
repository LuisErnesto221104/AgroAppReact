import React, { useMemo, useState } from 'react';
import {
  Alert,
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

type RegistrarAnimalScreenProps = {
  onBack: () => void;
};

const INITIAL_FORM_STATE: AnimalFormState = {
  arete: '',
  especie: '',
  sexo: '',
  fecha: '',
  peso: '',
  fotoPath: null,
};

export function RegistrarAnimalScreen({ onBack }: RegistrarAnimalScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [areteError, setAreteError] = useState<string | null>(null);

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

  const onAreteChange = (value: string) => {
    setField('arete', value);
    const result = validateArete(value);
    setAreteError(result.errorMsg);
  };

  const buildPayload = (): InsertAnimalPayload => {
    const pesoValue = form.peso.trim();
    return {
      arete: form.arete.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: pesoValue.length > 0 ? Number(pesoValue) : null,
      foto_path: form.fotoPath,
    };
  };

  const onRegistrar = async () => {
    if (!canSubmit || loading) {
      return;
    }

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
          onChangeText={onAreteChange}
          placeholder="0013482956"
          style={[styles.input, areteError ? styles.inputError : undefined]}
          keyboardType="number-pad"
          maxLength={10}
        />
        {areteError ? <Text style={styles.errorText}>{areteError}</Text> : null}

        <Text style={styles.label}>Especie</Text>
        <TextInput
          value={form.especie}
          onChangeText={value => setField('especie', value)}
          placeholder="Bovino, Ovino, Caprino"
          style={styles.input}
        />

        <Text style={styles.label}>Sexo</Text>
        <TextInput
          value={form.sexo}
          onChangeText={value => setField('sexo', value)}
          placeholder="Macho o Hembra"
          style={styles.input}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          value={form.fecha}
          onChangeText={value => setField('fecha', value)}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', value)}
          placeholder="Ej. 352.7"
          style={styles.input}
          keyboardType="decimal-pad"
        />

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
  errorText: {
    marginTop: 6,
    color: '#d23d3d',
    fontSize: 12,
    fontWeight: '600',
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
