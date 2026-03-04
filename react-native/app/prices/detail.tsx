import React from 'react';
import { Redirect } from 'expo-router';

export default function PricesDetailRouteLegacyRedirect() {
  return <Redirect href="/communities/detail" />;
}
