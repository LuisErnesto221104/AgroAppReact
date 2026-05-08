import React from 'react';

import { CostsNavigator } from '../../../navigation/CostsNavigator';

type CostsScreenProps = {
  onBack: () => void;
};

export function CostsScreen({ onBack }: CostsScreenProps) {
  return <CostsNavigator onBack={onBack} />;
}
