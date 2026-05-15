import { NativeModules } from 'react-native';

type PdfNativeModule = {
  generateHatoPdf(): Promise<string>;
};

const { PdfModule } = NativeModules;

const getPdf = (): PdfNativeModule => {
  if (!PdfModule) {
    throw new Error('PdfModule no está disponible. Verifica el registro en AgroAppPackage.');
  }
  return PdfModule as PdfNativeModule;
};

export const generarPdfHato = (): Promise<string> => {
  return getPdf().generateHatoPdf();
};
