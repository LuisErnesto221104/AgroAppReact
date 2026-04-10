import React from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles, PIN_KEY_ROWS } from './authStyles';

type PinLoginScreenProps = {
  primaryUserName: string;
  pinIndicators: boolean[];
  error: string;
  onPressDigit: (digit: string) => void;
  onPressDelete: () => void;
  onSubmitPin: () => void;
};

export function PinLoginScreen({
  primaryUserName,
  pinIndicators,
  error,
  onPressDigit,
  onPressDelete,
  onSubmitPin,
}: PinLoginScreenProps) {
  return (
    <SafeAreaView style={authStyles.loginSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.loginContainer}>
        <View style={authStyles.logoBadgeDark}>
          <Text style={[authStyles.logoBadgeText, authStyles.logoBadgeTextDark]}>A</Text>
        </View>

        <Text style={authStyles.loginTitle}>AgroApp</Text>
        <Text style={authStyles.loginSubtitle}>Ingrese su PIN</Text>
        <Text style={authStyles.loginUserLabel}>{primaryUserName}</Text>

        <View style={authStyles.indicatorRow}>
          {pinIndicators.map((filled, index) => (
            <View key={index} style={[authStyles.indicatorDot, filled && authStyles.indicatorDotFilled]} />
          ))}
        </View>

        {error ? (
          <View style={authStyles.errorPill}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={authStyles.keypad}>
          {PIN_KEY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={authStyles.keyRow}>
              {row.map(key => {
                const isDelete = key === 'BORRAR';
                const isSingleZero = key === '0';
                return (
                  <Pressable
                    key={key}
                    style={[authStyles.keyButton, isSingleZero && authStyles.keyButtonZero]}
                    onPress={() => (isDelete ? onPressDelete() : onPressDigit(key))}
                  >
                    <Text style={[authStyles.keyText, isDelete && authStyles.deleteKeyText]}>
                      {isDelete ? '<' : key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Pressable style={authStyles.submitButton} onPress={onSubmitPin}>
          <Text style={authStyles.submitButtonText}>Ingresar</Text>
        </Pressable>

        <Text style={authStyles.footerTextDark}>Olvido su PIN? Contacte al administrador</Text>
      </View>
    </SafeAreaView>
  );
}
