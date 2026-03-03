import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import CommunityComposer from '../../src/components/prices/CommunityComposer';
import MainCommunityHome from '../../src/components/prices/MainCommunityHome';
import { useWebTheme } from '../../src/theme/WebThemeContext';

export default function PricesMainRoute() {
  const params = useLocalSearchParams<{ rank?: string; symbol?: string }>();
  const { width } = useWindowDimensions();
  const { colors, resolvedMode } = useWebTheme();
  const isDarkMode = resolvedMode === 'dark';
  const isMobileWeb = width <= 900;

  const selectedSymbol = typeof params.symbol === 'string' ? params.symbol : null;
  const isMainCommunity = !selectedSymbol;
  const selectedRank =
    typeof params.rank === 'string' && Number.isFinite(Number(params.rank))
      ? Number(params.rank)
      : 1;

  return (
    <View
      style={[
        styles.mainArea,
        isMobileWeb && styles.mainAreaMobile,
        { backgroundColor: colors.detailBackground }
      ]}
    >
      <View style={[styles.mainTopBar, isDarkMode && styles.mainTopBarDark, isMobileWeb && styles.mainTopBarMobile]}>
        <Text style={[styles.mainTopBarTitle, isDarkMode && styles.mainTopBarTitleDark]}>
          {isMainCommunity ? '메인 커뮤니티' : `${selectedSymbol} 커뮤니티`}
        </Text>
      </View>

      {isMainCommunity ? (
        <MainCommunityHome isDarkMode={isDarkMode} isMobileWeb={isMobileWeb} />
      ) : (
        <View style={styles.mainContent}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>{selectedSymbol}</Text>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            선택된 {selectedRank}위 종목의 커뮤니티 화면입니다.
          </Text>
          <Pressable
            style={[styles.button, isDarkMode && styles.buttonDark]}
            onPress={() => router.push('/prices/detail')}
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
