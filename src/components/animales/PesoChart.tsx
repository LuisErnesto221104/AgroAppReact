import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PesoHistorialPoint } from '../../types/Animal';

type PesoChartProps = {
  data: PesoHistorialPoint[];
};

export function PesoChart({ data }: PesoChartProps) {
  const bars = useMemo(() => {
    const ordered = [...data].reverse();
    if (ordered.length === 0) {
      return [] as Array<{ fecha: string; peso: number; heightPct: number }>;
    }

    const pesos = ordered.map(item => Number(item.peso));
    const min = Math.min(...pesos);
    const max = Math.max(...pesos);
    const spread = max - min;

    return ordered.map(item => {
      const value = Number(item.peso);
      const normalized = spread <= 0 ? 1 : (value - min) / spread;

      return {
        fecha: item.fecha,
        peso: value,
        heightPct: 20 + normalized * 80,
      };
    });
  }, [data]);

  if (bars.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Sin registros aun</Text>
      </View>
    );
  }

  const minPeso = Math.min(...bars.map(item => item.peso));
  const maxPeso = Math.max(...bars.map(item => item.peso));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tendencia de peso</Text>
      <Text style={styles.subtitle}>Ultimos {bars.length} registros</Text>

      <View style={styles.chartWrap}>
        <View style={styles.barsRow}>
          {bars.map(bar => (
            <View key={`${bar.fecha}-${bar.peso}`} style={styles.barItem}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${bar.heightPct}%` }]} />
              </View>
              <Text style={styles.barDate} numberOfLines={1}>
                {bar.fecha.slice(5)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Min: {minPeso.toFixed(1)} kg</Text>
        <Text style={styles.legendText}>Max: {maxPeso.toFixed(1)} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  title: {
    color: '#243924',
    fontWeight: '800',
    fontSize: 14,
  },
  subtitle: {
    marginTop: 3,
    color: '#647260',
    fontWeight: '600',
    fontSize: 12,
  },
  chartWrap: {
    marginTop: 12,
    backgroundColor: '#f7faf4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  barsRow: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    height: 110,
    backgroundColor: '#e6ecdf',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#2f5d3a',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barDate: {
    marginTop: 6,
    fontSize: 10,
    color: '#5d6e5a',
    fontWeight: '700',
  },
  legendRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    color: '#50624f',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    color: '#6d7c69',
    fontWeight: '700',
  },
});
