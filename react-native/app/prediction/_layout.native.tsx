import React from 'react';
import { Stack } from 'expo-router';

export default function PredictionStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '예측' }} />
      <Stack.Screen name="detail" options={{ title: '예측 상세' }} />
    </Stack>
  );
}
