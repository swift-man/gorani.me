import React from 'react';
import { Slot, useGlobalSearchParams, usePathname } from 'expo-router';
import { Asset } from 'expo-asset';
import { Platform, StyleSheet, View } from 'react-native';

import MarketSidebar from '../src/components/MarketSidebar';
import WebTopBar from '../src/components/WebTopBar';
import { getStockIconUri } from '../src/constants/stockIcons';
import { WebThemeProvider, useWebTheme } from '../src/theme/WebThemeContext';

function shouldShowMarketSidebar(pathname: string) {
  return (
    pathname.startsWith('/prices') ||
    pathname.startsWith('/prediction') ||
    pathname.startsWith('/news')
  );
}

function WebRootLayoutInner() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ symbol?: string | string[] }>();
  const showMarketSidebar = shouldShowMarketSidebar(pathname);
  const { colors } = useWebTheme();
  const selectedSymbol = React.useMemo(() => {
    const rawSymbol = params.symbol;

    if (Array.isArray(rawSymbol)) {
      return typeof rawSymbol[0] === 'string' ? rawSymbol[0] : null;
    }

    return typeof rawSymbol === 'string' ? rawSymbol : null;
  }, [params.symbol]);
  const defaultFaviconUri = React.useMemo(() => {
    return Asset.fromModule(require('../src/assets/gorani.png')).uri;
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const nextFaviconUri = selectedSymbol ? getStockIconUri(selectedSymbol) : defaultFaviconUri;
    if (!nextFaviconUri) return;

    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }

    faviconLink.href = nextFaviconUri;

    const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
    if (shortcutIcon) {
      shortcutIcon.href = nextFaviconUri;
    }
  }, [defaultFaviconUri, selectedSymbol]);

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBackground }]}>
      <WebTopBar />
      {showMarketSidebar ? (
        <View style={[styles.marketLayout, { backgroundColor: colors.pageBackground }]}>
          <MarketSidebar />
          <View style={styles.marketContent}>
            <Slot />
          </View>
        </View>
      ) : (
        <View style={[styles.content, { backgroundColor: colors.pageBackground }]}>
          <Slot />
        </View>
      )}
    </View>
  );
}

export default function WebRootLayout() {
  return (
    <WebThemeProvider>
      <WebRootLayoutInner />
    </WebThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    flex: 1
  },
  marketLayout: {
    flex: 1,
    flexDirection: 'row'
  },
  marketContent: {
    flex: 1,
    minWidth: 0
  }
});
