import React from 'react';
import { router, Slot, useGlobalSearchParams, usePathname } from 'expo-router';
import { Asset } from 'expo-asset';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import MarketSidebar from '../src/components/MarketSidebar';
import WebTopBar from '../src/components/WebTopBar';
import { getStockIconUri } from '../src/constants/stockIcons';
import { WebThemeProvider, useWebTheme } from '../src/theme/WebThemeContext';

const MOBILE_WEB_BREAKPOINT = 900;
const getFirstString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function shouldShowMarketSidebar(pathname: string) {
  return (
    pathname.startsWith('/communities') ||
    pathname.startsWith('/prices') ||
    pathname.startsWith('/prediction') ||
    pathname.startsWith('/news')
  );
}

function WebRootLayoutInner() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
    mobileSidebar?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const showMarketSidebar = shouldShowMarketSidebar(pathname);
  const isMobileWeb = width <= MOBILE_WEB_BREAKPOINT;
  const { colors } = useWebTheme();
  const isMobileSidebarView = React.useMemo(() => {
    const raw = params.mobileSidebar;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value === '1' || value === 'true';
  }, [params.mobileSidebar]);
  const shouldRenderSidebar = !isMobileWeb || isMobileSidebarView;
  const prevIsMobileWebRef = React.useRef(isMobileWeb);
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

  React.useEffect(() => {
    const wasMobileWeb = prevIsMobileWebRef.current;
    const enteredMobileWeb = !wasMobileWeb && isMobileWeb;

    if (enteredMobileWeb && isMobileSidebarView) {
      const nextParams: Record<string, string> = {};
      const symbol = getFirstString(params.symbol);
      const sector = getFirstString(params.sector);
      const sectorName = getFirstString(params.sectorName);

      if (symbol) nextParams.symbol = symbol;
      if (sector) nextParams.sector = sector;
      if (sectorName) nextParams.sectorName = sectorName;

      router.replace({ pathname, params: nextParams } as any);
    }

    prevIsMobileWebRef.current = isMobileWeb;
  }, [isMobileSidebarView, isMobileWeb, params.sector, params.sectorName, params.symbol, pathname]);

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBackground }]}>
      <WebTopBar />
      {showMarketSidebar ? (
        <View style={[styles.marketLayout, { backgroundColor: colors.pageBackground }]}>
          {shouldRenderSidebar && (
            <MarketSidebar mode={isMobileWeb && isMobileSidebarView ? 'mobileSidebarOnly' : 'desktop'} />
          )}
          <View
            style={[
              styles.marketContent,
              isMobileWeb && isMobileSidebarView && styles.marketContentHiddenOnMobileSidebarOnly
            ]}
            pointerEvents={isMobileWeb && isMobileSidebarView ? 'none' : 'auto'}
          >
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
  },
  marketContentHiddenOnMobileSidebarOnly: {
    flex: 0,
    width: 0,
    minWidth: 0,
    maxWidth: 0,
    opacity: 0,
    overflow: 'hidden'
  }
});
