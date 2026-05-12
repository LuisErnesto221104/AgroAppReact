import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { formatMXN } from '../../utils/formatMXN';

const COLORES_CATEGORIA: Record<string, string> = {
  ALIMENTACION: '#43A047',
  MEDICAMENTOS: '#E53935',
  TRASLADO: '#FB8C00',
  VETERINARIO: '#1E88E5',
  OTRO: '#8E24AA',
};

const LABELS_CATEGORIA: Record<string, string> = {
  ALIMENTACION: 'Alimentación',
  MEDICAMENTOS: 'Medicamentos',
  TRASLADO: 'Traslado',
  VETERINARIO: 'Veterinario',
  OTRO: 'Otro',
};

interface GraficoBarrasCategoriasProps {
  datos: Record<string, number>;
  totalGeneral: number;
}

function BarraAnimada({
  categoria,
  monto,
  proporcion,
  color,
  delay,
}: {
  categoria: string;
  monto: number;
  proporcion: number;
  color: string;
  delay: number;
}) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: proporcion,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [proporcion, delay]);

  const widthPercent = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.barraRow}>
      <Text style={styles.barraLabel}>{LABELS_CATEGORIA[categoria] ?? categoria}</Text>
      <View style={styles.barraContainer}>
        <Animated.View
          style={[
            styles.barraFill,
            {
              backgroundColor: color,
              width: widthPercent.interpolate
                ? widthPercent.interpolate({
                    inputRange: ['0%', '100%'],
                    outputRange: ['0%', `${Math.max(proporcion * 100, 2)}%`],
                  })
                : `${Math.max(proporcion * 100, 2)}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.barraMonto}>{formatMXN(monto)}</Text>
    </View>
  );
}

export function GraficoBarrasCategorias({
  datos,
  totalGeneral,
}: GraficoBarrasCategoriasProps) {
  if (!datos || totalGeneral <= 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos para graficar</Text>
      </View>
    );
  }

  const entradas = Object.entries(datos).sort(([, a], [, b]) => b - a);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gastos por Categoría</Text>
      {entradas.map(([categoria, monto], index) => {
        const proporcion = totalGeneral > 0 ? monto / totalGeneral : 0;
        const color = COLORES_CATEGORIA[categoria] ?? '#9E9E9E';
        return (
          <BarraAnimada
            key={categoria}
            categoria={categoria}
            monto={monto}
            proporcion={proporcion}
            color={color}
            delay={index * 100}
          />
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalMonto}>{formatMXN(totalGeneral)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  barraRow: {
    marginBottom: 12,
  },
  barraLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#555',
    marginBottom: 4,
  },
  barraContainer: {
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 3,
  },
  barraFill: {
    height: '100%',
    borderRadius: 9,
    minWidth: 6,
  },
  barraMonto: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  totalMonto: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
});
