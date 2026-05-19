import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  NativeModules,
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

const { AnimalModule, AgroBridgeModule } = NativeModules;

const NAV_BAR_HEIGHT = 64; // altura aprox de la barra persistente en AppNavigator

type HomeScreenProps = {
  onOpenModule: (target: HomeModuleRoute) => void;
};

interface DashboardStats {
  inventarioTotal: number;
  activos: number;
  vendidos: number;
  fallecidos: number;
  vacunasPróximas: number;
  tareasCount: number;
}

interface TareaItem {
  id: number;
  tipoEvento: string;
  descripcion: string;
  fechaProximoEvento: string;
  animalId: number;
  arete?: string;
  diasRestantes: number;
}

function diasHasta(fechaStr: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaStr + 'T00:00:00');
  return Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);
}

function labelDias(dias: number): string {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  return `En ${dias} días`;
}

function colorDias(dias: number): string {
  if (dias < 0) return '#D32F2F';
  if (dias <= 1) return '#f4a000';
  if (dias <= 7) return '#f4a000';
  return '#7f916f';
}

const TIPO_ICON: Record<string, string> = {
  VACUNA: '💉',
  DESPARASITACION: '💊',
  ENFERMEDAD: '🩺',
  CIRUGIA: '🔪',
  OTRO: '🧪',
};

export function HomeScreen({ onOpenModule }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const headerBodyHeight = isCompact ? 64 : 72;
  const headerHeight = headerBodyHeight + insets.top;

  const [stats, setStats] = useState<DashboardStats>({
    inventarioTotal: 0,
    activos: 0,
    vendidos: 0,
    fallecidos: 0,
    vacunasPróximas: 0,
    tareasCount: 0,
  });
  const [tareas, setTareas] = useState<TareaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Inventario de animales
      const animales: any[] = (await AnimalModule.listAnimals()) ?? [];
      const activos = animales.filter((a: any) => a.estado === 'ACTIVO').length;
      const vendidos = animales.filter((a: any) => a.estado === 'VENDIDO').length;
      const fallecidos = animales.filter((a: any) => a.estado === 'FALLECIDO').length;

      // Mapa arete por animalId
      const areteMap: Record<number, string> = {};
      animales.forEach((a: any) => { areteMap[a.id] = a.arete; });

      // Eventos del mes actual + próximo mes para capturar eventos futuros cercanos
      const hoy = new Date();
      const [eventos1, eventos2] = await Promise.all([
        AgroBridgeModule.getEventosMes(hoy.getFullYear(), hoy.getMonth() + 1),
        AgroBridgeModule.getEventosMes(
          hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear(),
          hoy.getMonth() === 11 ? 1 : hoy.getMonth() + 2
        ),
      ]);

      const todosEventos: any[] = [...(eventos1 ?? []), ...(eventos2 ?? [])];

      // Filtrar solo los que tienen fecha próxima (pendientes)
      const hoy0 = new Date();
      hoy0.setHours(0, 0, 0, 0);

      const eventosConProxima = todosEventos
        .filter((e: any) => e.fechaProximoEvento && e.fechaProximoEvento.trim() !== '')
        .map((e: any) => ({
          id: e.id,
          tipoEvento: e.tipoEvento ?? 'OTRO',
          descripcion: e.descripcion ?? '',
          fechaProximoEvento: e.fechaProximoEvento,
          animalId: e.animalId,
          arete: areteMap[e.animalId] ?? String(e.animalId),
          diasRestantes: diasHasta(e.fechaProximoEvento),
        }))
        // Eliminar duplicados por id
        .filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx)
        // Solo los que vencen en los próximos 30 días o ya vencidos
        .filter(e => e.diasRestantes <= 30)
        .sort((a, b) => a.diasRestantes - b.diasRestantes);

      const próximas = eventosConProxima.filter(e => e.diasRestantes <= 30).length;

      setStats({
        inventarioTotal: animales.length,
        activos,
        vendidos,
        fallecidos,
        vacunasPróximas: próximas,
        tareasCount: próximas,
      });
      setTareas(eventosConProxima.slice(0, 5));
    } catch (err) {
      // Sin datos de BD, muestra 0s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header fijo */}
      <View
        style={[
          styles.headerCard,
          isCompact && styles.headerCardCompact,
          { paddingTop: insets.top, minHeight: headerHeight },
        ]}
      >
        <View>
          <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hola, Productor</Text>
          <Text style={styles.bienvenida}>Bienvenido a tu rancho digital</Text>
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
            paddingBottom: NAV_BAR_HEIGHT + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <Pressable
                style={[styles.statCard, styles.statCardGreen]}
                onPress={() => onOpenModule('animals')}
              >
                <Text style={styles.statTitle}>Inventario Total</Text>
                <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>
                  {stats.inventarioTotal}
                </Text>
                <Text style={styles.statCaption}>cabezas</Text>
                <View style={styles.statDetail}>
                  <Text style={styles.statDetailText}>Activos: {stats.activos}</Text>
                  <Text style={styles.statDetailText}>Vendidos: {stats.vendidos}</Text>
                </View>
                <View style={styles.statIconBadge}>
                  <Text style={styles.statIconText}>🐄</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.statCard, styles.statCardOrange]}
                onPress={() => onOpenModule('health')}
              >
                <Text style={styles.statTitle}>Vacunas / Eventos</Text>
                <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>
                  {stats.vacunasPróximas}
                </Text>
                <Text style={styles.statCaption}>próximos 30 días</Text>
                <View style={styles.statDetail}>
                  <Text style={styles.statDetailText}>
                    {stats.vacunasPróximas === 0 ? 'Sin pendientes' : 'Pendientes'}
                  </Text>
                </View>
                <View style={styles.statIconBadgeWarning}>
                  <Text style={styles.statIconText}>⚠️</Text>
                </View>
              </Pressable>
            </View>

            {/* Próximas Tareas */}
            <View style={styles.tasksHeaderRow}>
              <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>
                Próximas Tareas
              </Text>
              {stats.tareasCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{stats.tareasCount}</Text>
                </View>
              )}
              <Pressable onPress={() => onOpenModule('health')}>
                <Text style={styles.seeAll}>Ver todo</Text>
              </Pressable>
            </View>

            {tareas.length === 0 ? (
              <View style={styles.emptyTareas}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
                <Text style={styles.emptySubtitle}>No hay eventos sanitarios próximos</Text>
              </View>
            ) : (
              tareas.map(tarea => (
                <Pressable
                  key={tarea.id}
                  style={styles.taskCard}
                  onPress={() => onOpenModule('health')}
                >
                  <View
                    style={[
                      styles.taskAccent,
                      { backgroundColor: colorDias(tarea.diasRestantes) },
                    ]}
                  />
                  <View style={styles.taskIconWrap}>
                    <Text style={styles.taskIcon}>
                      {TIPO_ICON[tarea.tipoEvento] ?? '🧪'}
                    </Text>
                  </View>
                  <View style={styles.taskBody}>
                    <Text style={styles.taskTitle}>
                      {tarea.tipoEvento.charAt(0) + tarea.tipoEvento.slice(1).toLowerCase()}
                    </Text>
                    <Text style={styles.taskSubtitle} numberOfLines={1}>
                      {tarea.descripcion || 'Sin descripción'} · #{tarea.arete}
                    </Text>
                    <Text
                      style={[styles.taskDue, { color: colorDias(tarea.diasRestantes) }]}
                    >
                      {labelDias(tarea.diasRestantes)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
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
  loadingWrap: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 128,
    borderLeftWidth: 4,
  },
  statCardGreen: { borderLeftColor: '#228f56' },
  statCardOrange: { borderLeftColor: '#f4a000' },
  statTitle: {
    color: COLORS.gray,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
  },
  statValue: {
    marginTop: 4,
    color: COLORS.black,
    fontSize: 40,
    fontFamily: FONTS.bold,
    lineHeight: 44,
  },
  statValueCompact: {
    fontSize: 34,
    lineHeight: 38,
  },
  statValueOrange: {
    marginTop: 4,
    color: COLORS.warning,
    fontSize: 40,
    fontFamily: FONTS.bold,
    lineHeight: 44,
  },
  statCaption: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  statDetail: {
    marginTop: 6,
    gap: 2,
  },
  statDetailText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  statIconBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e6f2ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadgeWarning: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { fontSize: 13 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  sectionTitleCompact: { fontSize: 17 },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#f4a000',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  seeAll: {
    marginLeft: 'auto',
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  emptyTareas: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    gap: 6,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.black,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginVertical: 12,
  },
  taskIcon: { fontSize: 17 },
  taskBody: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  taskTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  taskSubtitle: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  taskDue: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
});
