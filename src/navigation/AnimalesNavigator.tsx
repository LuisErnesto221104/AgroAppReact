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
  | { name: 'detail'; animalId: number; refreshToken: number }
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
        key={`${route.animalId}-${route.refreshToken}`}
        animalId={route.animalId}
        refreshToken={route.refreshToken}
        onBack={() => setRoute({ name: 'list' })}
        onEdit={animal => setRoute({ name: 'edit', animal })}
        onDeleted={refreshList}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <EditarAnimalScreen
        animal={route.animal}
        onBack={() => setRoute({ name: 'detail', animalId: route.animal.id, refreshToken: Date.now() })}
        onSaved={() => setRoute({ name: 'detail', animalId: route.animal.id, refreshToken: Date.now() })}
      />
    );
  }

  return (
    <ListadoAnimalesScreen
      onBackHome={onBack}
      onCreateAnimal={() => setRoute({ name: 'register' })}
      onOpenDetail={animalId => setRoute({ name: 'detail', animalId, refreshToken: Date.now() })}
    />
  );
}
