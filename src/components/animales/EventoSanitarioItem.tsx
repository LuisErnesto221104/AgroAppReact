import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EventoSanitarioResumen } from '../../types/Animal';

type EventoSanitarioItemProps = {
  evento: EventoSanitarioResumen;
};

export function EventoSanitarioItem({ evento }: EventoSanitarioItemProps) {
  const titulo = evento.enfermedad?.trim() || 'Evento sanitario';
  const fecha = evento.fecha || 'Sin fecha';
  const detalle =
    evento.tratamiento?.trim() ||
    evento.sintomas?.trim() ||
    evento.observaciones?.trim() ||
    'Sin detalle';

  return (
    <View style={styles.card}>
      <View style={styles.leftAccent} />
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>🩺</Text>
      </View>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.detail}>{detalle}</Text>
        <Text style={styles.fecha}>Aplicado: {fecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#3aa65f',
    marginRight: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e3ebdf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    color: '#1f1f1f',
    fontWeight: '800',
    fontSize: 14,
  },
  detail: {
    marginTop: 2,
    color: '#5a5a5a',
    fontWeight: '600',
    fontSize: 12,
  },
  fecha: {
    marginTop: 2,
    color: '#8a8a8a',
    fontWeight: '600',
    fontSize: 11,
  },
});
