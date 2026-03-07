import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { getStockIconUri } from '../../constants/stockIcons';
import CommunityContentList from './community-feed/CommunityContentList';
import { useCommunityFeed } from './community-feed/useCommunityFeed';

type SymbolCommunityHomeProps = {
  isDarkMode: boolean;
  isMobileWeb?: boolean;
  selectedSymbol: string;
};

type StockInfoField = {
  label: string;
  value: string;
  helper?: string;
};

const SECTOR_BOARD_MIN_WIDTH = 1000;
const STOCK_INFO_MENU_ITEMS = ['주요 정보', '재무', '실적', '배당', '동종 업계 비교', '애널리스트 분석'];
const SYMBOL_TOP_GAP = 6;
const SORT_BAR_HEIGHT = 36;
const STOCK_INFO_TOP_OFFSET = SYMBOL_TOP_GAP + SORT_BAR_HEIGHT;

const getSymbolSequence = (symbol?: string): number => {
  const matched = symbol?.match(/\d+/)?.[0];
  if (!matched) return 1;
  const parsed = Number.parseInt(matched, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const getStockDisplayName = (symbol?: string): string => {
  const sequence = getSymbolSequence(symbol);
  return `코인 ${sequence}`;
};

const createStockInfoFields = (symbol?: string): StockInfoField[] => {
  const sequence = getSymbolSequence(symbol);
  const listedAtYear = 2020 + sequence;
  const listedAtMonth = ((sequence + 1) % 12) + 1;
  const listedAtDay = Math.min(27, 10 + sequence);

  return [
    { label: '시가총액', value: `${12 + sequence}조 ${3200 + sequence * 181}억원` },
    { label: '실제 기업 가치', value: `${11 + sequence}조 ${2800 + sequence * 159}억원` },
    { label: '기업명', value: `${symbol ?? `KRW-COIN${sequence}`}` },
    { label: '대표이사', value: `대표 ${sequence}` },
    {
      label: '상장일',
      value: `${listedAtYear}년 ${listedAtMonth}월 ${listedAtDay}일`,
      helper: `${listedAtYear - 1}년 설립`
    },
    { label: '발행주식수', value: `${165 + sequence * 4},072,379주`, helper: '26년 3월 7일 기준' }
  ];
};

export default function SymbolCommunityHome({
  isDarkMode,
  isMobileWeb = false,
  selectedSymbol
}: SymbolCommunityHomeProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const showSidePanel = !isMobileWeb && screenWidth >= SECTOR_BOARD_MIN_WIDTH;
  const feedController = useCommunityFeed({ screenWidth, screenHeight });
  const stockDisplayName = React.useMemo(() => getStockDisplayName(selectedSymbol), [selectedSymbol]);
  const stockInfoFields = React.useMemo(() => createStockInfoFields(selectedSymbol), [selectedSymbol]);
  const stockInfoDescription = React.useMemo(
    () =>
      `${stockDisplayName}는 커뮤니티 관심도가 높은 종목으로 최근 거래량과 뉴스 모멘텀이 동시에 유입되고 있습니다. 단기 변동성 구간에서는 분할 진입과 손절 기준을 함께 관리하는 전략이 유효합니다.`,
    [stockDisplayName]
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isMobileWeb ? styles.contentMobile : styles.contentDesktop]}
      showsVerticalScrollIndicator
      scrollEventThrottle={16}
      onScroll={feedController.handleScroll}
    >
      <View style={[styles.mainBodyRow, showSidePanel && styles.mainBodyRowWide]}>
        <CommunityContentList
          isDarkMode={isDarkMode}
          showSidePanel={showSidePanel}
          feedController={feedController}
          topInset={SYMBOL_TOP_GAP}
        />

        {showSidePanel && (
          <View style={[styles.stockInfoColumn, isDarkMode && styles.stockInfoColumnDark]}>
            <View style={styles.stockInfoHeadRow}>
              <View style={styles.stockInfoIdentityWrap}>
                <Image source={{ uri: getStockIconUri(selectedSymbol) }} style={styles.stockInfoIcon} />
                <View style={styles.stockInfoIdentityTextWrap}>
                  <Text style={[styles.stockInfoName, isDarkMode && styles.stockInfoNameDark]} numberOfLines={1}>
                    {stockDisplayName}
                  </Text>
                  <Text style={[styles.stockInfoMeta, isDarkMode && styles.stockInfoMetaDark]} numberOfLines={1}>
                    {selectedSymbol}
                  </Text>
                </View>
              </View>
              <Pressable style={[styles.stockInfoHomeButton, isDarkMode && styles.stockInfoHomeButtonDark]}>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={14}
                  color={isDarkMode ? '#e2e8f0' : '#0f172a'}
                  style={styles.stockInfoHomeButtonIcon}
                />
                <Text style={[styles.stockInfoHomeButtonText, isDarkMode && styles.stockInfoHomeButtonTextDark]}>
                  홈페이지
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.stockInfoSourceText, isDarkMode && styles.stockInfoSourceTextDark]}>
              출처: 커뮤니티 집계 및 내부 더미 데이터
            </Text>

            <View style={[styles.stockInfoDescriptionCard, isDarkMode && styles.stockInfoDescriptionCardDark]}>
              <Text style={[styles.stockInfoDescriptionText, isDarkMode && styles.stockInfoDescriptionTextDark]}>
                {stockInfoDescription}
              </Text>
            </View>

            <View style={styles.stockInfoMenuList}>
              {STOCK_INFO_MENU_ITEMS.map((menu, index) => {
                const isActive = index === 0;
                return (
                  <Pressable
                    key={menu}
                    style={[
                      styles.stockInfoMenuItem,
                      isDarkMode && styles.stockInfoMenuItemDark,
                      isActive && styles.stockInfoMenuItemActive,
                      isActive && isDarkMode && styles.stockInfoMenuItemActiveDark
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockInfoMenuItemText,
                        isDarkMode && styles.stockInfoMenuItemTextDark,
                        isActive && styles.stockInfoMenuItemTextActive,
                        isActive && isDarkMode && styles.stockInfoMenuItemTextActiveDark
                      ]}
                    >
                      {menu}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.stockInfoFieldList}>
              {stockInfoFields.map((field, index) => (
                <View
                  key={field.label}
                  style={[
                    styles.stockInfoFieldRow,
                    index < stockInfoFields.length - 1 && styles.stockInfoFieldRowDivider,
                    index < stockInfoFields.length - 1 && isDarkMode && styles.stockInfoFieldRowDividerDark
                  ]}
                >
                  <Text style={[styles.stockInfoFieldLabel, isDarkMode && styles.stockInfoFieldLabelDark]}>
                    {field.label}
                  </Text>
                  <View style={styles.stockInfoFieldValueWrap}>
                    <Text style={[styles.stockInfoFieldValue, isDarkMode && styles.stockInfoFieldValueDark]}>
                      {field.value}
                    </Text>
                    {field.helper ? (
                      <Text style={[styles.stockInfoFieldHelper, isDarkMode && styles.stockInfoFieldHelperDark]}>
                        {field.helper}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  content: {
    paddingBottom: 16
  },
  contentDesktop: {
    paddingHorizontal: 10
  },
  contentMobile: {
    paddingHorizontal: 0
  },
  mainBodyRow: {
    width: '100%'
  },
  mainBodyRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stockInfoColumn: {
    flex: 1.65,
    marginTop: STOCK_INFO_TOP_OFFSET,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 12
  },
  stockInfoColumnDark: {
    borderColor: '#36363B',
    backgroundColor: '#212429'
  },
  stockInfoHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stockInfoIdentityWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  stockInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11
  },
  stockInfoIdentityTextWrap: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0
  },
  stockInfoName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a'
  },
  stockInfoNameDark: {
    color: '#f8fafc'
  },
  stockInfoMeta: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  stockInfoMetaDark: {
    color: '#cbd5e1'
  },
  stockInfoHomeButton: {
    height: 34,
    marginLeft: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  stockInfoHomeButtonDark: {
    borderColor: '#4b5563',
    backgroundColor: '#1f2732'
  },
  stockInfoHomeButtonIcon: {
    marginRight: 4
  },
  stockInfoHomeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  stockInfoHomeButtonTextDark: {
    color: '#e2e8f0'
  },
  stockInfoSourceText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b'
  },
  stockInfoSourceTextDark: {
    color: '#94a3b8'
  },
  stockInfoDescriptionCard: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  stockInfoDescriptionCardDark: {
    backgroundColor: '#1f2732'
  },
  stockInfoDescriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155'
  },
  stockInfoDescriptionTextDark: {
    color: '#d1d5db'
  },
  stockInfoMenuList: {
    marginTop: 12
  },
  stockInfoMenuItem: {
    minHeight: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  stockInfoMenuItemDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  stockInfoMenuItemActive: {
    borderColor: '#d1d5db',
    backgroundColor: '#f1f5f9'
  },
  stockInfoMenuItemActiveDark: {
    borderColor: '#4b5563',
    backgroundColor: '#2a313d'
  },
  stockInfoMenuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569'
  },
  stockInfoMenuItemTextDark: {
    color: '#cbd5e1'
  },
  stockInfoMenuItemTextActive: {
    color: '#0f172a'
  },
  stockInfoMenuItemTextActiveDark: {
    color: '#f8fafc'
  },
  stockInfoFieldList: {
    marginTop: 12
  },
  stockInfoFieldRow: {
    minHeight: 62,
    paddingVertical: 9
  },
  stockInfoFieldRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  stockInfoFieldRowDividerDark: {
    borderBottomColor: '#36363B'
  },
  stockInfoFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569'
  },
  stockInfoFieldLabelDark: {
    color: '#cbd5e1'
  },
  stockInfoFieldValueWrap: {
    marginTop: 4
  },
  stockInfoFieldValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a'
  },
  stockInfoFieldValueDark: {
    color: '#f8fafc'
  },
  stockInfoFieldHelper: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8'
  },
  stockInfoFieldHelperDark: {
    color: '#94a3b8'
  }
});
