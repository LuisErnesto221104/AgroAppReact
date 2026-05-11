import React, { useState } from 'react';

import { RegistrarGastoScreen } from '../features/costs/screens/RegistrarGastoScreen';
import { GestionGastosScreen } from '../features/costs/screens/GestionGastosScreen';

type CostsNavigatorProps = {
  onBack: () => void;
};

type CostsRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'edit'; gastoId: number };

export function CostsNavigator({ onBack }: CostsNavigatorProps) {
  const [route, setRoute] = useState<CostsRoute>({ name: 'list' });
  const [listKey, setListKey] = useState(0);

  const refreshList = () => {
    setListKey(k => k + 1);
    setRoute({ name: 'list' });
  };

  if (route.name === 'register') {
    return (
      <RegistrarGastoScreen
        onBack={() => setRoute({ name: 'list' })}
        onSuccess={refreshList}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <RegistrarGastoScreen
        key={route.gastoId}
        gastoId={route.gastoId}
        onBack={() => setRoute({ name: 'list' })}
        onSuccess={refreshList}
      />
    );
  }

  return (
    <GestionGastosScreen
      key={listKey}
      onBack={onBack}
      onNewGasto={() => setRoute({ name: 'register' })}
      onEditGasto={(gastoId) => setRoute({ name: 'edit', gastoId })}
    />
  );
}
