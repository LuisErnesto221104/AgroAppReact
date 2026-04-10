import React from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type AuthenticatedScreenProps = {
  onBackToLogin: () => void;
};

export function AuthenticatedScreen({ onBackToLogin }: AuthenticatedScreenProps) {
  return (
    <SafeAreaView style={authStyles.authenticatedSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AUTH_COLOR.white} />
      <View style={authStyles.authenticatedContainer}>
        <Text style={authStyles.authenticatedTitle}>Sesion iniciada</Text>
        <Text style={authStyles.authenticatedBody}>
          Login local exitoso. Ya puedes conectar esta pantalla con el menu principal del APK.
        </Text>

        <Pressable style={[authStyles.primaryButton, authStyles.authenticatedButton]} onPress={onBackToLogin}>
          <Text style={authStyles.primaryButtonText}>Volver al Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
