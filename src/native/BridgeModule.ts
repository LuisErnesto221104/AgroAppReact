import { NativeModules } from 'react-native';

import type { EventoSanitarioModel, InsertEventoPayload, InsertEventoResult } from '../types/Sanitario';

type BridgeInfo = {
  module: string;
  language: string;
  ready: boolean;
  pattern: string;
};

type AgroBridgeNativeModule = {
  testConnection(nombre: string): Promise<string>;
  getBridgeInfo(): Promise<BridgeInfo>;
  registrarEventoSanitario(datos: InsertEventoPayload): Promise<InsertEventoResult>;
  obtenerEventosSanitarios(animalId: number): Promise<EventoSanitarioModel[]>;
  getEventosMes(year: number, month: number): Promise<EventoSanitarioModel[]>;
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

export const registrarEventoSanitario = (
  datos: InsertEventoPayload,
): Promise<InsertEventoResult> => {
  return getBridge().registrarEventoSanitario(datos);
};

export const obtenerEventosSanitarios = (animalId: number): Promise<EventoSanitarioModel[]> => {
  return getBridge().obtenerEventosSanitarios(animalId);
};

export const obtenerEventosMes = (year: number, month: number): Promise<EventoSanitarioModel[]> => {
  return getBridge().getEventosMes(year, month);
};
