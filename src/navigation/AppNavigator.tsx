import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimalsScreen } from '../features/animals/screens/AnimalsScreen';
import { CostsScreen } from '../features/costs/screens/CostsScreen';
import { HealthScreen } from '../features/health/screens/HealthScreen';
import { HomeModuleRoute } from '../features/home/types/homeNavigation';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ReportesMenuScreen } from '../features/reports/screens/ReportesMenuScreen';
import { SplashScreen } from '../features/startup/screens/SplashScreen';
import {
  clearSession,
  markAppBackgrounded,
  markSessionAuthenticated,
  resolveStartupSession,
  SESSION_TIMEOUT_MS,
  validateSessionOnForeground,
} from '../shared/services/sessionManager';
import { COLORS, FONTS } from '../shared/theme/identity';
import AuthFlow from '../screens/auth/AuthFlow';

type AppRoute = 'startup' | 'auth' | 'home' | HomeModuleRoute;

const NAV_TABS: { key: AppRoute; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: 'Inicio' },
  { key: 'animals', icon: '🐄', label: 'Animales' },
  { key: 'health', icon: '💉', label: 'Sanitario' },
  { key: 'costs', icon: '💵', label: 'Gastos' },
  { key: 'reports', icon: '📊', label: 'Reportes' },
];

function BottomNavBar({
  currentRoute,
  onNavigate,
}: {
  currentRoute: AppRoute;
  onNavigate: (r: AppRoute) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[navStyles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {NAV_TABS.map(tab => {
        const active = currentRoute === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={navStyles.tabItem}
            onPress={() => onNavigate(tab.key)}
          >
            <Text style={[navStyles.tabIcon, active && navStyles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[navStyles.tabLabel, active && navStyles.tabLabelActive]}>
              {tab.label}
            </Text>
            {active && <View style={navStyles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const navStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: '#ffffff',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 17,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: FONTS.semiBold,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

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
      .catch(() => {})
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
    const timer = setTimeout(() => {
      resolveStartupSession()
        .then(hasSession => {
          if (!mounted) return;
          setRoute(hasSession ? 'home' : 'auth');
        })
        .catch(() => {
          if (mounted) setRoute('auth');
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
    return () => { clearInactivityTimer(); };
  }, [clearInactivityTimer]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        clearInactivityTimer();
        markAppBackgrounded().catch(() => {});
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
          .catch(() => { setRoute('auth'); });
      }
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [clearInactivityTimer, startInactivityTimer]);

  const navigate = useCallback((target: AppRoute) => {
    registerActivity();
    setRoute(target);
  }, [registerActivity]);

  const wrapProtectedScreen = (screen: React.ReactNode) => {
    if (!protectedRoute) return screen;
    return (
      <View
        style={styles.protectedContainer}
        onStartShouldSetResponderCapture={() => { registerActivity(); return false; }}
        onMoveShouldSetResponderCapture={() => { registerActivity(); return false; }}
      >
        {screen}
        <BottomNavBar currentRoute={route} onNavigate={navigate} />
      </View>
    );
  };

  if (route === 'startup') return <SplashScreen />;

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
    return wrapProtectedScreen(
      <AnimalsScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'health') {
    return wrapProtectedScreen(
      <HealthScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'costs') {
    return wrapProtectedScreen(
      <CostsScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'reports') {
    return wrapProtectedScreen(
      <ReportesMenuScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'notifications') {
    return wrapProtectedScreen(
      <NotificationsScreen onBack={() => navigate('home')} />
    );
  }

  return wrapProtectedScreen(
    <HomeScreen onOpenModule={target => navigate(target)} />
  );
}

const styles = StyleSheet.create({
  protectedContainer: {
    flex: 1,
  },
});
