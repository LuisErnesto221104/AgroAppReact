import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../../../shared/theme/identity';
import { HomeModuleRoute } from '../types/homeNavigation';

const QUICK_ACTIONS = [
  { key: 'animal', icon: '🐄', label: 'Animal', target: 'animals' as HomeModuleRoute },
  { key: 'salud', icon: '💉', label: 'Sanidad', target: 'health' as HomeModuleRoute },
  { key: 'gasto', icon: '💵', label: 'Gasto', target: 'costs' as HomeModuleRoute },
];

const UPCOMING_TASKS = [
  {
    key: 'desparasitacion',
    icon: '💊',
    title: 'Desparasitacion Interna',
    subtitle: 'El Negro • #0011322017',
    due: 'Manana',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'aftosa',
    icon: '💉',
    title: 'Vacuna Aftosa',
    subtitle: 'La Pintita • #0011302841',
    due: 'En 3 dias',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'vitamina',
    icon: '🧪',
    title: 'Vitamina B12',
    subtitle: 'Manchas • #0011299034',
    due: 'En 5 dias',
    statusColor: '#7f916f',
    accentColor: '#8ba073',
  },
];

const NAV_TABS = [
  { key: 'animals', icon: '🐄', label: 'Animales', target: 'animals' as HomeModuleRoute },
  { key: 'health', icon: '💉', label: 'Sanitario', target: 'health' as HomeModuleRoute },
  { key: 'costs', icon: '💵', label: 'Gastos', target: 'costs' as HomeModuleRoute },
  { key: 'reports', icon: '📊', label: 'Reportes', target: 'reports' as HomeModuleRoute },
];

type HomeScreenProps = {
  onOpenModule: (target: HomeModuleRoute) => void;
};

export function HomeScreen({ onOpenModule }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const headerBodyHeight = isCompact ? 64 : 72;
  const headerHeight = headerBodyHeight + insets.top;
  const navInset = Math.max(insets.bottom, 8);
  const navHeight = 56 + navInset;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View
        style={[
          styles.headerCard,
          isCompact && styles.headerCardCompact,
          { paddingTop: insets.top, minHeight: headerHeight },
        ]}
      >
        <View>
          <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hola, Productor</Text>
          <Text style={styles.bienvenida}>Bienvenido</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Image
            source={require('../../../Logos/Logo_Verde_Solo.png')}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + 8,
            paddingBottom: navHeight + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statTitle}>Inventario Total</Text>
            <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>12</Text>
            <Text style={styles.statCaption}>cabezas</Text>
            <View style={styles.statIconBadge}>
              <Text style={styles.statIconText}>🐄</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statTitle}>Vacunas / Eventos</Text>
            <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>3</Text>
            <Text style={styles.statCaption}>proximas</Text>
            <View style={styles.statIconBadgeWarning}>
              <Text style={styles.statIconText}>⚠️</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>Acciones Rapidas</Text>
        <View style={[styles.quickActionsRow, isCompact && styles.quickActionsRowCompact]}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.key}
              style={[styles.quickCard, isCompact && styles.quickCardCompact]}
              onPress={() => onOpenModule(action.target)}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tasksHeaderRow}>
          <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>
            Proximas Tareas (3)
          </Text>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>

        {UPCOMING_TASKS.map(task => (
          <View key={task.key} style={styles.taskCard}>
            <View style={[styles.taskAccent, { backgroundColor: task.accentColor }]} />
            <View style={styles.taskIconWrap}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
            </View>
            <View style={styles.taskBody}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <Text style={[styles.taskDue, { color: task.statusColor }]}>{task.due}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomTabs, { paddingBottom: navInset, minHeight: navHeight }]}> 
        {NAV_TABS.map(tab => (
          <Pressable key={tab.key} style={styles.bottomTabItem} onPress={() => onOpenModule(tab.target)}>
            <Text style={[styles.bottomTabIcon, tab.target === 'animals' && styles.bottomTabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.bottomTabLabel, tab.target === 'animals' && styles.bottomTabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
  headerCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCardCompact: {
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    lineHeight: 24,
  },
  greetingCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  bienvenida: {
    marginTop: 0,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#d8ead9',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLogo: {
    width: 26,
    height: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 118,
    borderLeftWidth: 4,
  },
  statCardGreen: {
    borderLeftColor: '#228f56',
  },
  statCardOrange: {
    borderLeftColor: '#f4a000',
  },
  statTitle: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  statValue: {
    marginTop: 6,
    color: COLORS.black,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statValueCompact: {
    fontSize: 38,
    lineHeight: 42,
  },
  statValueOrange: {
    marginTop: 6,
    color: COLORS.warning,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statCaption: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  statIconBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#e6f2ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadgeWarning: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 10,
  },
  sectionTitleCompact: {
    fontSize: 18,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickActionsRowCompact: {
    gap: 8,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickCardCompact: {
    paddingVertical: 10,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef4ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIcon: {
    fontSize: 18,
  },
  quickLabel: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.listBackground,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  taskAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  taskIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginVertical: 12,
  },
  taskIcon: {
    fontSize: 18,
  },
  taskBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  taskTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  taskSubtitle: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  taskDue: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    alignItems: 'center',
    gap: 3,
  },
  bottomTabIcon: {
    fontSize: 17,
    color: COLORS.gray,
  },
  bottomTabIconActive: {
    color: COLORS.primary,
  },
  bottomTabLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontFamily: FONTS.semiBold,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
