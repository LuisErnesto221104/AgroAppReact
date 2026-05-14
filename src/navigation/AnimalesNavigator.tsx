import React, { useState } from 'react';

import { EditarAnimalScreen } from '../screens/animales/EditarAnimalScreen';
import { ListadoAnimalesScreen } from '../screens/animales/ListadoAnimalesScreen';
import { RegistrarAnimalScreen } from '../screens/animales/RegistrarAnimalScreen';
import { AnimalModel } from '../types/Animal';
import { DetalleAnimalScreen } from '../screens/animales/DetalleAnimalScreen';
import HistorialClinico from '../features/animals/screens/HistorialClinico';
import { RegistrarEventoSanitario } from '../screens/sanitarios/RegistrarEventoSanitario';

type AnimalesNavigatorProps = {
  onBack: () => void;
};

type AnimalRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'detail'; animalId: number; refreshToken: number }
  | { name: 'historial'; animalId: number }
  | { name: 'registerEvent'; animalId: number }
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
        onOpenHistorial={animalId => setRoute({ name: 'historial', animalId })}
      />
    );
  }

  if (route.name === 'historial') {
    return (
      <HistorialClinico
        route={{ params: { animalId: route.animalId } }}
        navigation={{
          goBack: () => setRoute({ name: 'detail', animalId: route.animalId, refreshToken: Date.now() }),
          navigate: (name: string, params?: any) => {
            if (name === 'NuevoEvento') {
              setRoute({ name: 'registerEvent', animalId: route.animalId });
            }
          },
        }}
      />
    );
  }

  if (route.name === 'registerEvent') {
    return (
      <RegistrarEventoSanitario
        animalId={route.animalId}
        onBack={() => setRoute({ name: 'historial', animalId: route.animalId })}
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
