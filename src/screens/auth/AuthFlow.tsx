import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { iniciarSesionPrincipal, obtenerEstadoAuth } from '../../native/AuthModule';
import { consumeSessionLockReason, shouldShowAuthIntroOnEntry } from '../../shared/services/sessionManager';
import { LoadingScreen } from './LoadingScreen';
import { PIN_MAX, PIN_MIN } from './authStyles';
import { PinLoginScreen } from './PinLoginScreen';
import { SplashScreen } from './SplashScreen';

type ScreenMode = 'splash' | 'login';

type AuthFlowProps = {
  onAuthenticated?: () => void | Promise<void>;
};

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [mode, setMode] = useState<ScreenMode>('login');
  const [loading, setLoading] = useState(true);
  const [primaryUserName, setPrimaryUserName] = useState('Administrador');
  const [pin, setPin] = useState('');
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
        }

        if (lockReason === 'timeout') {
          setInfoMessage('Sesion cerrada por inactividad. Ingrese su PIN para continuar.');
          setMode('login');
          return;
        }

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
    return <SplashScreen onContinue={() => setMode('login')} />;
  }

  if (mode === 'login') {
    return (
      <PinLoginScreen
        primaryUserName={primaryUserName}
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
