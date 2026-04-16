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
