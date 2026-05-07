import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS, COLORS } from '../shared/theme/identity';
import type { EventoSanitarioModel } from '../types/Sanitario';

type Props = {
  evento: EventoSanitarioModel;
  onEditar?: () => void;
};

const colorByTipo = (tipo?: string) => {
  switch (tipo) {
    case 'VACUNA':
      return '#2e7d32';
    case 'DESPARASITACION':
      return '#FFA000';
    case 'ENFERMEDAD':
      return '#e53935';
    case 'CIRUGIA':
      return '#fb8c00';
    default:
      return '#9e9e9e';
  }
};

export default function EventoClinicoCard({ evento, onEditar }: Props) {
  const [expanded, setExpanded] = useState(false);
  const fecha = evento.fechaEvento || evento.fechaProgramada || '';
  const fechaLabel = (() => {
    try {
      const d = new Date(fecha + 'T00:00:00');
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  })();

  const descripcion = evento.descripcion || '';
  const short = descripcion.length > 80 && !expanded ? descripcion.slice(0, 80) + '…' : descripcion;

  return (
    <View style={styles.card}>
      <View style={[styles.chip, { backgroundColor: `${colorByTipo(evento.tipoEvento)}22`, borderColor: colorByTipo(evento.tipoEvento) }]}>
        <Text style={[styles.chipText, { color: colorByTipo(evento.tipoEvento) }]}>{evento.tipoEvento}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>{fechaLabel}</Text>
        <Text style={styles.description}>{short}</Text>
        {descripcion.length > 80 ? (
          <Pressable onPress={() => setExpanded(v => !v)}>
            <Text style={styles.toggle}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
          </Pressable>
        ) : null}

        <View style={styles.metaRow}>
          {evento.veterinario ? <Text style={styles.metaText}>{evento.veterinario}</Text> : null}
          {evento.dosis ? <Text style={styles.metaText}> · {evento.dosis}</Text> : null}
        </View>
      </View>

      {onEditar ? (
        <Pressable style={styles.editBtn} onPress={onEditar}>
          <Text style={styles.editTxt}>Editar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  body: {
    flex: 1,
  },
  date: {
    fontFamily: FONTS.semiBold,
    color: '#333333',
    marginBottom: 6,
  },
  description: {
    fontFamily: FONTS.regular,
    color: '#222222',
  },
  toggle: {
    marginTop: 6,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#555555',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  editBtn: {
    marginLeft: 10,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editTxt: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
