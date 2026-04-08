import React, { useEffect, useState } from 'react';

import { AnimalsScreen } from '../features/animals/screens/AnimalsScreen';
import { CostsScreen } from '../features/costs/screens/CostsScreen';
import { HealthScreen } from '../features/health/screens/HealthScreen';
import { HomeModuleRoute } from '../features/home/types/homeNavigation';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen';
import { SplashScreen } from '../features/startup/screens/SplashScreen';
import AuthFlow from '../screens/auth/AuthFlow';

type AppRoute = 'startup' | 'auth' | 'home' | HomeModuleRoute;

export default function AppNavigator() {
  const [route, setRoute] = useState<AppRoute>('startup');

  useEffect(() => {
    // Primero mostramos splash de arranque y luego pasamos al login.
    const timer = setTimeout(() => {
      setRoute('auth');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (route === 'startup') {
    return <SplashScreen />;
  }

  if (route === 'auth') {
    return <AuthFlow onAuthenticated={() => setRoute('home')} />;
  }

  if (route === 'animals') {
    return <AnimalsScreen onBack={() => setRoute('home')} />;
  }

  if (route === 'health') {
    return <HealthScreen onBack={() => setRoute('home')} />;
  }

  if (route === 'costs') {
    return <CostsScreen onBack={() => setRoute('home')} />;
  }

  if (route === 'reports') {
    return <ReportsScreen onBack={() => setRoute('home')} />;
  }

  if (route === 'notifications') {
    return <NotificationsScreen onBack={() => setRoute('home')} />;
  }

  return <HomeScreen onOpenModule={target => setRoute(target)} />;
}
