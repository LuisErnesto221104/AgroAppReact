export enum TipoEvento {
  VACUNA = 'VACUNA',
  DESPARASITACION = 'DESPARASITACION',
  ENFERMEDAD = 'ENFERMEDAD',
  CIRUGIA = 'CIRUGIA',
  OTRO = 'OTRO',
}

export interface EventoSanitarioModel {
  id: number;
  animalId: number;
  tipoEvento: TipoEvento;
  descripcion: string | null;
  fechaEvento: string;
  veterinario: string | null;
  dosis: string | null;
  observaciones: string | null;
  fechaProximoEvento: string | null;
}

export interface InsertEventoPayload {
  animalId: number;
  tipoEvento: TipoEvento;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
}

export interface InsertEventoResult {
  ok: boolean;
  eventoId: number;
}