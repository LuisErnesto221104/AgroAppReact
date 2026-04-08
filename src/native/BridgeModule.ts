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
