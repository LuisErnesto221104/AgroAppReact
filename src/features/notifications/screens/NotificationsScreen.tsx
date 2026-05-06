import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  SectionList,
  Switch,
  ToastAndroid,
  Platform,
} from 'react-native';

import { useCalendarioSanitario } from '../../../hooks/useCalendarioSanitario';
import type { EventoSanitarioModel } from '../../../types/Sanitario';
import { COLORS, FONTS } from '../../../shared/theme/identity';
import {
  cancelarNotificacionesEventos,
  getNotificationsEnabled,
  reprogramarNotificacionesEventos,
  setNotificationsEnabled,
  programarNotificacionEvento,
  checkNotificationPermission,
  openAppSettings,
} from '../../../shared/services/notificacionSanitaria';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const today = new Date();
  const [filter, setFilter] = useState<'todas' | 'noLeidas' | 'ajustes'>('todas');
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [alertsEnabled, setAlertsEnabledState] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [syncingAlerts, setSyncingAlerts] = useState(false);
  const { eventsByDate } = useCalendarioSanitario(today.getFullYear(), today.getMonth() + 1);

  const uniqueEventos = useMemo(() => {
    const values = Object.values(eventsByDate).flat();
    return Array.from(new Map(values.map(evento => [evento.id, evento])).values());
  }, [eventsByDate]);

  React.useEffect(() => {
    void getNotificationsEnabled().then(setAlertsEnabledState).catch(() => {
      setAlertsEnabledState(true);
    });
    void checkNotificationPermission().then(granted => setPermissionGranted(granted)).catch(() => setPermissionGranted(false));
  }, []);

  const notifications = useMemo(() => {
    const entries = Object.entries(eventsByDate).flatMap(([dateKey, eventos]) =>
      eventos.map(evento => buildNotificationFromEvent(evento, dateKey, today)),
    );

    const grouped = entries.sort((a, b) => b.priority - a.priority);
    return grouped;
  }, [eventsByDate, today]);

  const todayItems = notifications.filter(item => item.group === 'Hoy');
  const olderItems = notifications.filter(item => item.group === 'Anteriores');
  const futureItems = notifications.filter(item => item.group === 'Próximas');
  const sections = useMemo(
    () => [
      { title: 'Hoy', data: todayItems },
      { title: 'Próximas', data: futureItems },
      { title: 'Anteriores', data: olderItems },
    ],
    [futureItems, olderItems, todayItems],
  );
  const visibleSections = useMemo(
    () => sections.filter(section => section.data.length > 0),
    [sections],
  );

  if (selectedItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <View style={styles.header}>
          <Pressable onPress={() => setSelectedItem(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Detalle</Text>
            <Text style={styles.subtitle}>Notificación sanitaria</Text>
          </View>
        </View>

        <View style={styles.detailContainer}>
          <View style={[styles.detailAccent, { backgroundColor: selectedItem.accent }]} />
          <View style={styles.detailCard}>
            <View style={[styles.iconCircle, { backgroundColor: `${selectedItem.accent}22` }]}>
              <Text style={styles.iconText}>{selectedItem.icon}</Text>
            </View>

            <Text style={styles.detailTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailSubtitle}>{selectedItem.subtitle}</Text>
            <Text style={styles.detailMeta}>{selectedItem.meta}</Text>

            <View style={styles.detailInfoBox}>
              <Text style={styles.detailInfoLabel}>Grupo</Text>
              <Text style={styles.detailInfoValue}>{selectedItem.group}</Text>
              <Text style={styles.detailInfoLabel}>Fecha</Text>
              <Text style={styles.detailInfoValue}>{formatDateLong(selectedItem.dateKey)} · {relativeDateLabel(selectedItem.dateKey)}</Text>
              <Text style={styles.detailInfoLabel}>Estado</Text>
              <Text style={styles.detailInfoValue}>{selectedItem.unread ? 'Pendiente' : 'Leída'}</Text>
            </View>

            <Pressable style={styles.detailAction} onPress={() => setSelectedItem(null)}>
              <Text style={styles.detailActionText}>Volver al listado</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const openBatterySettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Ajustes', 'No se pudieron abrir los ajustes del sistema.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>Alertas locales offline</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <SummaryPill label="Hoy" value={todayItems.length} tone="red" />
          <SummaryPill label="Próximas" value={futureItems.length} tone="amber" />
          <SummaryPill label="Anteriores" value={olderItems.length} tone="green" />
        </View>

        <View style={styles.tabsRow}>
          <TabButton label="Todas" active={filter === 'todas'} onPress={() => setFilter('todas')} />
          <TabButton label="No leídas" active={filter === 'noLeidas'} onPress={() => setFilter('noLeidas')} />
          <TabButton label="Ajustes" active={filter === 'ajustes'} onPress={() => setFilter('ajustes')} />
        </View>

        {filter === 'ajustes' ? (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsPanelTitle}>Ajustes de alertas locales</Text>
            <Text style={styles.settingsPanelSubtitle}>Gestiona permisos y comportamiento del canal sanitario.</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleRowTextWrap}>
                <Text style={styles.toggleRowTitle}>Alertas activas</Text>
                <Text style={styles.toggleRowText}>
                  {alertsEnabled ? 'Las notificaciones se programan normalmente.' : 'No se programarán nuevas alertas.'}
                </Text>
              </View>
              <Switch
                value={alertsEnabled}
                onValueChange={async value => {
                  setAlertsEnabledState(value);
                  await setNotificationsEnabled(value);
                }}
                trackColor={{ false: '#d7d7d7', true: COLORS.primary }}
                thumbColor="#ffffff"
              />
            </View>

              <Pressable
                style={[styles.syncButton, syncingAlerts && styles.syncButtonDisabled]}
                disabled={syncingAlerts}
                onPress={async () => {
                  try {
                    setSyncingAlerts(true);
                    const result = await reprogramarNotificacionesEventos(uniqueEventos);
                    Alert.alert('Listo', `Se reprogramaron ${result.programadas} eventos del mes.`);
                  } catch {
                    Alert.alert('Error', 'No se pudieron reprogramar las alertas.');
                  } finally {
                    setSyncingAlerts(false);
                  }
                }}
              >
                <Text style={styles.syncButtonText}>{syncingAlerts ? 'Reprogramando...' : 'Reprogramar mes visible'}</Text>
              </Pressable>

              <Pressable
                style={[styles.cancelButton, syncingAlerts && styles.syncButtonDisabled]}
                disabled={syncingAlerts}
                onPress={async () => {
                  try {
                    setSyncingAlerts(true);
                    const result = await cancelarNotificacionesEventos(uniqueEventos);
                    Alert.alert('Listo', `Se cancelaron ${result.canceladas} eventos del mes.`);
                  } catch {
                    Alert.alert('Error', 'No se pudieron cancelar las alertas.');
                  } finally {
                    setSyncingAlerts(false);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>{syncingAlerts ? 'Cancelando...' : 'Cancelar mes visible'}</Text>
              </Pressable>

            <SettingsRow
              icon="🔔"
              title="Permisos de notificación"
              text={
                permissionGranted == null
                  ? 'Comprobando permiso...'
                  : permissionGranted
                    ? 'Permiso concedido'
                    : 'Permiso denegado - abrir ajustes'
              }
              onPress={async () => {
                if (Platform.OS === 'android' && Platform.Version >= 33 && permissionGranted === false) {
                  await openAppSettings();
                  return;
                }

                await openAppSettings();
              }}
            />
            <SettingsRow
              icon="🔋"
              title="Batería y segundo plano"
              text="Permitir ejecución en segundo plano y exclusiones de ahorro"
              onPress={openBatterySettings}
            />
            <SettingsRow
              icon="⏰"
              title="Canal sanitario"
              text="Notificaciones de vacunas, desparasitación y enfermedad"
              onPress={openBatterySettings}
            />
          </View>
        ) : (
          <SectionList
            sections={filter === 'noLeidas' ? [{ title: 'Hoy', data: todayItems }] : visibleSections}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <NotificationCard item={item} onPress={() => setSelectedItem(item)} />}
            renderSectionHeader={({ section }) => <SectionHeader title={section.title} count={section.data.length} />}
            ListEmptyComponent={<EmptyMessage text="No hay notificaciones registradas." />}
            ListFooterComponent={<SettingsShortcut onPress={openBatterySettings} />}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  group: 'Hoy' | 'Próximas' | 'Anteriores';
  accent: string;
  unread?: boolean;
  icon: string;
  priority: number;
  dateKey: string;
  evento?: EventoSanitarioModel;
};

const getAnimalLabel = (evento: EventoSanitarioModel) => {
  const nombre = evento.descripcion?.trim() || evento.tipoEvento;
  return `Animal: ${nombre} (arete: ${evento.animalId})`;
};

const buildNotificationFromEvent = (
  evento: EventoSanitarioModel,
  dateKey: string,
  today: Date,
): NotificationItem => {
  const eventDate = new Date(`${dateKey}T00:00:00`);
  const diffDays = Math.round((eventDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  const isToday = diffDays === 0;
  const isFuture = diffDays > 0;
  const type = String(evento.tipoEvento);
  const baseTitle = eventLabelByType(type, evento);
  const subtitle = getAnimalLabel(evento);

  return {
    id: `${evento.id}-${dateKey}`,
    title: isToday ? `${baseTitle} Vence Hoy` : isFuture ? `${baseTitle} Próxima` : `${baseTitle} Anterior`,
    subtitle,
    meta: isToday
      ? `Hoy · ${formatClock(selectedTimeFor(evento))} · Toca para ver detalle`
      : isFuture
        ? `Programado para ${relativeDateLabel(dateKey)} a las ${formatClock(selectedTimeFor(evento))}`
        : `${relativeDateLabel(dateKey)} · ${formatDateLong(dateKey)}`,
    group: isToday ? 'Hoy' : isFuture ? 'Próximas' : 'Anteriores',
    accent: accentByType(type),
    unread: isToday,
    icon: iconByType(type),
    priority: isToday ? 100 : isFuture ? 50 : 10,
    dateKey,
    evento,
  };
};

const eventLabelByType = (type: string, evento: EventoSanitarioModel) => {
  const description = evento.descripcion?.trim();
  if (description) {
    return description;
  }

  switch (type) {
    case 'VACUNA':
      return 'Vacuna';
    case 'DESPARASITACION':
      return 'Desparasitación';
    case 'ENFERMEDAD':
      return 'Tratamiento';
    case 'CIRUGIA':
      return 'Cirugía';
    default:
      return 'Evento';
  }
};

const accentByType = (type: string) => {
  switch (type) {
    case 'VACUNA':
      return '#e53935';
    case 'DESPARASITACION':
      return '#FFA000';
    case 'ENFERMEDAD':
      return '#2e7d32';
    case 'CIRUGIA':
      return '#2e7d32';
    default:
      return '#c6c6c6';
  }
};

const iconByType = (type: string) => {
  switch (type) {
    case 'VACUNA':
      return '💉';
    case 'DESPARASITACION':
      return '💊';
    case 'ENFERMEDAD':
      return '🩺';
    case 'CIRUGIA':
      return '✅';
    default:
      return '•';
  }
};

const formatMetaDay = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const formatDateLong = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const relativeDateLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetNormalized.getTime() - todayNormalized.getTime()) / 86400000);

  if (diffDays === 0) {
    return 'Hoy';
  }
  if (diffDays === 1) {
    return 'Mañana';
  }
  if (diffDays === -1) {
    return 'Ayer';
  }

  if (diffDays > 1) {
    return `En ${diffDays} días`;
  }

  return `Hace ${Math.abs(diffDays)} días`;
};

const selectedTimeFor = (evento: EventoSanitarioModel) => {
  return evento.fechaProximoEvento ? '08:00' : '09:00';
};

const formatClock = (time: string) => time;

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'red' | 'amber' | 'green';
}) {
  return (
    <View style={[styles.summaryPill, tone === 'red' && styles.summaryPillRed, tone === 'amber' && styles.summaryPillAmber, tone === 'green' && styles.summaryPillGreen]}>
      <Text style={styles.summaryPillValue}>{value}</Text>
      <Text style={styles.summaryPillLabel}>{label}</Text>
    </View>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

function NotificationCard({ item, onPress }: { item: NotificationItem; onPress: () => void }) {
  const handleReprogram = async () => {
    if (!item.evento) {
      Alert.alert('Error', 'Evento no disponible para reprogramar.');
      return;
    }

    try {
      await programarNotificacionEvento(item.evento);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Notificación reprogramada', ToastAndroid.SHORT);
      } else {
        Alert.alert('Listo', 'Notificación reprogramada.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo reprogramar la notificación.');
    }
  };

  const handleCancel = async () => {
    if (!item.evento) {
      Alert.alert('Error', 'Evento no disponible para cancelar.');
      return;
    }

    try {
      await cancelarNotificacionesEventos([item.evento]);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Notificación cancelada', ToastAndroid.SHORT);
      } else {
        Alert.alert('Listo', 'Notificación cancelada.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo cancelar la notificación.');
    }
  };

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.accentBar, { backgroundColor: item.accent }]} />
      <View style={styles.card}>
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={onPress}>
          <View style={[styles.iconCircle, { backgroundColor: `${item.accent}22` }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardMeta}>{item.meta}</Text>
          </View>
        </Pressable>

        <View style={styles.cardActions}>
          <Pressable style={styles.cardActionButton} onPress={handleReprogram}>
            <Text style={styles.cardActionText}>Reprogramar</Text>
          </Pressable>
          <Pressable style={styles.cardActionOutline} onPress={handleCancel}>
            <Text style={styles.cardActionOutlineText}>Cancelar</Text>
          </Pressable>
        </View>

        {item.unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </View>
  );
}

function SettingsShortcut({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.settingsShortcut} onPress={onPress}>
      <Text style={styles.settingsShortcutIcon}>⚙️</Text>
      <View style={styles.settingsShortcutBody}>
        <Text style={styles.settingsShortcutTitle}>Ajustes de alertas locales</Text>
        <Text style={styles.settingsShortcutText}>Verificar permisos de batería y fondo</Text>
      </View>
    </Pressable>
  );
}

function SettingsRow({
  icon,
  title,
  text,
  onPress,
}: {
  icon: string;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsRowIconWrap}>
        <Text style={styles.settingsRowIcon}>{icon}</Text>
      </View>
      <View style={styles.settingsRowBody}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        <Text style={styles.settingsRowText}>{text}</Text>
      </View>
      <Text style={styles.settingsRowChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#d3e7d8',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  summaryPillRed: {
    borderColor: '#f0c7c7',
    backgroundColor: '#fff7f7',
  },
  summaryPillAmber: {
    borderColor: '#f2ddb4',
    backgroundColor: '#fffaf1',
  },
  summaryPillGreen: {
    borderColor: '#cae8d4',
    backgroundColor: '#f7fff8',
  },
  summaryPillValue: {
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  summaryPillLabel: {
    marginTop: 2,
    color: '#8b8b8b',
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: '#808080',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#222222',
    fontFamily: FONTS.bold,
  },
  sectionDivider: {
    height: 10,
  },
  sectionHeaderWrap: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCount: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#eaf2ea',
    color: '#23603a',
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  emptyText: {
    color: '#888888',
    fontFamily: FONTS.regular,
    marginBottom: 10,
  },
  cardWrap: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    minHeight: 82,
  },
  accentBar: {
    width: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    color: '#222222',
    fontFamily: FONTS.bold,
  },
  cardSubtitle: {
    marginTop: 2,
    color: '#60936b',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  cardMeta: {
    marginTop: 3,
    color: '#a3a3a3',
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#c62f2f',
    marginLeft: 10,
  },
  cardActions: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardActionButton: {
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  cardActionText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  cardActionOutline: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
    backgroundColor: '#ffffff',
  },
  cardActionOutlineText: {
    color: '#444444',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  settingsShortcut: {
    marginTop: 12,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#ffffff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsShortcutIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  settingsShortcutBody: {
    flex: 1,
  },
  settingsShortcutTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  settingsShortcutText: {
    color: '#9a9a9a',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsPanel: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  settingsPanelTitle: {
    color: '#23603a',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  settingsPanelSubtitle: {
    marginTop: 4,
    color: '#9a9a9a',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef2ee',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ee',
    marginBottom: 8,
  },
  toggleRowTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleRowTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  toggleRowText: {
    color: '#8d8d8d',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef2ee',
  },
  settingsRowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef5ef',
    marginRight: 10,
  },
  settingsRowIcon: {
    fontSize: 18,
  },
  settingsRowBody: {
    flex: 1,
  },
  settingsRowTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  settingsRowText: {
    color: '#8d8d8d',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsRowChevron: {
    color: '#b4b4b4',
    fontSize: 20,
    marginLeft: 8,
  },
  syncButton: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 12,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  cancelButton: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#d9d9d9',
  },
  cancelButtonText: {
    color: '#4b4b4b',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  detailAccent: {
    width: 4,
    height: 240,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    position: 'absolute',
    left: 16,
    top: 18,
  },
  detailCard: {
    marginLeft: 4,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    minHeight: 240,
  },
  detailTitle: {
    marginTop: 12,
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  detailSubtitle: {
    marginTop: 4,
    color: '#60936b',
    fontFamily: FONTS.semiBold,
  },
  detailMeta: {
    marginTop: 4,
    color: '#a3a3a3',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  detailInfoBox: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    padding: 12,
  },
  detailInfoLabel: {
    marginTop: 4,
    color: '#8a8a8a',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  detailInfoValue: {
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  detailAction: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailActionText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
  },
});
