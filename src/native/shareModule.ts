import { NativeModules } from 'react-native';

interface ShareModuleInterface {
  sharePdf(filePath: string, title: string): Promise<string>;
}

// Nombre único para evitar conflicto con ShareModule interno de React Native
const { AgroShareModule } = NativeModules;

export const shareModule: ShareModuleInterface = {
  sharePdf(filePath: string, title: string): Promise<string> {
    if (!AgroShareModule || typeof AgroShareModule.sharePdf !== 'function') {
      return Promise.reject(
        new Error('AgroShareModule no disponible — verifica el registro en MainApplication.kt'),
      );
    }
    return AgroShareModule.sharePdf(filePath, title) as Promise<string>;
  },
};
