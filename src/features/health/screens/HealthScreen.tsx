import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Control Sanitario"
      description="Ventana base creada. Aqui ira la programacion de vacunas, desparasitaciones y seguimiento de eventos de salud."
      emoji="💉"
      onBack={onBack}
    />
  );
}
