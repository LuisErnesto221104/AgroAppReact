import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/identity';

type ModulePlaceholderScreenProps = {
  title: string;
  description: string;
  emoji: string;
  onBack: () => void;
};

export function ModulePlaceholderScreen({
  title,
  description,
  emoji,
  onBack,
}: ModulePlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver al Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emojiCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#e4efe8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 46,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
