import React from 'react';

import { AnimalesNavigator } from '../../../navigation/AnimalesNavigator';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return <AnimalesNavigator onBack={onBack} />;
}
