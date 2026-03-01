import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SectionConfig } from './types';

type Props = {
  section: SectionConfig;
  onPressDetail: () => void;
};

export default function SectionMainScreen({ section, onPressDetail }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title} 메인 화면</Text>
      <Text style={styles.description}>여기는 {section.title} 메인 화면입니다.</Text>
      <Pressable style={styles.button} onPress={onPressDetail}>
        <Text style={styles.buttonText}>상세 화면으로 이동</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
