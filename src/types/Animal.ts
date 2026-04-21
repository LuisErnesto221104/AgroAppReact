export interface AnimalFormState {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  foto: string;
}

export interface AnimalModel {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
}

export interface InsertAnimalPayload {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
}

export interface InsertAnimalResult {
  ok: boolean;
  animalId: number;
  arete: string;
}
