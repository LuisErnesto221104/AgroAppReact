import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type CostsScreenProps = {
  onBack: () => void;
};

export function CostsScreen({ onBack }: CostsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Control de Costos"
      description="Ventana base creada. Aqui ira el registro de gastos, insumos, ventas y el balance por animal."
      emoji="💵"
      onBack={onBack}
    />
  );
}
