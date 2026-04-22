import { NativeModules } from 'react-native';

import type { InsertAnimalPayload, InsertAnimalResult } from '../types/Animal';

type AnimalNativeModule = {
  insertAnimal(payload: InsertAnimalPayload): Promise<InsertAnimalResult>;
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

export const AnimalModule = {
  insertAnimal,
};
