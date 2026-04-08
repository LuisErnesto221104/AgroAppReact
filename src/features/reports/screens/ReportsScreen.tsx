import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type ReportsScreenProps = {
  onBack: () => void;
};

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Reportes"
      description="Ventana base creada. Aqui iran los resumenes visuales y documentos exportables del sistema."
      emoji="📊"
      onBack={onBack}
    />
  );
}
