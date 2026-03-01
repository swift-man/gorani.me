import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import NativeNavigator from './src/navigation/NativeNavigator';
import WebRouter from './src/navigation/WebRouter';

export default function App() {
  return (
    <>
      {Platform.OS === 'web' ? <WebRouter /> : <NativeNavigator />}
      <StatusBar style="auto" />
    </>
  );
}
