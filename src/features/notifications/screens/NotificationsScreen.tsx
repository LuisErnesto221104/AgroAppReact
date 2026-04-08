import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Notificaciones"
      description="Ventana base creada. Aqui ira el envio y control de notificaciones de eventos programados."
      emoji="🔔"
      onBack={onBack}
    />
  );
}
