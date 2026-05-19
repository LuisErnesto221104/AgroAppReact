import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import CalendarioMensual from '../../components/sanitarios/CalendarioMensual';
import { useCalendarioSanitario } from '../../hooks/useCalendarioSanitario';
import type { EventoSanitarioModel } from '../../types/Sanitario';
import { COLORS, FONTS } from '../../shared/theme/identity';

export default function CalendarioSanitario() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { eventsByDate, loading } = useCalendarioSanitario(year, month);

  const prevMonth = () => {
    let m = month - 1;
    let y = year;
    if (m < 1) { m = 12; y = year - 1; }
    setMonth(m); setYear(y); setSelectedDate(null);
  };

  const nextMonth = () => {
    let m = month + 1;
    let y = year;
    if (m > 12) { m = 1; y = year + 1; }
    setMonth(m); setYear(y); setSelectedDate(null);
  };

  const eventsForSelected = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={prevMonth} style={styles.navButton}><Text style={styles.navButtonText}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>{month}/{year}</Text>
        <Pressable onPress={nextMonth} style={styles.navButton}><Text style={styles.navButtonText}>›</Text></Pressable>
      </View>

      <CalendarioMensual
        year={year}
        month={month}
        eventos={eventsByDate}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#39a861'}]} /><Text style={styles.legendText}>Vacuna</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#FFA000'}]} /><Text style={styles.legendText}>Desparasitación</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#D32F2F'}]} /><Text style={styles.legendText}>Enfermedad</Text></View>
      </View>

      <View style={styles.listWrap}>
        <Text style={styles.sectionTitle}>Eventos {selectedDate ? ` - ${selectedDate}` : ''}</Text>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#07612d" />
          </View>
        ) : (
          <FlatList
            data={eventsForSelected}
            keyExtractor={(i: EventoSanitarioModel) => String(i.id)}
            renderItem={({item}) => (
              <View style={styles.eventRow}>
                <Text style={styles.eventTitle}>{item.tipoEvento}</Text>
                <Text style={styles.eventDesc}>{item.descripcion || ''}</Text>
                <Text style={styles.eventMeta}>{item.fechaEvento}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos para este día.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerTitle: { fontFamily: FONTS.bold, color: COLORS.primary },
  navButton: { padding: 8 },
  navButtonText: { fontSize: 20, color: COLORS.primary },
  legendRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#444' },
  listWrap: { flex: 1, marginTop: 8 },
  sectionTitle: { fontFamily: FONTS.bold, marginBottom: 8 },
  eventRow: { padding: 12, backgroundColor: '#f6f6f6', borderRadius: 12, marginBottom: 8 },
  eventTitle: { fontFamily: FONTS.bold, color: COLORS.primary },
  eventDesc: { marginTop: 4 },
  eventMeta: { marginTop: 6, color: '#888', fontSize: 12 },
  emptyText: { color: '#777' },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
});
