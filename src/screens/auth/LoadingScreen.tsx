import React from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

export function LoadingScreen() {
  return (
    <SafeAreaView style={authStyles.loaderSafeArea}>
      <ActivityIndicator size="large" color={AUTH_COLOR.primary} />
      <Text style={authStyles.loaderText}>Cargando autenticacion local...</Text>
    </SafeAreaView>
  );
}
