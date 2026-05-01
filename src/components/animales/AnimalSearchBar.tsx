import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type AnimalSearchBarProps = {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
};

export function AnimalSearchBar({ value, onSearch, placeholder = 'Buscar por arete...' }: AnimalSearchBarProps) {
  const showClear = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onSearch}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#859383"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showClear ? (
        <Pressable style={styles.clearButton} onPress={() => onSearch('')}>
          <Text style={styles.clearText}>X</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cfd9c5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    color: '#1c2b1d',
    fontSize: 14,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eff4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: '#49614c',
    fontWeight: '800',
    fontSize: 12,
  },
});
