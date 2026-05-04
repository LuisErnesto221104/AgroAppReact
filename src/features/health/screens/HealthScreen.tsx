import React from 'react';

import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  return <RegistrarEventoSanitario onBack={onBack} />;
}
