import React from 'react';
import { Tabs } from 'expo-router';

export default function NativeRootLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="communities" options={{ title: '시세' }} />
      <Tabs.Screen name="prediction" options={{ title: '예측' }} />
      <Tabs.Screen name="news" options={{ title: '뉴스' }} />
      <Tabs.Screen name="profile" options={{ title: '내 정보' }} />
      <Tabs.Screen name="prices" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
