import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModuleCardProps = {
  title: string;
  description: string;
};

export function ModuleCard({ title, description }: ModuleCardProps) {
  return (
    <Pressable style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>PROXIMAMENTE</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8e4',
    padding: 14,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#07612d',
    backgroundColor: '#e6f2ec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d1d1b',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#45524a',
  },
});
