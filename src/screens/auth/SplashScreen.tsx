import React from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type SplashScreenProps = {
  onContinue: () => void;
};

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <SafeAreaView style={authStyles.splashSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.splashContainer}>
        <View style={authStyles.logoBadgeLight}>
          <Text style={authStyles.logoBadgeText}>A</Text>
        </View>

        <Text style={authStyles.splashTitle}>AgroApp</Text>
        <Text style={authStyles.splashSubtitle}>Gestion Ganadera Offline</Text>
        <Text style={authStyles.splashBody}>Bienvenido. Cree su PIN de seguridad de 4 digitos</Text>

        <View style={authStyles.progressRow}>
          {[0, 1, 2, 3].map(step => (
            <View key={step} style={[authStyles.progressDot, step === 0 && authStyles.progressDotActive]} />
          ))}
        </View>

        <Pressable onPress={onContinue} style={authStyles.primaryButton}>
          <Text style={authStyles.primaryButtonText}>Continuar</Text>
        </Pressable>

        <Text style={authStyles.footerTextLight}>Sus datos nunca salen del dispositivo</Text>
      </View>
    </SafeAreaView>
  );
}
