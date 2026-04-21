import { NativeModules } from 'react-native';

type AuthStatus = {
  hasUsers: boolean;
  primaryUserName: string;
  isAdminPrimary: boolean;
};

type AuthSession = {
  ok: boolean;
  userId: number;
  name: string;
  role: 'ADMIN' | 'USUARIO';
};

type AuthRegisterResult = {
  ok: boolean;
  userId: number;
  name: string;
};

type AuthNativeModule = {
  getAuthStatus(): Promise<AuthStatus>;
  loginPrimaryUser(pin: string): Promise<AuthSession>;
  login(nombre: string, pin: string): Promise<AuthSession>;
  registerUser(nombre: string, pin: string): Promise<AuthRegisterResult>;
  updatePrimaryUserPin(pin: string): Promise<AuthSession>;
};

const { AuthModule } = NativeModules;

const getAuthBridge = (): AuthNativeModule => {
  if (!AuthModule) {
    throw new Error('AuthModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return AuthModule as AuthNativeModule;
};

// Estado de autenticacion offline en SQLite local.
export const obtenerEstadoAuth = (): Promise<AuthStatus> => {
  return getAuthBridge().getAuthStatus();
};

// Login principal por PIN (sin red), pensado para el flujo del prototipo.
export const iniciarSesionPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().loginPrimaryUser(pin);
};

// Login explicito por nombre + PIN (tambien offline) para flujos futuros.
export const iniciarSesion = (nombre: string, pin: string): Promise<AuthSession> => {
  return getAuthBridge().login(nombre, pin);
};

// Registro de usuario local con validaciones aplicadas en Java.
export const registrarUsuario = (nombre: string, pin: string): Promise<AuthRegisterResult> => {
  return getAuthBridge().registerUser(nombre, pin);
};

// Actualiza el PIN del usuario principal (admin/primario) y retorna sesion activa.
export const actualizarPinPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().updatePrimaryUserPin(pin);
};
