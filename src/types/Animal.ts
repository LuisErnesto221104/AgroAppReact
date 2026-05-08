export interface AnimalFormState {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  fotoPath: string | null;
}

export interface AnimalModel {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
  estado: AnimalEstado;
  fecha_baja: string | null;
  motivo_baja: string | null;
  precio_venta: number | null; // Sprint 3 — RF002
  fecha_venta: string | null; // Sprint 3 — RF002
}

export type AnimalEstado = 'ACTIVO' | 'VENDIDO' | 'FALLECIDO';

export interface UpdateAnimalPayload {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto_path: string | null;
}

export interface InsertAnimalPayload {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto_path: string | null;
}

export interface InsertAnimalResult {
  ok: boolean;
  animalId: number;
  arete: string;
}

export interface UpdateAnimalResult {
  ok: boolean;
  animal: AnimalModel;
}

export interface DeleteAnimalResult {
  ok: boolean;
  animalId: number;
}

export interface ChangeEstadoPayload {
  id: number;
  estado: AnimalEstado;
  fecha_baja?: string;
  motivo_baja?: string;
  precioVenta?: number; // Sprint 3 — RF002
  fechaVenta?: string; // Sprint 3 — RF002
}

export interface ChangeEstadoResult {
  ok: boolean;
  animal: AnimalModel;
}

export interface PesoHistorialPoint {
  fecha: string;
  peso: number;
}

export interface EventoSanitarioResumen {
  id: number;
  fecha: string | null;
  enfermedad: string | null;
  sintomas: string | null;
  tratamiento: string | null;
  estado: string | null;
  observaciones: string | null;
}

export interface HistorialResumen {
  historial_peso: PesoHistorialPoint[];
  eventos_recientes: EventoSanitarioResumen[];
}

// Sprint 3 — RF002: Registro de Venta de Animal
export interface VentaAnimalPayload {
  id: number;
  precioVenta: number;
  fechaVenta: string;
  comprador?: string;
}

export interface VentaAnimalResult {
  ok: boolean;
  animalId: number;
  precioVenta: number;
  margenEstimado: number | null;
}
