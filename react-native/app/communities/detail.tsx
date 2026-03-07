import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import SymbolCommunityHome from '../../src/components/prices/SymbolCommunityHome';
import { BoardFollowProvider } from '../../src/components/prices/following/BoardFollowContext';
import { useWebTheme } from '../../src/theme/WebThemeContext';
import { getFirstString } from '../../src/utils/routeParams';

const MOBILE_WEB_BREAKPOINT = 900;

export default function CommunitiesDetailRoute() {
  return (
    <BoardFollowProvider>
      <CommunitiesDetailRouteInner />
    </BoardFollowProvider>
  );
}

function CommunitiesDetailRouteInner() {
  const params = useLocalSearchParams<{
    symbol?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const { colors, resolvedMode } = useWebTheme();
  const isDarkMode = resolvedMode === 'dark';
  const isMobileWeb = width <= MOBILE_WEB_BREAKPOINT;
  const selectedSymbol = getFirstString(params.symbol) ?? 'KRW-COIN1';

  return (
    <View
      style={[
        styles.mainArea,
        isMobileWeb && styles.mainAreaMobile,
        { backgroundColor: colors.detailBackground }
      ]}
    >
      <SymbolCommunityHome
        isDarkMode={isDarkMode}
        isMobileWeb={isMobileWeb}
        selectedSymbol={selectedSymbol}
        selectedBoardKey={`symbol:${selectedSymbol}`}
        selectedBoardName={selectedSymbol}
        contentMode="detail"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
    marginTop: 0,
    borderRadius: 20,
    overflow: 'hidden'
  },
  mainAreaMobile: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    borderRadius: 0
  }
});
