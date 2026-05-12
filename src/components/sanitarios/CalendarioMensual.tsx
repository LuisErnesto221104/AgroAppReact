import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { EventoSanitarioModel, TipoEvento } from '../../types/Sanitario';

type Props = {
  year: number;
  month: number; // 1-12
  eventos: Record<string, EventoSanitarioModel[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const DOT_COLORS: Record<string, string> = {
  VACUNA: '#39a861',
  DESPARASITACION: '#FFA000',
  ENFERMEDAD: '#D32F2F',
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function buildMonthMatrix(year: number, month: number) {
  // month: 1-12
  const first = new Date(year, month - 1, 1);
  const startDay = first.getDay(); // 0-6 Sun-Sat
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: number[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7) as number[]);
  }
  return weeks;
}

const DayCell = memo(function DayCell({
  year,
  month,
  day,
  eventos,
  selected,
  onPress,
}: {
  year: number;
  month: number;
  day: number | null;
  eventos: Record<string, EventoSanitarioModel[]>;
  selected: boolean;
  onPress: (date: string) => void;
}) {
  if (!day) {
    return <View style={styles.dayCellEmpty} />;
  }

  const dateKey = `${year}-${pad(month)}-${pad(day)}`;
  const lista = eventos[dateKey] || [];

  const typesPresent = Array.from(new Set(lista.map(e => String(e.tipoEvento))));

  return (
    <Pressable
      onPress={() => onPress(dateKey)}
      style={[styles.dayCell, selected && styles.dayCellSelected]}
    >
      <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>{day}</Text>
      <View style={styles.dotsRow}>
        {typesPresent.slice(0, 3).map((t) => (
          <View key={t} style={[styles.dot, { backgroundColor: DOT_COLORS[t] || '#888' }]} />
        ))}
      </View>
    </Pressable>
  );
});

export default function CalendarioMensual({ year, month, eventos, selectedDate, onSelectDate }: Props) {
  const weeks = buildMonthMatrix(year, month);

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
          <Text key={d} style={styles.weekHeaderText}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, i) => (
        <View key={String(i)} style={styles.weekRow}>
          {week.map((day, idx) => (
            <DayCell
              key={String(idx)}
              year={year}
              month={month}
              day={day ?? null}
              eventos={eventos}
              selected={selectedDate === (day ? `${year}-${pad(month)}-${pad(day)}` : null)}
              onPress={onSelectDate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', color: '#6b6b6b', fontSize: 12 },
  weekRow: { flexDirection: 'row', marginTop: 6 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dayCellEmpty: { flex: 1, aspectRatio: 1 },
  dayNumber: { color: '#222' },
  dayNumberSelected: { color: '#fff' },
  dayCellSelected: { backgroundColor: '#07612d' },
  dotsRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
