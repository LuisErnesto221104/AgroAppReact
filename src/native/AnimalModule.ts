import { NativeModules } from 'react-native';

import type {
  AnimalModel,
  AnimalEstado,
  ChangeEstadoPayload,
  ChangeEstadoResult,
  DeleteAnimalResult,
  InsertAnimalPayload,
  InsertAnimalResult,
  UpdateAnimalPayload,
  UpdateAnimalResult,
} from '../types/Animal';

type AnimalNativeModule = {
  logEvent(event: string): void;
  insertAnimal(payload: InsertAnimalPayload): Promise<InsertAnimalResult>;
  listAnimals(): Promise<AnimalModel[]>;
  getAnimalesByEstado(estado: AnimalEstado): Promise<AnimalModel[]>;
  buscarPorArete(termino: string, estado: AnimalEstado): Promise<AnimalModel[]>;
  updateAnimal(payload: UpdateAnimalPayload): Promise<UpdateAnimalResult>;
  changeEstado(payload: ChangeEstadoPayload): Promise<ChangeEstadoResult>;
  deleteAnimal(payload: { id: number }): Promise<DeleteAnimalResult>;
};

const { AnimalModule: NativeAnimalModule } = NativeModules;
let inFlightBuscarKey: string | null = null;
let inFlightBuscarPromise: Promise<AnimalModel[]> | null = null;

const getAnimalBridge = (): AnimalNativeModule => {
  if (!NativeAnimalModule) {
    throw new Error('AnimalModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return NativeAnimalModule as AnimalNativeModule;
};

export const logEvent = (event: string): void => {
  getAnimalBridge().logEvent(event);
};

export const insertAnimal = (payload: InsertAnimalPayload): Promise<InsertAnimalResult> => {
  return getAnimalBridge().insertAnimal(payload);
};

export const listAnimals = (): Promise<AnimalModel[]> => {
  return getAnimalBridge().listAnimals();
};

export const getAnimalesByEstado = (estado: AnimalEstado): Promise<AnimalModel[]> => {
  return getAnimalBridge().getAnimalesByEstado(estado);
};

export const buscarPorArete = (termino: string, estado: AnimalEstado): Promise<AnimalModel[]> => {
  const normalizedTermino = (termino ?? '').trim();
  const key = `${estado}::${normalizedTermino}`;

  if (inFlightBuscarPromise && inFlightBuscarKey === key) {
    return inFlightBuscarPromise;
  }

  const promise = getAnimalBridge()
    .buscarPorArete(termino, estado)
    .finally(() => {
      if (inFlightBuscarKey === key) {
        inFlightBuscarKey = null;
        inFlightBuscarPromise = null;
      }
    });

  inFlightBuscarKey = key;
  inFlightBuscarPromise = promise;

  return promise;
};

export const updateAnimal = (payload: UpdateAnimalPayload): Promise<UpdateAnimalResult> => {
  return getAnimalBridge().updateAnimal(payload);
};

export const changeEstado = (payload: ChangeEstadoPayload): Promise<ChangeEstadoResult> => {
  return getAnimalBridge().changeEstado(payload);
};

export const deleteAnimal = (id: number): Promise<DeleteAnimalResult> => {
  return getAnimalBridge().deleteAnimal({ id });
};

export const AnimalModule = {
  logEvent,
  insertAnimal,
  listAnimals,
  getAnimalesByEstado,
  buscarPorArete,
  updateAnimal,
  changeEstado,
  deleteAnimal,
};
