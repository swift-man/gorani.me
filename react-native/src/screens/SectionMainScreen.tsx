import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SectionConfig } from './types';
import { useWebTheme } from '../theme/WebThemeContext';

type Props = {
  section: SectionConfig;
  onPressDetail: () => void;
};

export default function SectionMainScreen({ section, onPressDetail }: Props) {
  const { colors, resolvedMode } = useWebTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <Text style={[styles.title, resolvedMode === 'dark' && styles.titleDark]}>
        {section.title} 메인 화면
      </Text>
      <Text style={[styles.description, resolvedMode === 'dark' && styles.descriptionDark]}>
        여기는 {section.title} 메인 화면입니다.
      </Text>
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
    padding: 24
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0f172a'
  },
  titleDark: {
    color: '#f8fafc'
  },
  description: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20
  },
  descriptionDark: {
    color: '#e3e3e3'
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
