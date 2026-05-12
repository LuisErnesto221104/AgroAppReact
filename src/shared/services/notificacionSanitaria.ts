import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';

import type { EventoSanitarioModel } from '../../types/Sanitario';

type NotificationNativeApi = {
  programarAlarma: (
    animalId: number,
    fechaISO: string,
    titulo: string,
    descripcion: string,
  ) => Promise<{ ok: boolean; alarmId: number; triggerAtMillis?: number; mode?: string }>;
  cancelarAlarma: (requestCode: number) => Promise<{ ok: boolean; alarmId: number }>;
};

const NOTIFICATIONS_ENABLED_KEY = '@agroapp:notificaciones_habilitadas';

const getNative = (): NotificationNativeApi => {
  const module = NativeModules.NotificationNativeModule as NotificationNativeApi | undefined;
  if (!module) {
    throw new Error('NotificationNativeModule no disponible. Revisa el registro en AgroAppPackage.');
  }
  return module;
};

const formatAsIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const javaStringHashCode = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
};

const buildRequestCode = (animalId: number, fechaISO: string): number => {
  return javaStringHashCode(`${animalId}|${fechaISO}`);
};

export const getNotificationsEnabled = async (): Promise<boolean> => {
  const storedValue = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  if (storedValue == null) {
    return true;
  }

  return storedValue === 'true';
};

export const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
};

const emojiByTipo = (tipo: string): string => {
  switch (tipo) {
    case 'VACUNA':
      return '🐄';
    case 'DESPARASITACION':
      return '💊';
    case 'ENFERMEDAD':
      return '⚠️';
    case 'CIRUGIA':
      return '🏥';
    default:
      return '📌';
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return granted;
  } catch {
    return false;
  }
};

export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch {
    // ignore
  }
};

export const programarNotificacionEvento = async (evento: EventoSanitarioModel): Promise<void> => {
  if (!evento.fechaProximoEvento) {
    return;
  }

  const notificationsEnabled = await getNotificationsEnabled();
  if (!notificationsEnabled) {
    return;
  }

  const allowed = await requestNotificationPermission();
  if (!allowed) {
    return;
  }

  const native = getNative();
  const fechaExacta = evento.fechaProximoEvento.slice(0, 10);

  const baseDate = new Date(`${fechaExacta}T00:00:00`);
  const menosTres = new Date(baseDate);
  menosTres.setDate(baseDate.getDate() - 3);
  const fechaMenosTres = formatAsIsoDate(menosTres);

  const emoji = emojiByTipo(String(evento.tipoEvento));
  const eventoNombre = (evento.descripcion || evento.tipoEvento).trim();
  const descripcion = `Animal ID: ${evento.animalId} · Próximo evento: ${fechaExacta}`;

  await native.programarAlarma(
    evento.animalId,
    fechaMenosTres,
    `${emoji} ${eventoNombre} en 3 dias`,
    descripcion,
  );
  await native.programarAlarma(
    evento.animalId,
    fechaExacta,
    `${emoji} ${eventoNombre} hoy`,
    descripcion,
  );
};

export const reprogramarNotificacionesEventos = async (
  eventos: EventoSanitarioModel[],
): Promise<{ programadas: number }> => {
  const uniqueEventos = Array.from(new Map(eventos.map(evento => [evento.id, evento])).values());
  let programadas = 0;

  for (const evento of uniqueEventos) {
    if (!evento.fechaProximoEvento) {
      continue;
    }

    await programarNotificacionEvento(evento);
    programadas += 1;
  }

  return { programadas };
};

export const cancelarNotificacionesEventos = async (
  eventos: EventoSanitarioModel[],
): Promise<{ canceladas: number }> => {
  const uniqueEventos = Array.from(new Map(eventos.map(evento => [evento.id, evento])).values());
  const native = getNative();
  let canceladas = 0;

  for (const evento of uniqueEventos) {
    if (!evento.fechaProximoEvento) {
      continue;
    }

    const fechaExacta = evento.fechaProximoEvento.slice(0, 10);
    const baseDate = new Date(`${fechaExacta}T00:00:00`);
    const menosTres = new Date(baseDate);
    menosTres.setDate(baseDate.getDate() - 3);
    const fechaMenosTres = formatAsIsoDate(menosTres);

    await native.cancelarAlarma(buildRequestCode(evento.animalId, fechaMenosTres));
    await native.cancelarAlarma(buildRequestCode(evento.animalId, fechaExacta));
    canceladas += 1;
  }

  return { canceladas };
};

export const cancelarNotificacion = async (id: number): Promise<void> => {
  const native = getNative();
  await native.cancelarAlarma(id);
};

export const programarNotificacionPrueba = async (): Promise<number> => {
  const allowed = await requestNotificationPermission();
  if (!allowed) {
    throw new Error('Permiso de notificaciones denegado.');
  }

  const native = getNative();
  const hoy = formatAsIsoDate(new Date());
  const result = await native.programarAlarma(
    999999,
    hoy,
    'Prueba de recordatorio sanitario',
    'Esta es una notificacion de prueba de AgroApp.',
  );

  return result.alarmId;
};
