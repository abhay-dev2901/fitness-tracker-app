import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFontStyle } from '../../utils/fonts';

export default function AddExerciseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Exercise</Text>
      <Text style={styles.subtitle}>Add exercise feature coming soon!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
    ...getFontStyle('bold'),
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    ...getFontStyle('regular'),
  },
});

