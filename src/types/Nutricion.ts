export type EtapaProductiva = 'CRIA' | 'ENGORDA' | 'LECHERA';
export type TipoAnimal = 'BOVINO' | 'OVINO' | 'CAPRINO';

export interface GastosEstimadosMXN {
  mensualPorAnimal: number;
  fuente: string;
}

export interface RecomendacionNutricional {
  etapa: EtapaProductiva;
  tipoAnimal: TipoAnimal;
  proteinaMin: number;       // % en base seca
  energiaMcal: number;       // Mcal EM / kg MS
  fibraMaxima: number;       // % FDN máxima
  aguaLitrosDia: number;     // litros/día
  suplementos: string[];
  observaciones: string;
  gastosEstimadosMXN: GastosEstimadosMXN;
}

export const ETAPA_LABELS: Record<EtapaProductiva, string> = {
  CRIA: 'Cría',
  ENGORDA: 'Engorda',
  LECHERA: 'Lechera',
};

export const TIPO_LABELS: Record<TipoAnimal, string> = {
  BOVINO: 'Bovino',
  OVINO: 'Ovino',
  CAPRINO: 'Caprino',
};
