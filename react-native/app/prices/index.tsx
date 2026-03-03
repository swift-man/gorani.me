import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

const getFirstString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function PricesMainRouteLegacyRedirect() {
  const params = useLocalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
    mobileSidebar?: string | string[];
  }>();

  const symbol = getFirstString(params.symbol);
  const sector = getFirstString(params.sector);
  const sectorName = getFirstString(params.sectorName);
  const mobileSidebar = getFirstString(params.mobileSidebar);
  const nextParams: Record<string, string> = {};

  if (symbol) nextParams.symbol = symbol;
  if (sector) nextParams.sector = sector;
  if (sectorName) nextParams.sectorName = sectorName;
  if (mobileSidebar) nextParams.mobileSidebar = mobileSidebar;

  if (Object.keys(nextParams).length === 0) {
    return <Redirect href="/communities" />;
  }

  return <Redirect href={{ pathname: '/communities', params: nextParams }} />;
}
