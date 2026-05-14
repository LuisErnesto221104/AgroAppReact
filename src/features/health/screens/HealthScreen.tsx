import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, TextInput, Modal, ScrollView, FlatList } from 'react-native';

import CalendarioSanitario from '../../../screens/sanitarios/CalendarioSanitario';
import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';
import { NotificationsScreen } from '../../../features/notifications/screens/NotificationsScreen';
import { RecomendacionesNutricionales } from '../../../screens/nutricion/RecomendacionesNutricionales';
import { obtenerEventosMes } from '../../../native/BridgeModule';
import { EventoSanitarioItem } from '../../../components/animales/EventoSanitarioItem';
import { EventoDetailModal } from '../../../components/EventoDetailModal';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  const [view, setView] = useState<'lista' | 'registro' | 'nutricion'>('lista');
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filter, setFilter] = useState<'pendientes' | 'historial' | 'vacunas'>('pendientes');
  const [selectedAnimalForRegister, setSelectedAnimalForRegister] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [detailEvento, setDetailEvento] = useState<any>(null);
  const [areteMap, setAreteMap] = useState<{ [key: number]: string }>({});

  const loadEvents = async (year?: number, month?: number) => {
    setEventsLoading(true);
    try {
      const y = year ?? new Date().getFullYear();
      const m = month ?? new Date().getMonth() + 1;
      const rows = await obtenerEventosMes(y, m);
      setEventsList(rows || []);

      // Extraer arete si viene en el evento, o mapear animalId -> arete
      const newAreteMap: { [key: number]: string } = {};
      rows?.forEach((e: any) => {
        if (e.arete) {
          newAreteMap[e.animalId] = e.arete;
        } else if (e.animalId) {
          newAreteMap[e.animalId] = `${e.animalId}`;
        }
      });
      setAreteMap(newAreteMap);
    } catch (e) {
      setEventsList([]);
    } finally {
      setEventsLoading(false);
    }
  };

  React.useEffect(() => {
    void loadEvents();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredEvents = useMemo(() => {
    if (!eventsList || eventsList.length === 0) return [];

    let list = [...eventsList];

    if (filter === 'vacunas') {
      list = list.filter((e: any) => e.tipoEvento === 'VACUNA');
    } else if (filter === 'historial') {
      list = list.filter((e: any) => !!e.fechaEvento);
    } else {
      // pendientes
      list = list.filter((e: any) => !!e.fechaProximoEvento || !e.fechaEvento);
    }

    // Búsqueda
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      list = list.filter((e: any) => {
        const desc = (e.descripcion || '').toLowerCase();
        const tipo = (e.tipoEvento || '').toLowerCase();
        return desc.includes(query) || tipo.includes(query);
      });
    }

    // Ordenar
    if (filter === 'historial') {
      return list.sort((a: any, b: any) => (b.fechaEvento || '').localeCompare(a.fechaEvento || ''));
    }

    return list.sort((a: any, b: any) => {
      const aDate = a.fechaProximoEvento || a.fechaEvento || '';
      const bDate = b.fechaProximoEvento || b.fechaEvento || '';
      return aDate.localeCompare(bDate);
    });
  }, [eventsList, filter, searchText]);

  // Agrupar por fecha para Historial
  const groupedByDate = useMemo(() => {
    if (filter !== 'historial') return {};

    const groups: { [key: string]: any[] } = {};
    filteredEvents.forEach((e: any) => {
      const date = e.fechaEvento || 'Sin fecha';
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  }, [filteredEvents, filter]);

  if (view === 'nutricion') {
    return <RecomendacionesNutricionales onBack={() => setView('lista')} />;
  }

  if (view === 'registro') {
    return (
      <RegistrarEventoSanitario
        onBack={() => {
          setSelectedAnimalForRegister(null);
          setView('lista');
          void loadEvents();
        }}
        animalId={selectedAnimalForRegister ?? undefined}
      />
    );
  }

  // Lista principal
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Eventos Sanitarios</Text>
      </View>

      {/* SearchBox */}
      <View style={styles.searchWrap}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por tipo o descripción..."
          placeholderTextColor="#999"
          style={styles.searchBox}
        />
      </View>

      {/* Filtros - Scroll horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRowScroll}
        contentContainerStyle={styles.chipsRow}
      >
        <Pressable
          style={[styles.chip, filter === 'pendientes' && styles.chipActive]}
          onPress={() => setFilter('pendientes')}
        >
          <Text style={filter === 'pendientes' ? styles.chipTextActive : styles.chipText}>Pendientes</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === 'historial' && styles.chipActive]}
          onPress={() => setFilter('historial')}
        >
          <Text style={filter === 'historial' ? styles.chipTextActive : styles.chipText}>Historial</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === 'vacunas' && styles.chipActive]}
          onPress={() => setFilter('vacunas')}
        >
          <Text style={filter === 'vacunas' ? styles.chipTextActive : styles.chipText}>Vacunas</Text>
        </Pressable>

        {/* Separador visual */}
        <View style={styles.chipSeparator} />

        {/* Botones secundarios a la derecha */}
        <Pressable style={styles.chipIcon} onPress={() => setShowCalendarModal(true)}>
          <Text style={styles.chipText}>📅 Calendario</Text>
        </Pressable>
        <Pressable style={styles.chipIcon} onPress={() => setShowNotificationsModal(true)}>
          <Text style={styles.chipText}>🔔 Notificaciones</Text>
        </Pressable>
        <Pressable style={[styles.chipIcon, styles.chipNutricion]} onPress={() => setView('nutricion')}>
          <Text style={styles.chipNutricionText}>🌿 Nutrición</Text>
        </Pressable>
      </ScrollView>

      {/* Lista */}
      {eventsLoading ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={{ padding: 10, paddingHorizontal: 12 }}>
          <Text style={styles.emptyText}>
            {filter === 'historial' ? 'Sin historiales todavía.' : 'No hay eventos.'}
          </Text>
        </View>
      ) : filter === 'historial' ? (
        // Historial: agrupado por fechas, sin botones
        <ScrollView style={[styles.listContainer, { paddingHorizontal: 12 }]} contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByDate).map(([date, eventos]) => (
            <View key={date}>
              <Text style={styles.dateGroupTitle}>{date}</Text>
              {(eventos as any[]).map((e: any) => (
                <Pressable
                  key={String(e.id)}
                  style={styles.historialItem}
                  onPress={() => setDetailEvento(e)}
                >
                  <Text style={styles.historialItemType}>{e.tipoEvento || 'Evento'}</Text>
                  <Text style={styles.historialItemDesc}>{e.descripcion || 'Sin descripción'}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        // Pendientes y Vacunas: con botones
        <ScrollView style={[styles.listContainer, { paddingHorizontal: 12 }]} contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {filteredEvents.map((item: any) => {
            const fechaProx = item.fechaProximoEvento ? new Date(item.fechaProximoEvento + 'T00:00:00') : null;
            const isVencido = fechaProx ? fechaProx.getTime() < today.getTime() : false;
            const isPendiente = !!item.fechaProximoEvento;

            const primaryLabel = isVencido ? 'Aplicar' : isPendiente ? 'Revisar' : undefined;

            return (
              <EventoSanitarioItem
                key={String(item.id)}
                evento={item}
                primaryLabel={primaryLabel}
                onPrimaryAction={() => {
                  if (primaryLabel === 'Revisar') {
                    setDetailEvento(item);
                  } else {
                    setSelectedAnimalForRegister(item.animalId ?? null);
                    setView('registro');
                  }
                }}
                onOpenDetail={() => setDetailEvento(item)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setView('registro')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Calendario Sanitario</Text>
            <Pressable onPress={() => setShowCalendarModal(false)} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>✕</Text>
            </Pressable>
          </View>
          <CalendarioSanitario />
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <Pressable onPress={() => setShowNotificationsModal(false)} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>✕</Text>
            </Pressable>
          </View>
          <NotificationsScreen onBack={() => setShowNotificationsModal(false)} />
        </View>
      </Modal>

      {/* Evento Detail Modal */}
      <EventoDetailModal
        visible={!!detailEvento}
        evento={detailEvento}
        onClose={() => setDetailEvento(null)}
        onEdit={(e) => {
          setDetailEvento(null);
          setSelectedAnimalForRegister(e.animalId ?? null);
          setView('registro');
        }}
        arete={detailEvento ? (detailEvento.arete || areteMap[detailEvento.animalId] || String(detailEvento.animalId)) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  title: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
    paddingVertical: 4,
  },
  searchWrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  chipsRowScroll: {
    paddingHorizontal: 8,
    paddingBottom: 6,
    paddingTop: 6,
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingRight: 8,
  },
  chipSeparator: {
    width: 6,
    height: 1,
    backgroundColor: 'transparent',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: '#666',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  chipIcon: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  chipNutricion: {
    backgroundColor: '#e8f5ec',
    borderColor: '#07612d',
  },
  chipNutricionText: {
    color: '#07612d',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: 12,
    fontSize: 12,
  },
  emptyText: {
    color: '#777',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginHorizontal: 12,
  },
  dateGroupTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 10,
    marginBottom: 6,
  },
  historialItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  historialItemType: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#333',
  },
  historialItemDesc: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 16,
    flex: 1,
  },
  closeModalBtn: {
    padding: 8,
  },
  closeModalBtnText: {
    color: '#fff',
    fontSize: 20,
  },
});
