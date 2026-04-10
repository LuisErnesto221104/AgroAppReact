import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { iniciarSesionPrincipal, obtenerEstadoAuth } from '../../native/AuthModule';
import { AuthenticatedScreen } from './AuthenticatedScreen';
import { LoadingScreen } from './LoadingScreen';
import { PIN_MAX, PIN_MIN } from './authStyles';
import { PinLoginScreen } from './PinLoginScreen';
import { SplashScreen } from './SplashScreen';

type ScreenMode = 'splash' | 'login' | 'authenticated';

export default function AuthFlow() {
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

  return <AuthenticatedScreen onBackToLogin={() => setMode('login')} />;
}
