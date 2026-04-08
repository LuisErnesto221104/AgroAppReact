import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Gestionar Animales"
      description="Ventana base creada. Aqui ira el control del ciclo de vida, altas, identificacion y estados productivos."
      emoji="🐄"
      onBack={onBack}
    />
  );
}
