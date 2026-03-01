import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SectionConfig } from './types';

type Props = {
  section: SectionConfig;
};

export default function SectionDetailScreen({ section }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title} 상세 화면</Text>
      <Text style={styles.description}>빈 상세 화면입니다. 기능을 여기에 추가하면 됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  }
});
