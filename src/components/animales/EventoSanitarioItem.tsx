import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { EventoSanitarioResumen } from '../../types/Animal';

type EventoSanitarioItemProps = {
  evento: EventoSanitarioResumen;
  primaryLabel?: string;
  onPrimaryAction?: (evento: EventoSanitarioResumen) => void;
  secondaryLabel?: string;
  onSecondaryAction?: (evento: EventoSanitarioResumen) => void;
  showCompleted?: boolean;
  onOpenDetail?: (evento: EventoSanitarioResumen) => void;
};

export function EventoSanitarioItem({
  evento,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  showCompleted,
  onOpenDetail,
}: EventoSanitarioItemProps) {
  const titulo = evento.enfermedad?.trim() || 'Evento sanitario';
  const fecha = (evento.fechaEvento || evento.fecha) || 'Sin fecha';
  const detalle =
    (evento.observaciones && evento.observaciones.trim()) ||
    (evento.descripcion && evento.descripcion.trim()) ||
    'Sin detalle';

  return (
    <Pressable onPress={() => onOpenDetail && onOpenDetail(evento)} style={styles.card}>
      <View style={styles.leftAccent} />
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>🩺</Text>
      </View>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.detail}>{detalle}</Text>
        <Text style={styles.fecha}>Aplicado: {fecha}</Text>
      </View>
      <View style={styles.actionsWrap}>
        {showCompleted ? (
          <View style={styles.completedBadge}><Text style={{ color: '#fff' }}>✓</Text></View>
        ) : (
          <>
            {secondaryLabel && onSecondaryAction ? (
              <Pressable style={styles.secondaryBtn} onPress={() => onSecondaryAction(evento)}>
                <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
            {primaryLabel && onPrimaryAction ? (
              <Pressable style={styles.primaryBtn} onPress={() => onPrimaryAction(evento)}>
                <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccent: {
    width: 5,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#3aa65f',
    marginRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3ebdf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    color: '#1f1f1f',
    fontWeight: '800',
    fontSize: 16,
  },
  detail: {
    marginTop: 3,
    color: '#5a5a5a',
    fontWeight: '600',
    fontSize: 14,
  },
  fecha: {
    marginTop: 3,
    color: '#8a8a8a',
    fontWeight: '600',
    fontSize: 12,
  },
  actionsWrap: {
    marginLeft: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0a6b33',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 3,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryBtnText: { color: '#333', fontWeight: '700', fontSize: 10 },
  completedBadge: { backgroundColor: '#39a861', padding: 10, borderRadius: 14 },
});
