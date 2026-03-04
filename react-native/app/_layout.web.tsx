import React from 'react';
import { router, Slot, useGlobalSearchParams, usePathname } from 'expo-router';
import { Asset } from 'expo-asset';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import MarketSidebar from '../src/components/MarketSidebar';
import WebTopBar from '../src/components/WebTopBar';
import { isMarketRoutePath } from '../src/constants/marketRoutes';
import { getStockIconUri } from '../src/constants/stockIcons';
import { WebThemeProvider, useWebTheme } from '../src/theme/WebThemeContext';
import {
  buildMarketRouteParams,
  getFirstString,
  isMobileSidebarParam
} from '../src/utils/routeParams';

const MOBILE_WEB_BREAKPOINT = 900;

function WebRootLayoutInner() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
    mobileSidebar?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const showMarketSidebar = isMarketRoutePath(pathname);
  const isMobileWeb = width <= MOBILE_WEB_BREAKPOINT;
  const { colors } = useWebTheme();
  const isMobileSidebarView = React.useMemo(() => {
    return isMobileSidebarParam(params.mobileSidebar);
  }, [params.mobileSidebar]);
  const shouldRenderSidebar = !isMobileWeb || isMobileSidebarView;
  const prevIsMobileWebRef = React.useRef(isMobileWeb);
  const selectedSymbol = React.useMemo(() => {
    return getFirstString(params.symbol) ?? null;
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
      const nextParams = buildMarketRouteParams({
        symbol: params.symbol,
        sector: params.sector,
        sectorName: params.sectorName
      });

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
