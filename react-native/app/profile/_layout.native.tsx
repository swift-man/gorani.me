import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '내 정보' }} />
      <Stack.Screen name="detail" options={{ title: '내 정보 상세' }} />
    </Stack>
  );
}
