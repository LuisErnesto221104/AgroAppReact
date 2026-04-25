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
  insertAnimal(payload: InsertAnimalPayload): Promise<InsertAnimalResult>;
  listAnimals(): Promise<AnimalModel[]>;
  getAnimalesByEstado(estado: AnimalEstado): Promise<AnimalModel[]>;
  updateAnimal(payload: UpdateAnimalPayload): Promise<UpdateAnimalResult>;
  changeEstado(payload: ChangeEstadoPayload): Promise<ChangeEstadoResult>;
  deleteAnimal(payload: { id: number }): Promise<DeleteAnimalResult>;
};

const { AnimalModule: NativeAnimalModule } = NativeModules;

const getAnimalBridge = (): AnimalNativeModule => {
  if (!NativeAnimalModule) {
    throw new Error('AnimalModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return NativeAnimalModule as AnimalNativeModule;
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
  insertAnimal,
  listAnimals,
  getAnimalesByEstado,
  updateAnimal,
  changeEstado,
  deleteAnimal,
};
