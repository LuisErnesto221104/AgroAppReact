import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';

interface ResumenInversionCardProps {
  animalId: number;
  animalEstado: 'ACTIVO' | 'FALLECIDO' | 'VENDIDO';
  onRegistrarVenta?: () => void;
}

interface MargenData {
  inversionTotal: number;
  precioCompra: number;
  sumaGastos: number;
  precioVenta: number;
  margen: number;
  porcentaje: number;
  esGanancia: boolean;
  estaVendido: boolean;
  fechaVenta?: string;
  error?: string;
}

export function ResumenInversionCard({
  animalId,
  animalEstado,
}: ResumenInversionCardProps) {
  const [margenData, setMargenData] = useState<MargenData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (animalEstado === 'VENDIDO') {
      loadMargenReal();
    }
  }, [animalId, animalEstado]);

  const loadMargenReal = async () => {
    setLoading(true);
    try {
      const result = await NativeModules.AgroBridgeModule.getMargenRealAnimal(animalId);
      if (!result.error) {
        setMargenData(result);
      } else {
        Alert.alert('Error', result.error || 'No se pudo cargar la información de inversión');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error al cargar margen');
    } finally {
      setLoading(false);
    }
  };

  if (animalEstado !== 'VENDIDO') {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!margenData) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Resultado Final de Venta</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Inversión total:</Text>
        <Text style={styles.value}>${margenData.inversionTotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Precio compra:</Text>
        <Text style={styles.value}>${margenData.precioCompra.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Gastos (sanitarios + alimentación):</Text>
        <Text style={styles.value}>${margenData.sumaGastos.toFixed(2)}</Text>
      </View>

      <View style={[styles.separatorLine, styles.spacer]} />

      <View style={styles.row}>
        <Text style={styles.label}>Precio de venta:</Text>
        <Text style={styles.value}>${margenData.precioVenta.toFixed(2)}</Text>
      </View>

      <View
        style={[
          styles.row,
          styles.resultRow,
          margenData.esGanancia ? styles.resultGanancia : styles.resultPerdida,
        ]}
      >
        <Text style={[styles.label, styles.resultLabel]}>
          {margenData.esGanancia ? 'Ganancia' : 'Pérdida'}:
        </Text>
        <Text
          style={[
            styles.value,
            styles.resultValue,
            margenData.esGanancia ? styles.resultValueGreen : styles.resultValueRed,
          ]}
        >
          ${margenData.margen.toFixed(2)} ({margenData.porcentaje.toFixed(1)}%)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#555',
    fontFamily: FONTS.regular,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  resultRow: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resultGanancia: {
    backgroundColor: '#f0fef0',
  },
  resultPerdida: {
    backgroundColor: '#fef0f0',
  },
  resultLabel: {
    color: '#333',
  },
  resultValue: {
    fontSize: 14,
  },
  resultValueGreen: {
    color: '#39a861',
  },
  resultValueRed: {
    color: '#D32F2F',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#eee',
  },
  spacer: {
    marginVertical: 12,
  },
});
