import React from 'react';

import { RegistrarAnimalScreen } from '../../../screens/animales/RegistrarAnimalScreen';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return <RegistrarAnimalScreen onBack={onBack} />;
}
