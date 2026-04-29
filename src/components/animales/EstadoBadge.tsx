import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimalEstado } from '../../types/Animal';

type EstadoBadgeProps = {
  estado: AnimalEstado;
};

const ESTADO_LABELS: Record<AnimalEstado, string> = {
  ACTIVO: 'Activo',
  VENDIDO: 'Vendido',
  FALLECIDO: 'Fallecido',
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const badgeStyle =
    estado === 'ACTIVO' ? styles.activoBadge : estado === 'VENDIDO' ? styles.vendidoBadge : styles.fallecidoBadge;

  const textStyle =
    estado === 'ACTIVO' ? styles.activoText : estado === 'VENDIDO' ? styles.vendidoText : styles.fallecidoText;

  return (
    <View style={[styles.baseBadge, badgeStyle]}>
      <Text style={[styles.baseText, textStyle]}>{ESTADO_LABELS[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  baseBadge: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activoBadge: {
    backgroundColor: '#e7f7ec',
    borderColor: '#39a861',
  },
  activoText: {
    color: '#1f7f44',
  },
  vendidoBadge: {
    backgroundColor: '#fff3df',
    borderColor: '#d08a20',
  },
  vendidoText: {
    color: '#b1700c',
  },
  fallecidoBadge: {
    backgroundColor: '#f0f2f3',
    borderColor: '#7c8790',
  },
  fallecidoText: {
    color: '#5e6972',
  },
});
