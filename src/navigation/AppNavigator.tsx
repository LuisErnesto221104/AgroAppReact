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
