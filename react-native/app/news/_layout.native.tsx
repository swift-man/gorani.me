import React from 'react';
import { Stack } from 'expo-router';

export default function NewsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '뉴스' }} />
      <Stack.Screen name="detail" options={{ title: '뉴스 상세' }} />
    </Stack>
  );
}
