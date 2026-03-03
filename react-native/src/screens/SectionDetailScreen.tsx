import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SectionConfig } from './types';
import { useWebTheme } from '../theme/WebThemeContext';

type Props = {
  section: SectionConfig;
};

export default function SectionDetailScreen({ section }: Props) {
  const { colors, resolvedMode } = useWebTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.detailBackground }]}>
      <Text style={[styles.title, resolvedMode === 'dark' && styles.titleDark]}>
        {section.title} 상세 화면
      </Text>
      <Text style={[styles.description, resolvedMode === 'dark' && styles.descriptionDark]}>
        빈 상세 화면입니다. 기능을 여기에 추가하면 됩니다.
      </Text>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0f172a'
  },
  titleDark: {
    color: '#f8fafc'
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  },
  descriptionDark: {
    color: '#cbd5e1'
  }
});
