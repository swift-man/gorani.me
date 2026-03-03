import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import CommunityComposer from '../../src/components/prices/CommunityComposer';
import MainCommunityHome from '../../src/components/prices/MainCommunityHome';
import { useWebTheme } from '../../src/theme/WebThemeContext';

const getFirstString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function CommunitiesMainRoute() {
  const params = useLocalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const { colors, resolvedMode } = useWebTheme();
  const isDarkMode = resolvedMode === 'dark';
  const isMobileWeb = width <= 900;

  const selectedSymbol = getFirstString(params.symbol);
  const selectedSector = getFirstString(params.sector);
  const selectedSectorName = getFirstString(params.sectorName);
  const isMainCommunity = !selectedSymbol && !selectedSector;
  const communityTitle = selectedSymbol
    ? `${selectedSymbol} 커뮤니티`
    : selectedSector
      ? `${selectedSectorName ?? selectedSector} 커뮤니티`
      : '메인 커뮤니티';

  return (
    <View
      style={[
        styles.mainArea,
        isMobileWeb && styles.mainAreaMobile,
        { backgroundColor: colors.detailBackground }
      ]}
    >
      <View style={[styles.mainTopBar, isDarkMode && styles.mainTopBarDark, isMobileWeb && styles.mainTopBarMobile]}>
        <Text style={[styles.mainTopBarTitle, isDarkMode && styles.mainTopBarTitleDark]}>{communityTitle}</Text>
      </View>

      {isMainCommunity ? (
        <MainCommunityHome isDarkMode={isDarkMode} isMobileWeb={isMobileWeb} />
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

      <CommunityComposer
        isDarkMode={isDarkMode}
        backgroundColor={colors.detailBackground}
        isMobileWeb={isMobileWeb}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
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
  mainTopBar: {
    height: 48,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    justifyContent: 'center'
  },
  mainTopBarDark: {
    borderBottomColor: '#36363B'
  },
  mainTopBarMobile: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  mainTopBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  mainTopBarTitleDark: {
    color: '#e2e8f0'
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
  }
});
