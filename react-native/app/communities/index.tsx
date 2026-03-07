import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import CommunityComposer from '../../src/components/prices/CommunityComposer';
import MainCommunityHome from '../../src/components/prices/MainCommunityHome';
import SymbolCommunityHome from '../../src/components/prices/SymbolCommunityHome';
import {
  BoardFollowProvider,
  useBoardFollow
} from '../../src/components/prices/following/BoardFollowContext';
import { useWebTheme } from '../../src/theme/WebThemeContext';
import { getFirstString } from '../../src/utils/routeParams';

export default function CommunitiesMainRoute() {
  return (
    <BoardFollowProvider>
      <CommunitiesMainRouteInner />
    </BoardFollowProvider>
  );
}

function CommunitiesMainRouteInner() {
  const params = useLocalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const { colors, resolvedMode } = useWebTheme();
  const { isBoardFollowing } = useBoardFollow();
  const isDarkMode = resolvedMode === 'dark';
  const isMobileWeb = width <= 900;

  const selectedSymbol = getFirstString(params.symbol);
  const selectedSector = getFirstString(params.sector);
  const selectedSectorName = getFirstString(params.sectorName);
  const isSymbolCommunity = !!selectedSymbol;
  const isSectorCommunity = !!selectedSector;
  const isMainCommunity = !selectedSymbol && !selectedSector;
  const shouldRenderFeedLayout = isMainCommunity || isSymbolCommunity || isSectorCommunity;
  const symbolBoardKey = selectedSymbol || selectedSectorName?.trim() || selectedSector || '';
  const symbolBoardName = selectedSymbol || selectedSectorName?.trim() || selectedSector || '';
  const activeBoardKey = selectedSymbol
    ? `symbol:${selectedSymbol}`
    : selectedSector
      ? `sector:${selectedSector}`
      : '';
  const isActiveBoardFollowing = !!activeBoardKey && isBoardFollowing(activeBoardKey);
  const shouldShowComposer = !isMainCommunity && isActiveBoardFollowing;
  const composerReveal = React.useRef(new Animated.Value(shouldShowComposer ? 1 : 0)).current;
  const [shouldRenderComposer, setShouldRenderComposer] = React.useState(shouldShowComposer);

  React.useEffect(() => {
    if (shouldShowComposer) {
      setShouldRenderComposer(true);
      Animated.timing(composerReveal, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }).start();
      return;
    }

    Animated.timing(composerReveal, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setShouldRenderComposer(false);
      }
    });
  }, [composerReveal, shouldShowComposer]);

  const composerTranslateY = composerReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0]
  });

  return (
    <View
      style={[
        styles.mainArea,
        isMobileWeb && styles.mainAreaMobile,
        { backgroundColor: colors.detailBackground }
      ]}
    >
      {shouldRenderFeedLayout ? (
        isSymbolCommunity || isSectorCommunity ? (
          <SymbolCommunityHome
            isDarkMode={isDarkMode}
            isMobileWeb={isMobileWeb}
            selectedSymbol={symbolBoardKey}
            selectedBoardKey={activeBoardKey}
            selectedBoardName={symbolBoardName}
          />
        ) : (
          <MainCommunityHome isDarkMode={isDarkMode} isMobileWeb={isMobileWeb} />
        )
      ) : (
        <View style={styles.mainContent}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            {selectedSymbol ?? selectedSectorName ?? selectedSector}
          </Text>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            {selectedSymbol
              ? `선택된 ${selectedSymbol} 종목의 커뮤니티 화면입니다.`
              : `선택된 ${selectedSectorName ?? selectedSector} 섹터의 커뮤니티 화면입니다.`}
          </Text>
          <Pressable
            style={[styles.button, isDarkMode && styles.buttonDark]}
            onPress={() => router.push('/communities/detail')}
          >
            <Text style={styles.buttonText}>상세 화면으로 이동</Text>
          </Pressable>
        </View>
      )}

      {shouldRenderComposer && (
        <Animated.View
          style={[
            styles.composerAnimatedWrap,
            { opacity: composerReveal, transform: [{ translateY: composerTranslateY }] }
          ]}
        >
          <CommunityComposer
            isDarkMode={isDarkMode}
            backgroundColor={colors.detailBackground}
            isMobileWeb={isMobileWeb}
          />
        </Animated.View>
      )}
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
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0f172a'
  },
  titleDark: {
    color: '#f8fafc'
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 18
  },
  descriptionDark: {
    color: '#cbd5e1'
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18
  },
  buttonDark: {
    backgroundColor: '#334155'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  composerAnimatedWrap: {
    width: '100%'
  }
});
