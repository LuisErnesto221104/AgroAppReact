/**
 * Tipos y enums para el módulo de costos/gastos
 * Sprint 4 — RF003
 */

export enum CategoriaGasto {
  ALIMENTACION = 'ALIMENTACION',
  MEDICAMENTOS = 'MEDICAMENTOS',
  TRASLADO = 'TRASLADO',
  VETERINARIO = 'VETERINARIO',
  OTRO = 'OTRO',
}

export const CATEGORIA_GASTO_LABELS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.ALIMENTACION]: '🥕 Alimentación',
  [CategoriaGasto.MEDICAMENTOS]: '💊 Medicamentos',
  [CategoriaGasto.TRASLADO]: '🚚 Traslado',
  [CategoriaGasto.VETERINARIO]: '👨‍⚕️ Veterinario',
  [CategoriaGasto.OTRO]: '📝 Otro',
};

export const CATEGORIA_COLORES: Record<CategoriaGasto, string> = {
  [CategoriaGasto.ALIMENTACION]: '#F59E0B', // Ámbar
  [CategoriaGasto.MEDICAMENTOS]: '#EF4444', // Rojo
  [CategoriaGasto.TRASLADO]: '#3B82F6', // Azul
  [CategoriaGasto.VETERINARIO]: '#8B5CF6', // Púrpura
  [CategoriaGasto.OTRO]: '#6B7280', // Gris
};

/**
 * Modelo de un gasto individual
 */
export interface GastoModel {
  id: number;
  animalId: number | null; // null = gasto general del hato
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  notas: string | null;
}

/**
 * Payload para insertar un nuevo gasto
 */
export interface InsertGastoPayload {
  animalId: number | null;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: string;
  notas?: string | null;
}

/**
 * Payload para actualizar un gasto
 */
export interface UpdateGastoPayload extends InsertGastoPayload {
  id: number;
}

/**
 * Resumen de gastos
 */
export interface GastoResumen {
  totalInvertido: number;
  porCategoria: Record<CategoriaGasto, number>;
  cantidadRegistros: number;
}

/**
 * Gasto agrupado por categoría
 */
export interface GastoPorCategoria {
  categoria: CategoriaGasto;
  total: number;
  cantidad: number;
}
