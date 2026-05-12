# Archivos de src y contenido hasta commit a9d94ef (ActualizacionPin)

- Commit: a9d94ef
- Total de archivos en src: 27

---

## src/Logos/Logo_Blanco_Nombre.png

Archivo binario. No se incluye volcado en texto.

---

## src/Logos/Logo_Blanco_Solo.png

Archivo binario. No se incluye volcado en texto.

---

## src/Logos/Logo_Verde_Nombre.png

Archivo binario. No se incluye volcado en texto.

---

## src/Logos/Logo_Verde_Solo.png

Archivo binario. No se incluye volcado en texto.

---

## src/Logos/Nombre_Blanco.png

Archivo binario. No se incluye volcado en texto.

---

## src/Logos/Nombre_Verde.png

Archivo binario. No se incluye volcado en texto.

---

## src/features/animals/screens/AnimalsScreen.tsx

~~~tsx
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Gestionar Animales"
      description="Ventana base creada. Aqui ira el control del ciclo de vida, altas, identificacion y estados productivos."
      emoji="­ƒÉä"
      onBack={onBack}
    />
  );
}
~~~

---

## src/features/costs/screens/CostsScreen.tsx

~~~tsx
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type CostsScreenProps = {
  onBack: () => void;
};

export function CostsScreen({ onBack }: CostsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Control de Costos"
      description="Ventana base creada. Aqui ira el registro de gastos, insumos, ventas y el balance por animal."
      emoji="­ƒÆÁ"
      onBack={onBack}
    />
  );
}
~~~

---

## src/features/health/screens/HealthScreen.tsx

~~~tsx
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Control Sanitario"
      description="Ventana base creada. Aqui ira la programacion de vacunas, desparasitaciones y seguimiento de eventos de salud."
      emoji="­ƒÆë"
      onBack={onBack}
    />
  );
}
~~~

---

## src/features/home/components/ModuleCard.tsx

~~~tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModuleCardProps = {
  title: string;
  description: string;
};

export function ModuleCard({ title, description }: ModuleCardProps) {
  return (
    <Pressable style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>PROXIMAMENTE</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8e4',
    padding: 14,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#07612d',
    backgroundColor: '#e6f2ec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d1d1b',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#45524a',
  },
});
~~~

---

## src/features/home/screens/HomeScreen.tsx

~~~tsx
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
  { key: 'animal', icon: '­ƒÉä', label: 'Animal', target: 'animals' as HomeModuleRoute },
  { key: 'salud', icon: '­ƒÆë', label: 'Sanidad', target: 'health' as HomeModuleRoute },
  { key: 'gasto', icon: '­ƒÆÁ', label: 'Gasto', target: 'costs' as HomeModuleRoute },
];

const UPCOMING_TASKS = [
  {
    key: 'desparasitacion',
    icon: '­ƒÆè',
    title: 'Desparasitacion Interna',
    subtitle: 'El Negro ÔÇó #0011322017',
    due: 'Manana',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'aftosa',
    icon: '­ƒÆë',
    title: 'Vacuna Aftosa',
    subtitle: 'La Pintita ÔÇó #0011302841',
    due: 'En 3 dias',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'vitamina',
    icon: '­ƒº¬',
    title: 'Vitamina B12',
    subtitle: 'Manchas ÔÇó #0011299034',
    due: 'En 5 dias',
    statusColor: '#7f916f',
    accentColor: '#8ba073',
  },
];

const NAV_TABS = [
  { key: 'animals', icon: '­ƒÉä', label: 'Animales', target: 'animals' as HomeModuleRoute },
  { key: 'health', icon: '­ƒÆë', label: 'Sanitario', target: 'health' as HomeModuleRoute },
  { key: 'costs', icon: '­ƒÆÁ', label: 'Gastos', target: 'costs' as HomeModuleRoute },
  { key: 'reports', icon: '­ƒôè', label: 'Reportes', target: 'reports' as HomeModuleRoute },
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
              <Text style={styles.statIconText}>­ƒÉä</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statTitle}>Vacunas / Eventos</Text>
            <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>3</Text>
            <Text style={styles.statCaption}>proximas</Text>
            <View style={styles.statIconBadgeWarning}>
              <Text style={styles.statIconText}>ÔÜá´©Å</Text>
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
~~~

---

## src/features/home/types/homeNavigation.ts

~~~ts
export type HomeModuleRoute =
  | 'animals'
  | 'health'
  | 'costs'
  | 'reports'
  | 'notifications';
~~~

---

## src/features/notifications/screens/NotificationsScreen.tsx

~~~tsx
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Notificaciones"
      description="Ventana base creada. Aqui ira el envio y control de notificaciones de eventos programados."
      emoji="­ƒöö"
      onBack={onBack}
    />
  );
}
~~~

---

## src/features/reports/screens/ReportsScreen.tsx

~~~tsx
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type ReportsScreenProps = {
  onBack: () => void;
};

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Reportes"
      description="Ventana base creada. Aqui iran los resumenes visuales y documentos exportables del sistema."
      emoji="­ƒôè"
      onBack={onBack}
    />
  );
}
~~~

---

## src/features/startup/screens/SplashScreen.tsx

~~~tsx
import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../../shared/theme/identity';

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.container}>
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <Image
          source={require('../../../Logos/Logo_Blanco_Nombre.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AgroApp</Text>
        <Text style={styles.subtitle}>Gestion Ganadera Offline</Text>
        <Text style={styles.caption}>Cargando inicio...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundCircleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -90,
    right: -70,
  },
  backgroundCircleBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -110,
    left: -80,
  },
  logoBadge: {
    display: 'none',
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  caption: {
    marginTop: 28,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: COLORS.white,
  },
});
~~~

---

## src/native/AuthModule.ts

~~~ts
import { NativeModules } from 'react-native';

type AuthStatus = {
  hasUsers: boolean;
  primaryUserName: string;
  isAdminPrimary: boolean;
};

type AuthSession = {
  ok: boolean;
  userId: number;
  name: string;
  role: 'ADMIN' | 'USUARIO';
};

type AuthRegisterResult = {
  ok: boolean;
  userId: number;
  name: string;
};

type AuthNativeModule = {
  getAuthStatus(): Promise<AuthStatus>;
  loginPrimaryUser(pin: string): Promise<AuthSession>;
  login(nombre: string, pin: string): Promise<AuthSession>;
  registerUser(nombre: string, pin: string): Promise<AuthRegisterResult>;
};

const { AuthModule } = NativeModules;

const getAuthBridge = (): AuthNativeModule => {
  if (!AuthModule) {
    throw new Error('AuthModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return AuthModule as AuthNativeModule;
};

// Estado de autenticacion offline en SQLite local.
export const obtenerEstadoAuth = (): Promise<AuthStatus> => {
  return getAuthBridge().getAuthStatus();
};

// Login principal por PIN (sin red), pensado para el flujo del prototipo.
export const iniciarSesionPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().loginPrimaryUser(pin);
};

// Login explicito por nombre + PIN (tambien offline) para flujos futuros.
export const iniciarSesion = (nombre: string, pin: string): Promise<AuthSession> => {
  return getAuthBridge().login(nombre, pin);
};

// Registro de usuario local con validaciones aplicadas en Java.
export const registrarUsuario = (nombre: string, pin: string): Promise<AuthRegisterResult> => {
  return getAuthBridge().registerUser(nombre, pin);
};
~~~

---

## src/native/BridgeModule.ts

~~~ts
import { NativeModules } from 'react-native';

type BridgeInfo = {
  module: string;
  language: string;
  ready: boolean;
  pattern: string;
};

type AgroBridgeNativeModule = {
  testConnection(nombre: string): Promise<string>;
  getBridgeInfo(): Promise<BridgeInfo>;
};

// Obtenemos el modulo, pero no lanzamos error aqui en tiempo de carga.
// El error se lanzara solo cuando se intente usar la funcion.
const { AgroBridgeModule } = NativeModules;

const getBridge = (): AgroBridgeNativeModule => {
  if (!AgroBridgeModule) {
    throw new Error(
      'AgroBridgeModule no esta disponible. Revisa el registro en AgroAppPackage/MainApplication.',
    );
  }
  return AgroBridgeModule as AgroBridgeNativeModule;
};

// Metodo simple para comprobar una llamada JS -> Java y su respuesta Java -> JS.
export const probarBridge = (nombre: string): Promise<string> => {
  const bridge = getBridge();
  return bridge.testConnection(nombre);
};

// Metodo opcional para validar que el modulo expone metadata esperada.
export const obtenerInfoBridge = (): Promise<BridgeInfo> => {
  const bridge = getBridge();
  return bridge.getBridgeInfo();
};
~~~

---

## src/navigation/AppNavigator.tsx

~~~tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';

import { AnimalsScreen } from '../features/animals/screens/AnimalsScreen';
import { CostsScreen } from '../features/costs/screens/CostsScreen';
import { HealthScreen } from '../features/health/screens/HealthScreen';
import { HomeModuleRoute } from '../features/home/types/homeNavigation';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen';
import { SplashScreen } from '../features/startup/screens/SplashScreen';
import {
  clearSession,
  markAppBackgrounded,
  markSessionAuthenticated,
  resolveStartupSession,
  SESSION_TIMEOUT_MS,
  validateSessionOnForeground,
} from '../shared/services/sessionManager';
import AuthFlow from '../screens/auth/AuthFlow';

type AppRoute = 'startup' | 'auth' | 'home' | HomeModuleRoute;

export default function AppNavigator() {
  const [route, setRoute] = useState<AppRoute>('startup');
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const protectedRoute = route !== 'startup' && route !== 'auth';

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current != null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const expireSession = useCallback(() => {
    clearInactivityTimer();
    clearSession('timeout')
      .catch(() => {
        // Si falla escritura local, forzamos lock de UI de todas maneras.
      })
      .finally(() => setRoute('auth'));
  }, [clearInactivityTimer]);

  const startInactivityTimer = useCallback(() => {
    if (!protectedRoute) {
      clearInactivityTimer();
      return;
    }

    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      expireSession();
    }, SESSION_TIMEOUT_MS);
  }, [clearInactivityTimer, expireSession, protectedRoute]);

  const registerActivity = useCallback(() => {
    startInactivityTimer();
  }, [startInactivityTimer]);

  useEffect(() => {
    let mounted = true;

    // Primero mostramos splash de arranque y luego resolvemos sesion.
    const timer = setTimeout(() => {
      resolveStartupSession()
        .then(hasSession => {
          if (!mounted) {
            return;
          }

          if (hasSession) {
            setRoute('home');
            return;
          }
          setRoute('auth');
        })
        .catch(() => {
          if (mounted) {
            setRoute('auth');
          }
        });
    }, 1800);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (protectedRoute) {
      startInactivityTimer();
      return;
    }

    clearInactivityTimer();
  }, [clearInactivityTimer, protectedRoute, startInactivityTimer]);

  useEffect(() => {
    return () => {
      clearInactivityTimer();
    };
  }, [clearInactivityTimer]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        clearInactivityTimer();
        markAppBackgrounded().catch(() => {
          // No bloqueamos UX por fallas de almacenamiento local.
        });
        return;
      }

      if (nextState === 'active') {
        validateSessionOnForeground()
          .then(isSessionActive => {
            if (!isSessionActive) {
              setRoute('auth');
              return;
            }

            startInactivityTimer();
          })
          .catch(() => {
            setRoute('auth');
          });
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [clearInactivityTimer, startInactivityTimer]);

  const wrapProtectedScreen = (screen: React.ReactNode) => {
    if (!protectedRoute) {
      return screen;
    }

    return (
      <View
        style={styles.protectedContainer}
        onStartShouldSetResponderCapture={() => {
          registerActivity();
          return false;
        }}
        onMoveShouldSetResponderCapture={() => {
          registerActivity();
          return false;
        }}
      >
        {screen}
      </View>
    );
  };

  if (route === 'startup') {
    return <SplashScreen />;
  }

  if (route === 'auth') {
    return (
      <AuthFlow
        onAuthenticated={async () => {
          await markSessionAuthenticated();
          setRoute('home');
        }}
      />
    );
  }

  if (route === 'animals') {
    return wrapProtectedScreen(<AnimalsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'health') {
    return wrapProtectedScreen(<HealthScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'costs') {
    return wrapProtectedScreen(<CostsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'reports') {
    return wrapProtectedScreen(<ReportsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'notifications') {
    return wrapProtectedScreen(<NotificationsScreen onBack={() => setRoute('home')} />);
  }

  return wrapProtectedScreen(<HomeScreen onOpenModule={target => setRoute(target)} />);
}

const styles = StyleSheet.create({
  protectedContainer: {
    flex: 1,
  },
});
~~~

---

## src/screens/auth/AuthFlow.tsx

~~~tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { iniciarSesionPrincipal, obtenerEstadoAuth, registrarUsuario } from '../../native/AuthModule';
import { consumeSessionLockReason, shouldShowAuthIntroOnEntry } from '../../shared/services/sessionManager';
import { LoadingScreen } from './LoadingScreen';
import { PIN_MAX, PIN_MIN } from './authStyles';
import { PinLoginScreen } from './PinLoginScreen';
import { SplashScreen } from './SplashScreen';

type ScreenMode = 'splash' | 'login' | 'setup';

type AuthFlowProps = {
  onAuthenticated?: () => void | Promise<void>;
};

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [mode, setMode] = useState<ScreenMode>('login');
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [primaryUserName, setPrimaryUserName] = useState('Administrador');
  const [pin, setPin] = useState('');
  const [pendingSetupPin, setPendingSetupPin] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    // Carga del estado local de autenticacion para mantener flujo completamente offline.
    const loadAuthState = async () => {
      try {
        const [status, lockReason] = await Promise.all([
          obtenerEstadoAuth(),
          consumeSessionLockReason(),
        ]);
        if (status.primaryUserName) {
          setPrimaryUserName(status.primaryUserName);
        } else if (!status.hasUsers) {
          setPrimaryUserName('Propietario');
        }

        if (lockReason === 'timeout') {
          setInfoMessage('Sesion cerrada por inactividad. Ingrese su PIN para continuar.');
          setMode('login');
          return;
        }

        if (!status.hasUsers) {
          setRequiresSetup(true);
          const mustShowIntro = await shouldShowAuthIntroOnEntry();
          setInfoMessage('Defina su PIN principal para proteger la aplicacion.');
          setMode(mustShowIntro ? 'splash' : 'setup');
          return;
        }

        setRequiresSetup(false);

        const mustShowIntro = await shouldShowAuthIntroOnEntry();
        setMode(mustShowIntro ? 'splash' : 'login');
      } catch {
        // Si no se puede leer estado, mantenemos defaults para no bloquear la vista.
        setMode('login');
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const pinIndicators = useMemo(() => {
    return Array.from({ length: PIN_MIN }, (_, index) => index < pin.length);
  }, [pin]);

  const onPressDigit = (digit: string) => {
    setError('');
    setInfoMessage('');
    setPin(current => {
      if (current.length >= PIN_MAX) {
        return current;
      }
      return current + digit;
    });
  };

  const onPressDelete = () => {
    setError('');
    setInfoMessage('');
    setPin(current => current.slice(0, -1));
  };

  const onSubmitPin = async () => {
    if (pin.length < PIN_MIN) {
      setError('El PIN debe tener minimo 4 digitos.');
      return;
    }

    if (mode === 'setup') {
      if (!pendingSetupPin) {
        setPendingSetupPin(pin);
        setPin('');
        setError('');
        setInfoMessage('Confirme su nuevo PIN para finalizar.');
        return;
      }

      if (pendingSetupPin !== pin) {
        setPin('');
        setPendingSetupPin('');
        setError('Los PIN no coinciden. Intente nuevamente.');
        setInfoMessage('');
        return;
      }

      try {
        // Evita conflicto con el admin sembrado; el primer usuario real no debe reutilizar ese nombre.
        const normalizedPrimaryName = (primaryUserName ?? '').trim();
        const ownerName =
          normalizedPrimaryName && normalizedPrimaryName.toLowerCase() !== 'administrador'
            ? normalizedPrimaryName
            : 'Propietario';
        await registrarUsuario(ownerName, pin);
        const session = await iniciarSesionPrincipal(pin);
        setError('');
        setInfoMessage('');
        setPin('');
        setPendingSetupPin('');
        Alert.alert('PIN creado', `Bienvenido ${session.name}.`);
        await onAuthenticated?.();
      } catch (nativeError: any) {
        const message = nativeError?.message ?? 'No fue posible crear el PIN. Intente de nuevo.';
        setError(message);
        setPin('');
        setPendingSetupPin('');
      }
      return;
    }

    try {
      const session = await iniciarSesionPrincipal(pin);
      setError('');
      setPin('');
      Alert.alert('Acceso permitido', `Bienvenido ${session.name}.`);
      await onAuthenticated?.();
    } catch (nativeError: any) {
      const message = nativeError?.message ?? 'PIN incorrecto. Intente de nuevo.';
      setError(message);
      setPin('');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (mode === 'splash') {
    return <SplashScreen onContinue={() => setMode(requiresSetup ? 'setup' : 'login')} />;
  }

  if (mode === 'login' || mode === 'setup') {
    const isSetupMode = mode === 'setup';
    return (
      <PinLoginScreen
        primaryUserName={primaryUserName}
        subtitle={isSetupMode ? 'Cree su PIN principal' : 'Ingrese su PIN'}
        submitLabel={isSetupMode ? 'Guardar PIN' : 'Ingresar'}
        pinIndicators={pinIndicators}
        error={error}
        infoMessage={infoMessage}
        onPressDigit={onPressDigit}
        onPressDelete={onPressDelete}
        onSubmitPin={onSubmitPin}
      />
    );
  }

  return <LoadingScreen />;
}
~~~

---

## src/screens/auth/AuthenticatedScreen.tsx

~~~tsx
import React from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type AuthenticatedScreenProps = {
  onBackToLogin: () => void;
};

export function AuthenticatedScreen({ onBackToLogin }: AuthenticatedScreenProps) {
  return (
    <SafeAreaView style={authStyles.authenticatedSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AUTH_COLOR.white} />
      <View style={authStyles.authenticatedContainer}>
        <Text style={authStyles.authenticatedTitle}>Sesion iniciada</Text>
        <Text style={authStyles.authenticatedBody}>
          Login local exitoso. Ya puedes conectar esta pantalla con el menu principal del APK.
        </Text>

        <Pressable style={[authStyles.primaryButton, authStyles.authenticatedButton]} onPress={onBackToLogin}>
          <Text style={authStyles.primaryButtonText}>Volver al Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
~~~

---

## src/screens/auth/LoadingScreen.tsx

~~~tsx
import React from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

export function LoadingScreen() {
  return (
    <SafeAreaView style={authStyles.loaderSafeArea}>
      <ActivityIndicator size="large" color={AUTH_COLOR.primary} />
      <Text style={authStyles.loaderText}>Cargando autenticacion local...</Text>
    </SafeAreaView>
  );
}
~~~

---

## src/screens/auth/PinLoginScreen.tsx

~~~tsx
import React from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles, PIN_KEY_ROWS } from './authStyles';

type PinLoginScreenProps = {
  primaryUserName: string;
  subtitle?: string;
  submitLabel?: string;
  pinIndicators: boolean[];
  error: string;
  infoMessage?: string;
  onPressDigit: (digit: string) => void;
  onPressDelete: () => void;
  onSubmitPin: () => void;
};

export function PinLoginScreen({
  primaryUserName,
  subtitle = 'Ingrese su PIN',
  submitLabel = 'Ingresar',
  pinIndicators,
  error,
  infoMessage,
  onPressDigit,
  onPressDelete,
  onSubmitPin,
}: PinLoginScreenProps) {
  return (
    <SafeAreaView style={authStyles.loginSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.loginContainer}>
        <Image
          source={require('../../Logos/Logo_Blanco_Solo.png')}
          style={authStyles.loginLogoIcon}
          resizeMode="contain"
        />
        <Image
          source={require('../../Logos/Nombre_Blanco.png')}
          style={authStyles.loginLogoText}
          resizeMode="contain"
        />

        <Text style={authStyles.loginSubtitle}>{subtitle}</Text>
        <Text style={authStyles.loginUserLabel}>{primaryUserName}</Text>

        <View style={authStyles.indicatorRow}>
          {pinIndicators.map((filled, index) => (
            <View key={index} style={[authStyles.indicatorDot, filled && authStyles.indicatorDotFilled]} />
          ))}
        </View>

        {error ? (
          <View style={authStyles.errorPill}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!error && infoMessage ? (
          <View style={authStyles.infoPill}>
            <Text style={authStyles.infoText}>{infoMessage}</Text>
          </View>
        ) : null}

        <View style={authStyles.keypad}>
          {PIN_KEY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={authStyles.keyRow}>
              {row.map(key => {
                const isDelete = key === 'BORRAR';
                const isSingleZero = key === '0';
                return (
                  <Pressable
                    key={key}
                    style={[authStyles.keyButton, isSingleZero && authStyles.keyButtonZero]}
                    onPress={() => (isDelete ? onPressDelete() : onPressDigit(key))}
                  >
                    <Text style={[authStyles.keyText, isDelete && authStyles.deleteKeyText]}>
                      {isDelete ? '<' : key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Pressable style={authStyles.submitButton} onPress={onSubmitPin}>
          <Text style={authStyles.submitButtonText}>{submitLabel}</Text>
        </Pressable>

        <Text style={authStyles.footerTextDark}>Olvido su PIN? Contacte al administrador</Text>
      </View>
    </SafeAreaView>
  );
}
~~~

---

## src/screens/auth/SplashScreen.tsx

~~~tsx
import React from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type SplashScreenProps = {
  onContinue: () => void;
};

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <SafeAreaView style={authStyles.splashSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.splashContainer}>
        <Image
          source={require('../../Logos/Logo_Blanco_Nombre.png')}
          style={authStyles.splashLogoFull}
          resizeMode="contain"
        />

        <Text style={authStyles.splashTitle}>AgroApp</Text>
        <Text style={authStyles.splashSubtitle}>Gestion Ganadera Offline</Text>
        <Text style={authStyles.splashBody}>Cree su PIN de seguridad de 4 digitos</Text>

        <View style={authStyles.progressRow}>
          {[0, 1, 2, 3].map(step => (
            <View key={step} style={[authStyles.progressDot, step === 0 && authStyles.progressDotActive]} />
          ))}
        </View>

        <Pressable onPress={onContinue} style={authStyles.primaryButton}>
          <Text style={authStyles.primaryButtonText}>Continuar</Text>
        </Pressable>

        <Text style={authStyles.footerTextLight}>Sus datos nunca salen del dispositivo</Text>
      </View>
    </SafeAreaView>
  );
}
~~~

---

## src/screens/auth/authStyles.ts

~~~ts
import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';

export const AUTH_COLOR = {
  primary: COLORS.primary,
  white: COLORS.white,
  textOnLight: COLORS.black,
  secondaryText: COLORS.gray,
  error: COLORS.error,
  keyOverlay: 'rgba(255, 255, 255, 0.18)',
  keyBorder: 'rgba(255, 255, 255, 0.85)',
};

export const PIN_MIN = 4;
export const PIN_MAX = 6;

export const PIN_KEY_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', 'BORRAR'],
];

export const authStyles = StyleSheet.create({
  loaderSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: AUTH_COLOR.white,
  },
  loaderText: {
    color: AUTH_COLOR.textOnLight,
    fontSize: 14,
    fontWeight: '500',
  },
  splashSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoBadgeLight: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.primary,
    marginBottom: 12,
  },
  splashLogoFull: {
    width: 210,
    height: 106,
    marginBottom: 14,
  },
  logoBadgeDark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.white,
    marginBottom: 10,
  },
  logoBadgeText: {
    fontSize: 42,
    fontWeight: '700',
    color: AUTH_COLOR.white,
  },
  logoBadgeTextDark: {
    color: AUTH_COLOR.primary,
  },
  splashTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: AUTH_COLOR.white,
  },
  splashSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: AUTH_COLOR.white,
    textAlign: 'center',
  },
  splashBody: {
    marginTop: 20,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: AUTH_COLOR.white,
    fontFamily: FONTS.semiBold,
  },
  progressRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#d7d7d7',
  },
  progressDotActive: {
    backgroundColor: AUTH_COLOR.primary,
  },
  primaryButton: {
    marginTop: 26,
    minWidth: 210,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: AUTH_COLOR.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextLight: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
  },
  loginSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  loginLogoIcon: {
    width: 74,
    height: 74,
  },
  loginLogoText: {
    width: 176,
    height: 52,
    marginTop: 4,
  },
  loginTitle: {
    marginTop: 6,
    fontSize: 40,
    fontWeight: '800',
    color: AUTH_COLOR.white,
  },
  loginSubtitle: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: '#e7f6eb',
  },
  loginUserLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#d7eddc',
  },
  indicatorRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  indicatorDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: AUTH_COLOR.white,
    backgroundColor: 'transparent',
  },
  indicatorDotFilled: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  errorPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#f9e7e7',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    color: AUTH_COLOR.error,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  infoPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  infoText: {
    color: '#1b4b9a',
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  keypad: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  keyButton: {
    width: 95,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH_COLOR.keyBorder,
    backgroundColor: AUTH_COLOR.keyOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonZero: {
    marginRight: 0,
  },
  keyText: {
    color: AUTH_COLOR.white,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  deleteKeyText: {
    fontSize: 24,
  },
  submitButton: {
    marginTop: 20,
    minWidth: 240,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: AUTH_COLOR.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextDark: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
    textDecorationLine: 'underline',
  },
  authenticatedSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.white,
  },
  authenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authenticatedTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: AUTH_COLOR.primary,
  },
  authenticatedBody: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: AUTH_COLOR.textOnLight,
    textAlign: 'center',
  },
  authenticatedButton: {
    marginTop: 18,
  },
});
~~~

---

## src/shared/components/ModulePlaceholderScreen.tsx

~~~tsx
import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/identity';

type ModulePlaceholderScreenProps = {
  title: string;
  description: string;
  emoji: string;
  onBack: () => void;
};

export function ModulePlaceholderScreen({
  title,
  description,
  emoji,
  onBack,
}: ModulePlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver al Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emojiCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#e4efe8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 46,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
~~~

---

## src/shared/services/sessionManager.ts

~~~ts
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionState = {
  authenticated: boolean;
  backgroundedAt: number | null;
};

export type SessionLockReason = 'timeout' | 'manual';

const SESSION_STORAGE_KEY = '@agroapp/session-state-v1';
const SESSION_LOCK_REASON_KEY = '@agroapp/session-lock-reason-v1';
const AUTH_INTRO_SHOWN_KEY = '@agroapp/auth-intro-shown-v1';
export const SESSION_TIMEOUT_MS = 30_000;

const DEFAULT_STATE: SessionState = {
  authenticated: false,
  backgroundedAt: null,
};

const readSessionState = async (): Promise<SessionState> => {
  try {
    const rawState = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawState) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(rawState) as Partial<SessionState>;
    return {
      authenticated: Boolean(parsed.authenticated),
      backgroundedAt: typeof parsed.backgroundedAt === 'number' ? parsed.backgroundedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
};

const writeSessionState = async (state: SessionState): Promise<void> => {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
};

export const markSessionAuthenticated = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);
  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
};

export const clearSession = async (reason: SessionLockReason = 'manual'): Promise<void> => {
  if (reason === 'timeout') {
    await AsyncStorage.setItem(SESSION_LOCK_REASON_KEY, reason);
  } else {
    await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);
  }

  await writeSessionState(DEFAULT_STATE);
};

export const consumeSessionLockReason = async (): Promise<SessionLockReason | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_LOCK_REASON_KEY);
    await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);

    if (raw === 'timeout' || raw === 'manual') {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
};

export const shouldShowAuthIntroOnEntry = async (): Promise<boolean> => {
  try {
    const alreadyShown = await AsyncStorage.getItem(AUTH_INTRO_SHOWN_KEY);
    if (alreadyShown === '1') {
      return false;
    }

    await AsyncStorage.setItem(AUTH_INTRO_SHOWN_KEY, '1');
    return true;
  } catch {
    return false;
  }
};

export const resolveStartupSession = async (): Promise<boolean> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return false;
  }

  if (state.backgroundedAt == null) {
    return true;
  }

  const timedOut = Date.now() - state.backgroundedAt >= SESSION_TIMEOUT_MS;
  if (timedOut) {
    await clearSession('timeout');
    return false;
  }

  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
  return true;
};

export const markAppBackgrounded = async (): Promise<void> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return;
  }

  await writeSessionState({
    ...state,
    backgroundedAt: Date.now(),
  });
};

export const validateSessionOnForeground = async (): Promise<boolean> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return false;
  }

  if (state.backgroundedAt == null) {
    return true;
  }

  const timedOut = Date.now() - state.backgroundedAt >= SESSION_TIMEOUT_MS;
  if (timedOut) {
    await clearSession('timeout');
    return false;
  }

  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
  return true;
};
~~~

---

## src/shared/theme/identity.ts

~~~ts
export const COLORS = {
  primary: '#07612d',
  black: '#1d1d1b',
  white: '#ffffff',
  gray: '#98a287',
  error: '#D32F2F',
  warning: '#FFA000',
  success: '#4CAF50',
  listBackground: '#F4F4F4',
};

export const FONTS = {
  bold: 'Poppins-Bold',
  semiBold: 'Poppins-SemiBold',
  regular: 'Poppins-Regular',
  light: 'Poppins-Light',
};
~~~

---

