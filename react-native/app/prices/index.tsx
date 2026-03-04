import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { buildMarketRouteParams } from '../../src/utils/routeParams';

export default function PricesMainRouteLegacyRedirect() {
  const params = useLocalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
    mobileSidebar?: string | string[];
  }>();

  const nextParams = buildMarketRouteParams(params, { includeMobileSidebar: true });

  if (Object.keys(nextParams).length === 0) {
    return <Redirect href="/communities" />;
  }

  return <Redirect href={{ pathname: '/communities', params: nextParams }} />;
}
