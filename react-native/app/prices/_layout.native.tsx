import React from 'react';
import { Stack } from 'expo-router';

export default function PricesStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '시세' }} />
      <Stack.Screen name="detail" options={{ title: '시세 상세' }} />
    </Stack>
  );
}
