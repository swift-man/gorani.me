import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { getStockIconUri } from '../../constants/stockIcons';
import CommunityPostDetailContent from './community-detail/CommunityPostDetailContent';
import CommunityContentList from './community-feed/CommunityContentList';
import { useCommunityFeed } from './community-feed/useCommunityFeed';
import FollowToggleButton from './common/FollowToggleButton';

type SymbolCommunityHomeProps = {
  isDarkMode: boolean;
  isMobileWeb?: boolean;
  selectedSymbol: string;
  selectedBoardKey: string;
  selectedBoardName: string;
  contentMode?: 'list' | 'detail';
};

type StockInfoField = {
  label: string;
  value: string;
  helper?: string;
};

type StockInfoMenuKey = 'overview' | 'financials' | 'earnings' | 'dividend' | 'peers' | 'analyst';
type CommunityRoleInfo = {
  subscribers: string;
  onlineUsers: string;
  owner: string | null;
  subManagers: string[];
};

const SECTOR_BOARD_MIN_WIDTH = 1000;
const STOCK_INFO_MENU_ITEMS: { key: StockInfoMenuKey; label: string }[] = [
  { key: 'overview', label: '주요 정보' },
  { key: 'financials', label: '재무' },
  { key: 'earnings', label: '실적' },
  { key: 'dividend', label: '배당' },
  { key: 'peers', label: '동종 업계 비교' },
  { key: 'analyst', label: '애널리스트 분석' }
];
const STOCK_INFO_SECTION_SUMMARY: Record<Exclude<StockInfoMenuKey, 'overview'>, string> = {
  financials: '매출, 영업이익, 부채비율 등 재무 지표를 분기 기준으로 비교합니다.',
  earnings: '최근 실적 발표와 가이던스 변화를 반영한 핵심 지표를 제공합니다.',
  dividend: '배당 성향, 배당 수익률, 최근 배당 정책 변화를 확인할 수 있습니다.',
  peers: '동종 섹터 내 주요 종목과 밸류에이션/수익성 지표를 비교합니다.',
  analyst: '증권사 리포트 요약과 목표주가 컨센서스를 기반으로 분석합니다.'
};
const STOCK_INFO_FOOTER_LINKS = ['Rules', 'Privacy Policy', 'User Agreement'];
const DEFAULT_EXPANDED_STOCK_INFO_MENU_MAP: Record<StockInfoMenuKey, boolean> = {
  overview: true,
  financials: false,
  earnings: false,
  dividend: false,
  peers: false,
  analyst: false
};
const SYMBOL_TOP_GAP = 6;
const STOCK_INFO_TOP_OFFSET = 0;
const STOCK_INFO_CONTENT_INSET = 12;

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

const createCommunityRoleInfo = (symbol?: string): CommunityRoleInfo => {
  const sequence = getSymbolSequence(symbol);
  const hasOwner = sequence % 3 !== 0;

  return {
    subscribers: `${Math.max(1, sequence)}M`,
    onlineUsers: `${30 + sequence * 2}K`,
    owner: hasOwner ? `고라니${sequence}` : null,
    subManagers: hasOwner ? [`부${sequence}`, `부${sequence + 1}`] : []
  };
};

export default function SymbolCommunityHome({
  isDarkMode,
  isMobileWeb = false,
  selectedSymbol,
  selectedBoardKey,
  selectedBoardName,
  contentMode = 'list'
}: SymbolCommunityHomeProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const showSidePanel = !isMobileWeb && screenWidth >= SECTOR_BOARD_MIN_WIDTH;
  const feedController = useCommunityFeed({ screenWidth, screenHeight });
  const isDetailMode = contentMode === 'detail';
  const stockDisplayName = React.useMemo(() => getStockDisplayName(selectedSymbol), [selectedSymbol]);
  const stockInfoFields = React.useMemo(() => createStockInfoFields(selectedSymbol), [selectedSymbol]);
  const communityRoleInfo = React.useMemo(
    () => createCommunityRoleInfo(selectedSymbol),
    [selectedSymbol]
  );
  const stockInfoDescription = React.useMemo(
    () =>
      `${stockDisplayName}는 커뮤니티 관심도가 높은 종목으로 최근 거래량과 뉴스 모멘텀이 동시에 유입되고 있습니다. 단기 변동성 구간에서는 분할 진입과 손절 기준을 함께 관리하는 전략이 유효합니다.`,
    [stockDisplayName]
  );
  const [hoveredMenuKey, setHoveredMenuKey] = React.useState<StockInfoMenuKey | null>(null);
  const [expandedMenuMap, setExpandedMenuMap] = React.useState<Record<StockInfoMenuKey, boolean>>(
    DEFAULT_EXPANDED_STOCK_INFO_MENU_MAP
  );
  const onPressFooterLink = React.useCallback(() => {
    void Linking.openURL('https://www.naver.com');
  }, []);
  const followBoardIconUri = selectedBoardKey.startsWith('symbol:')
    ? getStockIconUri(selectedSymbol)
    : undefined;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        isMobileWeb
          ? styles.contentMobile
          : showSidePanel
            ? styles.contentDesktopWithPanel
            : styles.contentDesktop
      ]}
      showsVerticalScrollIndicator
      scrollEventThrottle={16}
      onScroll={isDetailMode ? undefined : feedController.handleScroll}
    >
      <View style={[styles.mainBodyRow, showSidePanel && styles.mainBodyRowWide]}>
        {isDetailMode ? (
          <CommunityPostDetailContent
            isDarkMode={isDarkMode}
            showSidePanel={showSidePanel}
            selectedSymbol={selectedSymbol}
            topInset={SYMBOL_TOP_GAP}
          />
        ) : (
          <CommunityContentList
            isDarkMode={isDarkMode}
            showSidePanel={showSidePanel}
            feedController={feedController}
            topInset={SYMBOL_TOP_GAP}
            followBoardKey={selectedBoardKey}
            followBoardName={selectedBoardName}
            followBoardIconUri={followBoardIconUri}
            contentVariant="board"
          />
        )}

        {showSidePanel && (
          <View style={styles.stockInfoWrap}>
            <View style={[styles.stockInfoColumn, isDarkMode && styles.stockInfoColumnDark]}>
              <View style={[styles.stockInfoMainSurface, isDarkMode && styles.stockInfoMainSurfaceDark]}>
                <View style={styles.stockInfoColumnInner}>
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
                    <FollowToggleButton
                      isDarkMode={isDarkMode}
                      boardKey={selectedBoardKey}
                      boardName={selectedBoardName}
                      boardIconUri={followBoardIconUri}
                    />
                  </View>

                  <View style={[styles.stockInfoCommunityRoleBox, isDarkMode && styles.stockInfoCommunityRoleBoxDark]}>
                    <View
                      style={[
                        styles.stockInfoCommunitySection,
                        styles.stockInfoCommunitySectionLine,
                        isDarkMode && styles.stockInfoCommunitySectionLineDark
                      ]}
                    >
                      <View style={styles.stockInfoCommunityStatsRow}>
                        <Text
                          style={[
                            styles.stockInfoCommunityStatsText,
                            isDarkMode && styles.stockInfoCommunityStatsTextDark
                          ]}
                        >
                          구독자 {communityRoleInfo.subscribers}
                        </Text>
                        <Text
                          style={[
                            styles.stockInfoCommunityStatsText,
                            styles.stockInfoCommunityStatsTextRight,
                            isDarkMode && styles.stockInfoCommunityStatsTextDark
                          ]}
                        >
                          현재 접속 {communityRoleInfo.onlineUsers}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.stockInfoCommunitySection,
                        communityRoleInfo.subManagers.length > 0 && styles.stockInfoCommunitySectionLine,
                        communityRoleInfo.subManagers.length > 0 && isDarkMode && styles.stockInfoCommunitySectionLineDark
                      ]}
                    >
                      <Text style={[styles.stockInfoRoleLabel, isDarkMode && styles.stockInfoRoleLabelDark]}>
                        방장
                      </Text>
                      {communityRoleInfo.owner ? (
                        <Text style={[styles.stockInfoRoleValue, isDarkMode && styles.stockInfoRoleValueDark]}>
                          {communityRoleInfo.owner}
                        </Text>
                      ) : (
                        <Pressable
                          style={[styles.stockInfoOwnerApplyButton, isDarkMode && styles.stockInfoOwnerApplyButtonDark]}
                        >
                          <Text
                            style={[
                              styles.stockInfoOwnerApplyButtonText,
                              isDarkMode && styles.stockInfoOwnerApplyButtonTextDark
                            ]}
                          >
                            방장 신청하기
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {communityRoleInfo.subManagers.length > 0 && (
                      <View style={styles.stockInfoCommunitySection}>
                        <Text style={[styles.stockInfoRoleLabel, isDarkMode && styles.stockInfoRoleLabelDark]}>
                          부방장
                        </Text>
                        <View style={styles.stockInfoSubManagerList}>
                          {communityRoleInfo.subManagers.map((name) => (
                            <Text
                              key={name}
                              style={[styles.stockInfoRoleValue, isDarkMode && styles.stockInfoRoleValueDark]}
                            >
                              {name}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )}
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
                    {STOCK_INFO_MENU_ITEMS.map((menu) => {
                      const isExpanded = !!expandedMenuMap[menu.key];
                      const isHovered = hoveredMenuKey === menu.key;
                      return (
                        <View key={menu.key}>
                          <Pressable
                            style={[
                              styles.stockInfoMenuItem,
                              isDarkMode && styles.stockInfoMenuItemDark,
                              isExpanded && styles.stockInfoMenuItemActive,
                              isExpanded && isDarkMode && styles.stockInfoMenuItemActiveDark,
                              isHovered && styles.stockInfoMenuItemHover,
                              isHovered && isDarkMode && styles.stockInfoMenuItemHoverDark
                            ]}
                            onPress={() =>
                              setExpandedMenuMap((prev) => ({
                                ...prev,
                                [menu.key]: !prev[menu.key]
                              }))
                            }
                            onHoverIn={() => setHoveredMenuKey(menu.key)}
                            onHoverOut={() => setHoveredMenuKey((prev) => (prev === menu.key ? null : prev))}
                          >
                            <View style={styles.stockInfoMenuRow}>
                              <Text
                                style={[
                                  styles.stockInfoMenuItemText,
                                  isDarkMode && styles.stockInfoMenuItemTextDark,
                                  isExpanded && styles.stockInfoMenuItemTextActive,
                                  isExpanded && isDarkMode && styles.stockInfoMenuItemTextActiveDark
                                ]}
                              >
                                {menu.label}
                              </Text>
                              <MaterialCommunityIcons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={
                                  isExpanded
                                    ? isDarkMode
                                      ? '#f8fafc'
                                      : '#0f172a'
                                    : isDarkMode
                                      ? '#cbd5e1'
                                      : '#64748b'
                                }
                              />
                            </View>
                          </Pressable>

                          {isExpanded && (
                            <View style={[styles.stockInfoSectionBody, isDarkMode && styles.stockInfoSectionBodyDark]}>
                              {menu.key === 'overview' ? (
                                <View>
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

                                  <Pressable
                                    style={[
                                      styles.stockInfoHomeButton,
                                      styles.stockInfoHomeButtonInline,
                                      styles.stockInfoHomeButtonBelowFields,
                                      isDarkMode && styles.stockInfoHomeButtonDark
                                    ]}
                                  >
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
                              ) : (
                                <Text style={[styles.stockInfoSectionSummary, isDarkMode && styles.stockInfoSectionSummaryDark]}>
                                  {STOCK_INFO_SECTION_SUMMARY[menu.key]}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
              <View style={[styles.stockInfoFooterSurface, isDarkMode && styles.stockInfoFooterSurfaceDark]}>
                <View style={styles.stockInfoFooterWrap}>
                  <View style={styles.stockInfoFooterLinksRow}>
                    {STOCK_INFO_FOOTER_LINKS.map((label) => (
                        <Pressable key={label} style={styles.stockInfoFooterLinkItem} onPress={onPressFooterLink}>
                          <Text style={[styles.stockInfoFooterLinkText, isDarkMode && styles.stockInfoFooterLinkTextDark]}>
                            {label}
                          </Text>
                        </Pressable>
                    ))}
                  </View>
                  <Pressable onPress={onPressFooterLink}>
                    <Text style={[styles.stockInfoFooterCopyright, isDarkMode && styles.stockInfoFooterCopyrightDark]}>
                      © 2026. All rights reserved.
                    </Text>
                  </Pressable>
                </View>
              </View>
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
  contentDesktopWithPanel: {
    paddingLeft: 10,
    paddingRight: 0
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
  stockInfoWrap: {
    flex: 1.65,
    marginTop: STOCK_INFO_TOP_OFFSET,
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  stockInfoColumn: {
    flex: 1,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    overflow: 'hidden'
  },
  stockInfoMainSurface: {
    flex: 1,
    backgroundColor: '#F9FAFA'
  },
  stockInfoMainSurfaceDark: {
    backgroundColor: '#212429'
  },
  stockInfoColumnInner: {
    flex: 1,
    paddingTop: STOCK_INFO_CONTENT_INSET,
    paddingLeft: STOCK_INFO_CONTENT_INSET,
    paddingRight: STOCK_INFO_CONTENT_INSET,
    paddingBottom: STOCK_INFO_CONTENT_INSET
  },
  stockInfoColumnDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
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
  stockInfoHomeButtonInline: {
    marginLeft: 0,
    alignSelf: 'flex-start'
  },
  stockInfoHomeButtonBelowFields: {
    marginTop: 10
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
    marginTop: 10,
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
  stockInfoCommunityRoleBox: {
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    backgroundColor: 'transparent'
  },
  stockInfoCommunityRoleBoxDark: {
    backgroundColor: 'transparent'
  },
  stockInfoCommunitySection: {
    paddingVertical: 8
  },
  stockInfoCommunitySectionLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  stockInfoCommunitySectionLineDark: {
    borderBottomColor: '#36363B'
  },
  stockInfoCommunityStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stockInfoCommunityStatsText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  stockInfoCommunityStatsTextRight: {
    textAlign: 'right'
  },
  stockInfoCommunityStatsTextDark: {
    color: '#d1d5db'
  },
  stockInfoRoleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569'
  },
  stockInfoRoleLabelDark: {
    color: '#cbd5e1'
  },
  stockInfoRoleValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a'
  },
  stockInfoRoleValueDark: {
    color: '#f8fafc'
  },
  stockInfoSubManagerList: {
    marginTop: 3
  },
  stockInfoOwnerApplyButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#ffffff',
    justifyContent: 'center'
  },
  stockInfoOwnerApplyButtonDark: {
    borderColor: '#64748b',
    backgroundColor: '#111827'
  },
  stockInfoOwnerApplyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  stockInfoOwnerApplyButtonTextDark: {
    color: '#e2e8f0'
  },
  stockInfoMenuList: {
    marginTop: 12
  },
  stockInfoMenuItem: {
    minHeight: 38,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    marginHorizontal: -STOCK_INFO_CONTENT_INSET,
    paddingHorizontal: STOCK_INFO_CONTENT_INSET + 12,
    justifyContent: 'center'
  },
  stockInfoMenuRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stockInfoMenuItemDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  stockInfoMenuItemHover: {
    backgroundColor: '#E8EDF5'
  },
  stockInfoMenuItemHoverDark: {
    backgroundColor: '#2E3744'
  },
  stockInfoMenuItemActive: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  stockInfoMenuItemActiveDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  stockInfoMenuItemText: {
    fontSize: 13,
    fontWeight: '500',
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
  stockInfoSectionBody: {
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: '#F9FAFA'
  },
  stockInfoSectionBodyDark: {
    backgroundColor: '#212429'
  },
  stockInfoFieldList: {
    marginTop: 0
  },
  stockInfoFieldRow: {
    minHeight: 50,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  stockInfoFieldRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  stockInfoFieldRowDividerDark: {
    borderBottomColor: '#36363B'
  },
  stockInfoFieldLabel: {
    flex: 1,
    paddingRight: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155'
  },
  stockInfoFieldLabelDark: {
    color: '#cbd5e1'
  },
  stockInfoFieldValueWrap: {
    marginTop: 0,
    alignItems: 'flex-end'
  },
  stockInfoFieldValue: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'right'
  },
  stockInfoFieldValueDark: {
    color: '#cbd5e1'
  },
  stockInfoFieldHelper: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'right'
  },
  stockInfoFieldHelperDark: {
    color: '#cbd5e1'
  },
  stockInfoSectionSummary: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155'
  },
  stockInfoSectionSummaryDark: {
    color: '#cbd5e1'
  },
  stockInfoFooterSurface: {
    backgroundColor: '#ffffff',
    paddingHorizontal: STOCK_INFO_CONTENT_INSET,
    paddingBottom: STOCK_INFO_CONTENT_INSET
  },
  stockInfoFooterSurfaceDark: {
    backgroundColor: '#1a1f28'
  },
  stockInfoFooterWrap: {
    paddingTop: 32
  },
  stockInfoFooterLinksRow: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  stockInfoFooterLinkItem: {
    marginBottom: 5
  },
  stockInfoFooterLinkText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b'
  },
  stockInfoFooterLinkTextDark: {
    color: '#94a3b8'
  },
  stockInfoFooterCopyright: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b'
  },
  stockInfoFooterCopyrightDark: {
    color: '#94a3b8'
  }
});
