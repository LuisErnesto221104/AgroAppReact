import React, { useState } from 'react';

import { EditarAnimalScreen } from '../screens/animales/EditarAnimalScreen';
import { ListadoAnimalesScreen } from '../screens/animales/ListadoAnimalesScreen';
import { RegistrarAnimalScreen } from '../screens/animales/RegistrarAnimalScreen';
import { AnimalModel } from '../types/Animal';
import { DetalleAnimalScreen } from '../screens/animales/DetalleAnimalScreen';

type AnimalesNavigatorProps = {
  onBack: () => void;
};

type AnimalRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'detail'; animal: AnimalModel }
  | { name: 'edit'; animal: AnimalModel };

export function AnimalesNavigator({ onBack }: AnimalesNavigatorProps) {
  const [route, setRoute] = useState<AnimalRoute>({ name: 'list' });

  const refreshList = () => {
    setRoute({ name: 'list' });
  };

  if (route.name === 'register') {
    return <RegistrarAnimalScreen onBack={() => setRoute({ name: 'list' })} onSuccess={refreshList} />;
  }

  if (route.name === 'detail') {
    return (
      <DetalleAnimalScreen
        animal={route.animal}
        onBack={() => setRoute({ name: 'list' })}
        onEdit={animal => setRoute({ name: 'edit', animal })}
        onDeleted={refreshList}
        onUpdated={refreshList}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <EditarAnimalScreen
        animal={route.animal}
        onBack={() => setRoute({ name: 'detail', animal: route.animal })}
        onSaved={refreshList}
      />
    );
  }

  return (
    <ListadoAnimalesScreen onBackHome={onBack} onCreateAnimal={() => setRoute({ name: 'register' })} onOpenDetail={animal => setRoute({ name: 'detail', animal })} />
  );
}
