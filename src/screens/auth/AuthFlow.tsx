import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { iniciarSesionPrincipal, obtenerEstadoAuth } from '../../native/AuthModule';
import { LoadingScreen } from './LoadingScreen';
import { PIN_MAX, PIN_MIN } from './authStyles';
import { PinLoginScreen } from './PinLoginScreen';
import { SplashScreen } from './SplashScreen';
import { HomeModuleRoute } from '../../features/home/types/homeNavigation';

type ScreenMode = 'splash' | 'login' | 'authenticated';

type AuthFlowProps = {
  onAuthenticated?: () => void;
};

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [mode, setMode] = useState<ScreenMode>('splash');
  const [loading, setLoading] = useState(true);
  const [primaryUserName, setPrimaryUserName] = useState('Administrador');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Carga del estado local de autenticacion para mantener flujo completamente offline.
    const loadAuthState = async () => {
      try {
        const status = await obtenerEstadoAuth();
        if (status.primaryUserName) {
          setPrimaryUserName(status.primaryUserName);
        }
      } catch {
        // Si no se puede leer estado, mantenemos defaults para no bloquear la vista.
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
    setPin(current => {
      if (current.length >= PIN_MAX) {
        return current;
      }
      return current + digit;
    });
  };

  const onPressDelete = () => {
    setError('');
    setPin(current => current.slice(0, -1));
  };

  const onSubmitPin = async () => {
    if (pin.length < PIN_MIN) {
      setError('El PIN debe tener minimo 4 digitos.');
      return;
    }

    try {
      const session = await iniciarSesionPrincipal(pin);
      setError('');
      setPin('');
      setMode('authenticated');
      Alert.alert('Acceso permitido', `Bienvenido ${session.name}.`);
      onAuthenticated?.();
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
    return <SplashScreen onContinue={() => setMode('login')} />;
  }

  if (mode === 'login') {
    return (
      <PinLoginScreen
        primaryUserName={primaryUserName}
        pinIndicators={pinIndicators}
        error={error}
        onPressDigit={onPressDigit}
        onPressDelete={onPressDelete}
        onSubmitPin={onSubmitPin}
      />
    );
  }

  // Si el navigator no recibe callback (modo standalone), hacemos fallback local a Home.
  return <HomeScreen onOpenModule={function (target: HomeModuleRoute): void {
    throw new Error('Function not implemented.');
  } } />;
}
