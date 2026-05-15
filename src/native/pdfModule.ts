import { NativeModules } from 'react-native';

interface PdfModuleInterface {
  generateHatoPdf(): Promise<string>;
  generateAnimalPdf(animalId: number): Promise<string>;
  generateHistorialPdf(animalId: number): Promise<string>;
}

const unavailable = (method: string): Promise<never> =>
  Promise.reject(new Error(`PdfModule.${method} no disponible en esta plataforma`));

const { PdfModule } = NativeModules;

const guard: PdfModuleInterface = {
  generateHatoPdf:      () => unavailable('generateHatoPdf'),
  generateAnimalPdf:    () => unavailable('generateAnimalPdf'),
  generateHistorialPdf: () => unavailable('generateHistorialPdf'),
};

export const pdfModule: PdfModuleInterface = PdfModule ?? guard;
