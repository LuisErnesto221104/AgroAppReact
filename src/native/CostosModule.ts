import { NativeModules } from 'react-native';

import { CategoriaGasto, GastoModel } from '../types/Costos';

interface CostosNativeModule {
  getGastos(): Promise<GastoModel[]>;
  getGastosByAnimal(animalId: number): Promise<GastoModel[]>;
  getGastosFiltrados(
    fechaDesde: string | null,
    fechaHasta: string | null,
    categoria: string | null,
  ): Promise<GastoModel[]>;
}

const { CostosModule: Native } = NativeModules;

export const CostosModule = {
  getGastos(): Promise<GastoModel[]> {
    if (!Native || typeof Native.getGastos !== 'function') {
      return Promise.reject(new Error('CostosModule.getGastos no disponible'));
    }
    return Native.getGastos();
  },

  getGastosByAnimal(animalId: number): Promise<GastoModel[]> {
    if (!Native || typeof Native.getGastosByAnimal !== 'function') {
      return Promise.reject(new Error('CostosModule.getGastosByAnimal no disponible'));
    }
    return Native.getGastosByAnimal(animalId);
  },

  getGastosFiltrados(
    fechaDesde: string | null,
    fechaHasta: string | null,
    categoria: CategoriaGasto | null,
  ): Promise<GastoModel[]> {
    if (!Native || typeof Native.getGastosFiltrados !== 'function') {
      return Promise.reject(new Error('CostosModule.getGastosFiltrados no disponible'));
    }
    return Native.getGastosFiltrados(fechaDesde, fechaHasta, categoria);
  },
};
