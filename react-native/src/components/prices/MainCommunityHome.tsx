import React from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import {
  type SectorBoardItem,
  createInitialSectorBoardItems,
  sortSectorBoardItemsByPopularity
} from '../../constants/sectorBoards';
import { getStockIconUri } from '../../constants/stockIcons';
import { MAIN_HERO_ITEMS } from './mainCommunityData';
import CommunityContentList from './community-feed/CommunityContentList';
import { useCommunityFeed } from './community-feed/useCommunityFeed';
import FollowToggleButton from './common/FollowToggleButton';

type MainCommunityHomeProps = {
  isDarkMode: boolean;
  isMobileWeb?: boolean;
};

const HERO_SCROLL_EDGE_THRESHOLD = 10;
const SECTOR_ADD_MENU_WIDTH = 300;
const SECTOR_ADD_MENU_HEIGHT = 174;
const SECTOR_ADD_MENU_OFFSET_Y = 6;
const FEED_MENU_SCREEN_PADDING = 10;
const SECTOR_BOARD_MIN_WIDTH = 1000;
const DEFAULT_NEW_SECTOR_POPULARITY = 120;
const MEDIA_CORNER_RADIUS = 20;

export default function MainCommunityHome({ isDarkMode, isMobileWeb = false }: MainCommunityHomeProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const heroItems = React.useMemo(() => MAIN_HERO_ITEMS.slice(0, 6), []);
  const heroScrollRef = React.useRef<ScrollView | null>(null);
  const heroOffsetXRef = React.useRef(0);
  const [heroViewportWidth, setHeroViewportWidth] = React.useState(0);
  const [heroContentWidth, setHeroContentWidth] = React.useState(0);
  const [showLeftHeroButton, setShowLeftHeroButton] = React.useState(false);
  const [showRightHeroButton, setShowRightHeroButton] = React.useState(false);
  const [sectorBoardItems, setSectorBoardItems] = React.useState<SectorBoardItem[]>(
    () => createInitialSectorBoardItems()
  );
  const [newSectorName, setNewSectorName] = React.useState('');
  const [newSectorDescription, setNewSectorDescription] = React.useState('');
  const [sectorAddMenuAnchor, setSectorAddMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const [joinedSectorMap, setJoinedSectorMap] = React.useState<Record<string, boolean>>({});
  const leftHeroButtonOpacity = React.useRef(new Animated.Value(0)).current;
  const rightHeroButtonOpacity = React.useRef(new Animated.Value(0)).current;

  const showSidePanel = !isMobileWeb && screenWidth >= SECTOR_BOARD_MIN_WIDTH;
  const feedController = useCommunityFeed({ screenWidth, screenHeight });
  const sortedSectorBoardItems = React.useMemo(
    () => sortSectorBoardItemsByPopularity(sectorBoardItems),
    [sectorBoardItems]
  );

  const heroTextGradientWebStyle = React.useMemo(
    () =>
      Platform.OS === 'web'
        ? ({
            backgroundColor: 'transparent',
            backgroundImage: isDarkMode
              ? 'linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.52) 48%, rgba(2,6,23,0.92) 100%)'
              : 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.48) 48%, rgba(15,23,42,0.86) 100%)'
          } as any)
        : null,
    [isDarkMode]
  );
  const heroNavBlurWebStyle = React.useMemo(
    () =>
      Platform.OS === 'web'
        ? ({
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)'
          } as any)
        : null,
    []
  );

  const syncHeroButtons = React.useCallback(
    (offsetX: number, viewportWidth: number, contentWidth: number) => {
      if (viewportWidth <= 0 || contentWidth <= viewportWidth + 1) {
        setShowLeftHeroButton(false);
        setShowRightHeroButton(false);
        return;
      }

      const maxOffset = Math.max(0, contentWidth - viewportWidth);
      const shouldShowLeft = offsetX > HERO_SCROLL_EDGE_THRESHOLD;
      const shouldShowRight = offsetX < maxOffset - HERO_SCROLL_EDGE_THRESHOLD;

      setShowLeftHeroButton((prev) => (prev === shouldShowLeft ? prev : shouldShowLeft));
      setShowRightHeroButton((prev) => (prev === shouldShowRight ? prev : shouldShowRight));
    },
    []
  );

  const onHeroHorizontalScroll = React.useCallback(
    (event: any) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const nextOffsetX = Math.max(0, contentOffset.x);
      heroOffsetXRef.current = nextOffsetX;
      syncHeroButtons(nextOffsetX, layoutMeasurement.width, contentSize.width);
    },
    [syncHeroButtons]
  );

  const scrollHeroByDirection = React.useCallback(
    (direction: 'left' | 'right') => {
      const scrollNode = heroScrollRef.current;
      if (!scrollNode) return;

      const maxOffset = Math.max(0, heroContentWidth - heroViewportWidth);
      if (maxOffset <= 0) return;

      const step = Math.max(280, Math.min(520, heroViewportWidth * 1.05));
      const delta = direction === 'left' ? -step : step;
      const nextOffset = Math.max(0, Math.min(maxOffset, heroOffsetXRef.current + delta));

      heroOffsetXRef.current = nextOffset;
      syncHeroButtons(nextOffset, heroViewportWidth, heroContentWidth);
      scrollNode.scrollTo({ x: nextOffset, animated: true });
    },
    [heroContentWidth, heroViewportWidth, syncHeroButtons]
  );

  React.useEffect(() => {
    syncHeroButtons(heroOffsetXRef.current, heroViewportWidth, heroContentWidth);
  }, [heroContentWidth, heroViewportWidth, syncHeroButtons]);
  React.useEffect(() => {
    Animated.timing(leftHeroButtonOpacity, {
      toValue: showLeftHeroButton ? 1 : 0,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [leftHeroButtonOpacity, showLeftHeroButton]);
  React.useEffect(() => {
    Animated.timing(rightHeroButtonOpacity, {
      toValue: showRightHeroButton ? 1 : 0,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [rightHeroButtonOpacity, showRightHeroButton]);

  const openSectorAddMenu = React.useCallback((event: any) => {
    const rawX = event?.nativeEvent?.pageX ?? event?.nativeEvent?.locationX ?? FEED_MENU_SCREEN_PADDING;
    const rawY = event?.nativeEvent?.pageY ?? event?.nativeEvent?.locationY ?? FEED_MENU_SCREEN_PADDING;

    setSectorAddMenuAnchor({
      x: rawX,
      y: rawY
    });
  }, []);

  const closeSectorAddMenu = React.useCallback(() => {
    setSectorAddMenuAnchor(null);
  }, []);

  const sectorAddMenuPosition = React.useMemo(() => {
    if (!sectorAddMenuAnchor) return null;

    const left = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenWidth - SECTOR_ADD_MENU_WIDTH - FEED_MENU_SCREEN_PADDING,
        sectorAddMenuAnchor.x - SECTOR_ADD_MENU_WIDTH + 28
      )
    );
    const top = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenHeight - SECTOR_ADD_MENU_HEIGHT - FEED_MENU_SCREEN_PADDING,
        sectorAddMenuAnchor.y + SECTOR_ADD_MENU_OFFSET_Y
      )
    );

    return { left, top };
  }, [screenHeight, screenWidth, sectorAddMenuAnchor]);

  const onAddSectorItem = React.useCallback(() => {
    const trimmedName = newSectorName.trim();
    const trimmedDescription = newSectorDescription.trim();
    if (!trimmedName) return;

    setSectorBoardItems((prev) => [
      ...prev,
      {
        id: `user-sector-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmedName,
        industries: trimmedDescription || '사용자 추가 섹터',
        description: '사용자가 추가한 신규 섹터 게시판',
        popularity: DEFAULT_NEW_SECTOR_POPULARITY
      }
    ]);
    setNewSectorName('');
    setNewSectorDescription('');
    closeSectorAddMenu();
  }, [closeSectorAddMenu, newSectorDescription, newSectorName]);

  const onPressSectorJoin = React.useCallback((sectorId: string) => {
    setJoinedSectorMap((prev) => ({
      ...prev,
      [sectorId]: !prev[sectorId]
    }));
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isMobileWeb ? styles.contentMobile : styles.contentDesktop]}
      showsVerticalScrollIndicator
      scrollEventThrottle={16}
      onScroll={feedController.handleScroll}
    >
      <View style={styles.heroScrollWrap}>
        <ScrollView
          ref={heroScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.heroScrollContent,
            isMobileWeb ? styles.heroScrollContentMobile : styles.heroScrollContentDesktop
          ]}
          scrollEventThrottle={16}
          onScroll={onHeroHorizontalScroll}
          onLayout={(event) => {
            const viewportWidth = event.nativeEvent.layout.width;
            setHeroViewportWidth(viewportWidth);
            syncHeroButtons(heroOffsetXRef.current, viewportWidth, heroContentWidth);
          }}
          onContentSizeChange={(contentWidthValue) => {
            setHeroContentWidth(contentWidthValue);
            syncHeroButtons(heroOffsetXRef.current, heroViewportWidth, contentWidthValue);
          }}
        >
          {heroItems.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.heroImageCard,
                isDarkMode && styles.heroImageCardDark,
                isMobileWeb ? styles.heroImageCardMobile : styles.heroImageCardDesktop
              ]}
              onPress={() => router.push({ pathname: '/communities/detail', params: { symbol: item.symbol } })}
            >
              <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
              <View style={[styles.heroTextLayer, isDarkMode && styles.heroTextLayerDark, heroTextGradientWebStyle]}>
                <Text style={[styles.heroImageTitle, isDarkMode && styles.heroImageTitleDark]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.heroImageDescription, isDarkMode && styles.heroImageDescriptionDark]}
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroSymbolInfoWrap}>
                    <Image source={{ uri: getStockIconUri(item.symbol) }} style={styles.heroSymbolIcon} />
                    <Text
                      style={[styles.heroSymbolInfoText, isDarkMode && styles.heroSymbolInfoTextDark]}
                      numberOfLines={1}
                    >
                      {item.symbolInfo}
                    </Text>
                  </View>
                  <View style={styles.heroMoreWrap}>
                    <Text style={[styles.heroMoreText, isDarkMode && styles.heroMoreTextDark]}>더보기</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color={isDarkMode ? '#e2e8f0' : '#f8fafc'}
                      style={styles.heroMoreIcon}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <Animated.View
          pointerEvents={showLeftHeroButton ? 'auto' : 'none'}
          style={[styles.heroNavWrap, styles.heroNavWrapLeft, { opacity: leftHeroButtonOpacity }]}
        >
          <Pressable style={[styles.heroNavButton, isDarkMode && styles.heroNavButtonDark, heroNavBlurWebStyle]} onPress={() => scrollHeroByDirection('left')}>
            <Ionicons name="chevron-back" size={16} color={isDarkMode ? '#f8fafc' : '#0f172a'} />
          </Pressable>
        </Animated.View>
        <Animated.View
          pointerEvents={showRightHeroButton ? 'auto' : 'none'}
          style={[styles.heroNavWrap, styles.heroNavWrapRight, { opacity: rightHeroButtonOpacity }]}
        >
          <Pressable style={[styles.heroNavButton, isDarkMode && styles.heroNavButtonDark, heroNavBlurWebStyle]} onPress={() => scrollHeroByDirection('right')}>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#f8fafc' : '#0f172a'} />
          </Pressable>
        </Animated.View>
      </View>

      <View style={[styles.mainBodyRow, showSidePanel && styles.mainBodyRowWide]}>
        <CommunityContentList isDarkMode={isDarkMode} showSidePanel={showSidePanel} feedController={feedController} />

        {showSidePanel && (
          <View style={[styles.sectorBoardColumn, isDarkMode && styles.sectorBoardColumnDark]}>
            <View style={[styles.sectorBoardHeader, isDarkMode && styles.sectorBoardHeaderDark]}>
              <Text style={[styles.sectorBoardTitle, isDarkMode && styles.sectorBoardTitleDark]}>섹터 게시판</Text>
              <Pressable
                style={[styles.sectorAddMiniButton, isDarkMode && styles.sectorAddMiniButtonDark]}
                onPress={openSectorAddMenu}
              >
                <MaterialCommunityIcons name="plus" size={16} color={isDarkMode ? '#e2e8f0' : '#0f172a'} />
              </Pressable>
            </View>

            <View style={styles.sectorList}>
              {sortedSectorBoardItems.map((sector, index) => (
                <View key={sector.id} style={styles.sectorItemWrap}>
                  <Pressable
                    style={[styles.sectorItem, isDarkMode && styles.sectorItemDark]}
                    onPress={() =>
                      router.push({
                        pathname: '/communities',
                        params: { sector: sector.id, sectorName: sector.name }
                      } as any)
                    }
                  >
                    <View style={styles.sectorItemTopRow}>
                      <Text style={[styles.sectorName, isDarkMode && styles.sectorNameDark]} numberOfLines={1}>
                        {index + 1}. {sector.name}
                      </Text>
                      {(() => {
                        const isJoined = !!joinedSectorMap[sector.id];
                        return (
                          <FollowToggleButton
                            isDarkMode={isDarkMode}
                            isFollowing={isJoined}
                            boardName={sector.name}
                            onToggle={() => onPressSectorJoin(sector.id)}
                          />
                        );
                      })()}
                    </View>
                    <Text style={[styles.sectorIndustries, isDarkMode && styles.sectorIndustriesDark]} numberOfLines={1}>
                      {sector.industries}
                    </Text>
                    <Text style={[styles.sectorDescription, isDarkMode && styles.sectorDescriptionDark]}>
                      {sector.description}
                    </Text>
                  </Pressable>
                  {index < sortedSectorBoardItems.length - 1 && (
                    <View style={[styles.sectorSeparator, isDarkMode && styles.sectorSeparatorDark]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={!!sectorAddMenuAnchor && !!sectorAddMenuPosition}
        transparent
        animationType="fade"
        onRequestClose={closeSectorAddMenu}
      >
        <Pressable style={styles.feedMenuBackdrop} onPress={closeSectorAddMenu}>
          {sectorAddMenuPosition ? (
            <View
              style={[
                styles.sectorAddMenuSheet,
                isDarkMode && styles.sectorAddMenuSheetDark,
                {
                  left: sectorAddMenuPosition.left,
                  top: sectorAddMenuPosition.top
                }
              ]}
            >
              <TextInput
                style={[styles.sectorInput, isDarkMode && styles.sectorInputDark]}
                placeholder="섹터명 추가"
                placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
                value={newSectorName}
                onChangeText={setNewSectorName}
              />
              <TextInput
                style={[styles.sectorInput, isDarkMode && styles.sectorInputDark]}
                placeholder="업종 또는 설명"
                placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
                value={newSectorDescription}
                onChangeText={setNewSectorDescription}
              />
              <Pressable
                style={[styles.sectorAddMenuSaveButton, isDarkMode && styles.sectorAddMenuSaveButtonDark]}
                onPress={onAddSectorItem}
              >
                <Text style={styles.sectorAddMenuSaveButtonText}>저장</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Modal>
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
  heroScrollWrap: {
    position: 'relative'
  },
  heroScrollContent: {
    paddingTop: 14,
    paddingBottom: 14
  },
  heroScrollContentDesktop: {
    paddingHorizontal: 10
  },
  heroScrollContentMobile: {
    paddingHorizontal: 12
  },
  heroNavWrap: {
    position: 'absolute',
    top: 105,
    marginTop: -18
  },
  heroNavWrapLeft: {
    left: 8
  },
  heroNavWrapRight: {
    right: 8
  },
  heroNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.64)'
  },
  heroNavButtonDark: {
    backgroundColor: 'rgba(15,23,42,0.46)',
    borderColor: 'rgba(148,163,184,0.48)'
  },
  heroImageCard: {
    width: 280,
    height: 210,
    borderRadius: MEDIA_CORNER_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9dee7',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a22'
  },
  heroImageCardDesktop: {
    marginRight: 12
  },
  heroImageCardMobile: {
    marginRight: 10
  },
  heroImageCardDark: {
    borderColor: '#4b5563',
    backgroundColor: '#02061766'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroTextLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 116,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(15,23,42,0.54)'
  },
  heroTextLayerDark: {
    backgroundColor: 'rgba(2,6,23,0.60)'
  },
  heroImageTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc'
  },
  heroImageTitleDark: {
    color: '#f8fafc'
  },
  heroImageDescription: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#dbeafe'
  },
  heroImageDescriptionDark: {
    color: '#dbeafe'
  },
  heroMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heroSymbolInfoWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroSymbolIcon: {
    width: 18,
    height: 18,
    borderRadius: 5
  },
  heroSymbolInfoText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc'
  },
  heroSymbolInfoTextDark: {
    color: '#f8fafc'
  },
  heroMoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  heroMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc'
  },
  heroMoreTextDark: {
    color: '#f8fafc'
  },
  heroMoreIcon: {
    marginLeft: 2
  },
  mainBodyRow: {
    width: '100%'
  },
  mainBodyRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  sectorBoardColumn: {
    flex: 1.65,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 12
  },
  sectorBoardColumnDark: {
    borderColor: '#36363B',
    backgroundColor: '#212429'
  },
  sectorBoardHeader: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectorBoardHeaderDark: {
    borderBottomColor: '#36363B'
  },
  sectorBoardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectorBoardTitleDark: {
    color: '#f8fafc'
  },
  sectorAddMiniButton: {
    width: 28,
    height: 28,
    marginLeft: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectorAddMiniButtonDark: {
    borderColor: '#36363B',
    backgroundColor: '#27303a'
  },
  sectorList: {
    paddingTop: 2
  },
  sectorItemWrap: {
    marginBottom: 0
  },
  sectorItem: {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 9
  },
  sectorItemDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  sectorSeparator: {
    height: 1,
    marginHorizontal: 8,
    backgroundColor: '#e2e8f0'
  },
  sectorSeparatorDark: {
    backgroundColor: '#36363B'
  },
  sectorItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectorName: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectorNameDark: {
    color: '#f8fafc'
  },
  sectorIndustries: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  sectorIndustriesDark: {
    color: '#cbd5e1'
  },
  sectorDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748b'
  },
  sectorDescriptionDark: {
    color: '#94a3b8'
  },
  feedMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  sectorAddMenuSheet: {
    position: 'absolute',
    width: SECTOR_ADD_MENU_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10
  },
  sectorAddMenuSheetDark: {
    borderColor: '#36363B',
    backgroundColor: '#212429'
  },
  sectorInput: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 10,
    marginBottom: 8
  },
  sectorInputDark: {
    borderColor: '#4b5563',
    backgroundColor: '#27303a',
    color: '#f8fafc'
  },
  sectorAddMenuSaveButton: {
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a'
  },
  sectorAddMenuSaveButtonDark: {
    backgroundColor: '#334155'
  },
  sectorAddMenuSaveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  }
});
