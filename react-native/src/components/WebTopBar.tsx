import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocation, useNavigate } from 'react-router-dom';

import { sections } from '../screens/types';

export default function WebTopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <View style={styles.container}>
      {sections.map((section) => {
        const selected =
          location.pathname === section.webPath ||
          location.pathname.startsWith(`${section.webPath}/`);

        return (
          <Pressable
            key={section.key}
            style={[styles.item, selected && styles.itemSelected]}
            onPress={() => navigate(section.webPath)}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{section.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  item: {
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  itemSelected: {
    backgroundColor: '#0f172a'
  },
  text: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600'
  },
  textSelected: {
    color: '#ffffff'
  }
});
