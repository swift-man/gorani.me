import React from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  ActivityIndicator,
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
import { getStockIconUri } from '../../constants/stockIcons';

type MainCommunityHomeProps = {
  isDarkMode: boolean;
  isMobileWeb?: boolean;
};

type MainHeroItem = {
  id: string;
  image: any;
  title: string;
  description: string;
  symbol: string;
  symbolInfo: string;
};

type FeedCardItem = {
  id: string;
  symbol: string;
  stockName: string;
  timeAgo: string;
  title: string;
  description: string;
  previewImage?: any;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
};

type FeedMenuActionKey = 'alarm' | 'save' | 'hide' | 'report';

type FeedMenuAction = {
  key: FeedMenuActionKey;
  label: string;
  iconOn: string;
  iconOff: string;
};

type FeedMenuState = {
  alarm: boolean;
  save: boolean;
  hide: boolean;
  report: boolean;
};

type SectorBoardItem = {
  id: string;
  name: string;
  industries: string;
  description: string;
  popularity: number;
};

const MAIN_HERO_ITEMS: MainHeroItem[] = [
  {
    id: 'main-1',
    image: require('../../assets/main_dummy/997C533D5E11034A27.png'),
    title: '신규 상장 코인 변동성 확대',
    description: '상장 첫날 거래량 급증 구간 분석',
    symbol: 'KRW-COIN1',
    symbolInfo: '코인 1'
  },
  {
    id: 'main-2',
    image: require('../../assets/main_dummy/IMG_0252.jpg'),
    title: '기관 매수세 유입 종목 체크',
    description: '거래대금 상위권 종목 흐름 요약',
    symbol: 'KRW-COIN2',
    symbolInfo: '코인 2'
  },
  {
    id: 'main-3',
    image: require('../../assets/main_dummy/IMG_0318.jpg'),
    title: '실시간 뉴스 반영 종목 모음',
    description: '공시 이후 급등락 후보군 정리',
    symbol: 'KRW-COIN3',
    symbolInfo: '코인 3'
  },
  {
    id: 'main-4',
    image: require('../../assets/main_dummy/IMG_7788.jpg'),
    title: 'AI 예측 점수 상위 전략',
    description: '단기 추세 전환 구간 후보 확인',
    symbol: 'KRW-COIN4',
    symbolInfo: '코인 4'
  },
  {
    id: 'main-5',
    image: require('../../assets/main_dummy/allin.png'),
    title: '커뮤니티 인기 토론 실시간',
    description: '참여자 반응 높은 이슈 스냅샷',
    symbol: 'KRW-COIN5',
    symbolInfo: '코인 5'
  },
  {
    id: 'main-6',
    image: require('../../assets/main_dummy/zzz.jpg'),
    title: '지표 기반 관심 종목 브리핑',
    description: '수급 변화 포인트 빠르게 확인',
    symbol: 'KRW-COIN6',
    symbolInfo: '코인 6'
  }
];

const MAIN_FEED_ITEMS: FeedCardItem[] = [
  {
    id: 'feed-1',
    symbol: 'KRW-COIN1',
    stockName: '코인 1',
    timeAgo: '4시간 전',
    title: '거래량이 유의미하게 붙는 구간 진입',
    description:
      '지금 구간은 체결 강도보다 거래대금 회복 속도를 보는 게 중요해요. 분봉 기준으로 고점 갱신 실패가 나오면 짧게 정리하고, 재돌파가 나오면 다시 비중을 늘리는 방식이 좋아 보입니다.',
    previewImage: require('../../assets/main_dummy/IMG_0318.jpg'),
    likes: 228,
    dislikes: 18,
    comments: 46,
    shares: 12
  },
  {
    id: 'feed-2',
    symbol: 'KRW-COIN2',
    stockName: '코인 2',
    timeAgo: '4시간 전',
    title: '수급 역전 포인트 체크',
    description:
      '외국인 매도 강도가 둔화되는 타이밍에서 개인 추격이 줄어들면 반등 확률이 높아집니다. 오늘은 눌림에서의 반응을 먼저 확인하고 접근하는 게 좋아요.',
    likes: 174,
    dislikes: 9,
    comments: 31,
    shares: 8
  },
  {
    id: 'feed-3',
    symbol: 'KRW-COIN3',
    stockName: '코인 3',
    timeAgo: '4시간 전',
    title: '공시 이후 단기 변동성 대응 전략',
    description:
      '뉴스 모멘텀이 반영된 뒤에는 변동폭이 커져서 진입/청산 기준을 좁게 잡아야 합니다. 손절 라인을 먼저 정해두고, 방향 확인 이후 분할 진입하는 방식이 안전합니다.',
    previewImage: require('../../assets/main_dummy/allin.png'),
    likes: 312,
    dislikes: 23,
    comments: 59,
    shares: 17
  },
  {
    id: 'feed-4',
    symbol: 'KRW-COIN4',
    stockName: '코인 4',
    timeAgo: '4시간 전',
    title: '매집 구간 해석 의견 공유',
    description:
      '거래대금은 줄었지만 저점에서 물량 소화가 꾸준히 진행되는 형태입니다. 추세 전환 시그널이 확인될 때까지는 중립 비중을 유지하는 전략이 좋아 보입니다.',
    likes: 121,
    dislikes: 7,
    comments: 22,
    shares: 4
  }
];

const NEXT_PAGE_LOAD_DELAY_MS = 720;
const BOTTOM_LOAD_THRESHOLD = 140;
const HERO_SCROLL_EDGE_THRESHOLD = 10;
const FEED_MENU_WIDTH = 168;
const FEED_MENU_HEIGHT = 172;
const FEED_MENU_OFFSET_Y = 8;
const FEED_MENU_SCREEN_PADDING = 10;
const SECTOR_ADD_MENU_WIDTH = 300;
const SECTOR_ADD_MENU_HEIGHT = 174;
const SECTOR_ADD_MENU_OFFSET_Y = 6;
const SECTOR_BOARD_MIN_WIDTH = 1000;
const DEFAULT_NEW_SECTOR_POPULARITY = 120;

const FEED_MENU_ACTIONS: FeedMenuAction[] = [
  {
    key: 'alarm',
    label: '게시물 알림',
    iconOff: 'alarm-light-off',
    iconOn: 'alarm-light-on'
  },
  {
    key: 'save',
    label: '저장',
    iconOff: 'bookmark-outline',
    iconOn: 'bookmark'
  },
  {
    key: 'hide',
    label: '숨기기',
    iconOff: 'eye-off-outline',
    iconOn: 'eye-outline'
  },
  {
    key: 'report',
    label: '신고',
    iconOff: 'selection-remove',
    iconOn: 'selection-off'
  }
];

const DEFAULT_FEED_MENU_STATE: FeedMenuState = {
  alarm: false,
  save: false,
  hide: false,
  report: false
};

const INITIAL_SECTOR_BOARD_ITEMS: SectorBoardItem[] = [
  {
    id: 'sector-it',
    name: '정보기술 (IT)',
    industries: '반도체, 소프트웨어, 하드웨어',
    description: '성장성이 가장 높고 시장을 주도함',
    popularity: 960
  },
  {
    id: 'sector-healthcare',
    name: '헬스케어',
    industries: '제약, 바이오, 의료기기',
    description: '경기 변동에 강하며 임상 결과가 중요함',
    popularity: 820
  },
  {
    id: 'sector-financial',
    name: '금융',
    industries: '은행, 보험, 증권, 카드',
    description: '금리 변화에 매우 민감하게 반응함',
    popularity: 790
  },
  {
    id: 'sector-communication',
    name: '커뮤니케이션',
    industries: '포털, 게임, 통신, 엔터테인먼트',
    description: '플랫폼 기반 서비스와 미디어가 주축',
    popularity: 760
  },
  {
    id: 'sector-consumer-discretionary',
    name: '경기소비재',
    industries: '자동차, 의류, 호텔, 가전',
    description: '경기가 좋을 때 소비가 늘어나는 업종',
    popularity: 730
  },
  {
    id: 'sector-consumer-staples',
    name: '필수소비재',
    industries: '음식료, 유통(마트), 담배',
    description: '경기와 무관하게 꼭 써야 하는 물품',
    popularity: 690
  },
  {
    id: 'sector-energy',
    name: '에너지',
    industries: '석유, 가스, 에너지 장비',
    description: '유가와 국제 정세의 영향을 크게 받음',
    popularity: 660
  },
  {
    id: 'sector-materials',
    name: '소재',
    industries: '화학, 철강, 금속, 종이',
    description: '원자재 가격 변동이 수익의 핵심',
    popularity: 640
  },
  {
    id: 'sector-industrials',
    name: '산업재',
    industries: '조선, 기계, 건설, 항공',
    description: '대규모 수주와 인프라 투자가 중요함',
    popularity: 620
  },
  {
    id: 'sector-utilities',
    name: '유틸리티',
    industries: '전기, 수도, 가스',
    description: '안정적인 배당을 주지만 성장성은 낮음',
    popularity: 560
  },
  {
    id: 'sector-real-estate',
    name: '부동산',
    industries: '리츠(REITs), 부동산 개발',
    description: '금리 상승기에 비용 부담이 커짐',
    popularity: 520
  },
  {
    id: 'sector-semiconductor',
    name: '반도체/소부장',
    industries: '삼성전자, 하이닉스, 소재·부품·장비',
    description: '국장의 기둥, 대표 주주들의 집결지',
    popularity: 980
  },
  {
    id: 'sector-battery',
    name: '2차전지',
    industries: '배터리 셀, 소재, 장비',
    description: '가장 뜨거운 논쟁과 화력을 가진 섹터',
    popularity: 995
  },
  {
    id: 'sector-bio-ai',
    name: '바이오/K-헬스',
    industries: 'AI 의료, 제약, 디지털 헬스케어',
    description: '고위험 고수익 성격의 토론이 활발함',
    popularity: 910
  },
  {
    id: 'sector-renewable',
    name: '신재생에너지',
    industries: '풍력, 태양광, 수소',
    description: '정책 수혜주 중심으로 관심이 몰림',
    popularity: 780
  },
  {
    id: 'sector-content',
    name: '엔터/K-콘텐츠',
    industries: '엔터테인먼트, 플랫폼, 미디어',
    description: '팬덤과 투자가 결합된 독특한 섹터',
    popularity: 740
  },
  {
    id: 'sector-crypto',
    name: '가상자산/코인',
    industries: '비트코인, 이더리움, 알트코인',
    description: '코인 시장 전체 흐름과 매크로 이슈 중심',
    popularity: 935
  },
  {
    id: 'sector-bitcoin',
    name: '비트코인/디지털골드',
    industries: 'BTC 현물, ETF, 채굴 관련',
    description: '기관 수급과 거시 지표 반응이 빠른 핵심 코인',
    popularity: 905
  },
  {
    id: 'sector-ethereum',
    name: '이더리움/생태계',
    industries: 'ETH, L2, 디파이, 스테이킹',
    description: '업데이트와 생태계 성장성에 따라 변동성 확대',
    popularity: 890
  }
];

const createFeedPageItems = (pageNumber: number): FeedCardItem[] =>
  MAIN_FEED_ITEMS.map((item, index) => {
    const likesDelta = pageNumber * (14 + index * 3);
    const dislikesDelta = pageNumber * (index % 3);
    const commentsDelta = pageNumber * (6 + index * 2);
    const sharesDelta = pageNumber * (2 + (index % 2));
    const extraHours = pageNumber * 2;
    const timeAgo =
      pageNumber === 0
        ? item.timeAgo
        : `${Math.max(1, Number.parseInt(item.timeAgo, 10) + extraHours)}시간 전`;

    return {
      ...item,
      id: `${item.id}-p${pageNumber}`,
      timeAgo,
      likes: item.likes + likesDelta,
      dislikes: item.dislikes + dislikesDelta,
      comments: item.comments + commentsDelta,
      shares: item.shares + sharesDelta
    };
  });

export default function MainCommunityHome({ isDarkMode, isMobileWeb = false }: MainCommunityHomeProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const heroItems = React.useMemo(() => MAIN_HERO_ITEMS.slice(0, 6), []);
  const heroScrollRef = React.useRef<ScrollView | null>(null);
  const heroOffsetXRef = React.useRef(0);
  const [feedItems, setFeedItems] = React.useState<FeedCardItem[]>(() => createFeedPageItems(0));
  const [nextPage, setNextPage] = React.useState(1);
  const [isLoadingNextPage, setIsLoadingNextPage] = React.useState(false);
  const [heroViewportWidth, setHeroViewportWidth] = React.useState(0);
  const [heroContentWidth, setHeroContentWidth] = React.useState(0);
  const [showLeftHeroButton, setShowLeftHeroButton] = React.useState(false);
  const [showRightHeroButton, setShowRightHeroButton] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const [menuPostId, setMenuPostId] = React.useState<string | null>(null);
  const [postMenuStateMap, setPostMenuStateMap] = React.useState<Record<string, FeedMenuState>>({});
  const [sectorBoardItems, setSectorBoardItems] =
    React.useState<SectorBoardItem[]>(INITIAL_SECTOR_BOARD_ITEMS);
  const [newSectorName, setNewSectorName] = React.useState('');
  const [newSectorDescription, setNewSectorDescription] = React.useState('');
  const [sectorAddMenuAnchor, setSectorAddMenuAnchor] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const leftHeroButtonOpacity = React.useRef(new Animated.Value(0)).current;
  const rightHeroButtonOpacity = React.useRef(new Animated.Value(0)).current;
  const nextPageTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSectorBoard = !isMobileWeb && screenWidth >= SECTOR_BOARD_MIN_WIDTH;
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
  const closeFeedMenu = React.useCallback(() => {
    setMenuAnchor(null);
    setMenuPostId(null);
  }, []);
  const openFeedMenu = React.useCallback((postId: string, event: any) => {
    const rawX =
      event?.nativeEvent?.pageX ??
      event?.nativeEvent?.locationX ??
      FEED_MENU_SCREEN_PADDING;
    const rawY =
      event?.nativeEvent?.pageY ??
      event?.nativeEvent?.locationY ??
      FEED_MENU_SCREEN_PADDING;

    setMenuPostId(postId);
    setMenuAnchor({
      x: rawX,
      y: rawY
    });
  }, []);
  const feedMenuPosition = React.useMemo(() => {
    if (!menuAnchor) return null;

    const left = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenWidth - FEED_MENU_WIDTH - FEED_MENU_SCREEN_PADDING,
        menuAnchor.x - FEED_MENU_WIDTH + 26
      )
    );
    const top = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenHeight - FEED_MENU_HEIGHT - FEED_MENU_SCREEN_PADDING,
        menuAnchor.y + FEED_MENU_OFFSET_Y
      )
    );

    return { left, top };
  }, [menuAnchor, screenHeight, screenWidth]);
  const activeMenuState = React.useMemo(() => {
    if (!menuPostId) return DEFAULT_FEED_MENU_STATE;
    return postMenuStateMap[menuPostId] ?? DEFAULT_FEED_MENU_STATE;
  }, [menuPostId, postMenuStateMap]);
  const onPressFeedMenuAction = React.useCallback(
    (actionKey: FeedMenuActionKey) => {
      if (!menuPostId) return;

      setPostMenuStateMap((prev) => {
        const current = prev[menuPostId] ?? DEFAULT_FEED_MENU_STATE;
        return {
          ...prev,
          [menuPostId]: {
            ...current,
            [actionKey]: !current[actionKey]
          }
        };
      });
      closeFeedMenu();
    },
    [closeFeedMenu, menuPostId]
  );
  const sortedSectorBoardItems = React.useMemo(
    () =>
      [...sectorBoardItems].sort((a, b) => {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
        return a.name.localeCompare(b.name);
      }),
    [sectorBoardItems]
  );
  const openSectorAddMenu = React.useCallback((event: any) => {
    const rawX =
      event?.nativeEvent?.pageX ??
      event?.nativeEvent?.locationX ??
      FEED_MENU_SCREEN_PADDING;
    const rawY =
      event?.nativeEvent?.pageY ??
      event?.nativeEvent?.locationY ??
      FEED_MENU_SCREEN_PADDING;

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
  const onBoostSectorPopularity = React.useCallback((sectorId: string) => {
    setSectorBoardItems((prev) =>
      prev.map((item) =>
        item.id === sectorId ? { ...item, popularity: item.popularity + 1 } : item
      )
    );
  }, []);
  const loadNextPage = React.useCallback(() => {
    if (isLoadingNextPage) return;

    setIsLoadingNextPage(true);
    nextPageTimerRef.current = setTimeout(() => {
      setFeedItems((prev) => [...prev, ...createFeedPageItems(nextPage)]);
      setNextPage((prev) => prev + 1);
      setIsLoadingNextPage(false);
      nextPageTimerRef.current = null;
    }, NEXT_PAGE_LOAD_DELAY_MS);
  }, [isLoadingNextPage, nextPage]);

  React.useEffect(() => {
    return () => {
      if (nextPageTimerRef.current) {
        clearTimeout(nextPageTimerRef.current);
      }
    };
  }, []);
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

  const handleScroll = React.useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const reachedBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - BOTTOM_LOAD_THRESHOLD;

      if (reachedBottom) {
        loadNextPage();
      }
    },
    [loadNextPage]
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isMobileWeb ? styles.contentMobile : styles.contentDesktop]}
      showsVerticalScrollIndicator
      scrollEventThrottle={16}
      onScroll={handleScroll}
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
              <View
                style={[
                  styles.heroTextLayer,
                  isDarkMode && styles.heroTextLayerDark,
                  heroTextGradientWebStyle
                ]}
              >
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
          <Pressable
            style={[
              styles.heroNavButton,
              isDarkMode && styles.heroNavButtonDark,
              heroNavBlurWebStyle
            ]}
            onPress={() => scrollHeroByDirection('left')}
          >
            <Ionicons name="chevron-back" size={16} color={isDarkMode ? '#f8fafc' : '#0f172a'} />
          </Pressable>
        </Animated.View>
        <Animated.View
          pointerEvents={showRightHeroButton ? 'auto' : 'none'}
          style={[styles.heroNavWrap, styles.heroNavWrapRight, { opacity: rightHeroButtonOpacity }]}
        >
          <Pressable
            style={[
              styles.heroNavButton,
              isDarkMode && styles.heroNavButtonDark,
              heroNavBlurWebStyle
            ]}
            onPress={() => scrollHeroByDirection('right')}
          >
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#f8fafc' : '#0f172a'} />
          </Pressable>
        </Animated.View>
      </View>

      <View style={[styles.mainBodyRow, showSectorBoard && styles.mainBodyRowWide]}>
        <View style={[styles.feedColumn, showSectorBoard ? styles.feedColumnWide : styles.feedColumnSingle]}>
          <View style={styles.feedList}>
            {feedItems.map((item, index) => (
              <View key={item.id} style={styles.feedItemWrap}>
                <Pressable
                  style={[styles.feedCard, isDarkMode && styles.feedCardDark]}
                  onPress={() => router.push({ pathname: '/communities/detail', params: { symbol: item.symbol } })}
                >
                  <View style={styles.feedHeader}>
                    <View style={styles.feedHeaderLeft}>
                      <Image source={{ uri: getStockIconUri(item.symbol) }} style={styles.feedSymbolIcon} />
                      <Text style={[styles.feedMetaText, isDarkMode && styles.feedMetaTextDark]} numberOfLines={1}>
                        {item.stockName} • {item.timeAgo}
                      </Text>
                    </View>
                    <View style={styles.feedHeaderRight}>
                      <Pressable style={[styles.followButton, isDarkMode && styles.followButtonDark]}>
                        <Text style={[styles.followButtonText, isDarkMode && styles.followButtonTextDark]}>팔로우</Text>
                      </Pressable>
                      <Pressable style={styles.moreButton} onPress={(event) => openFeedMenu(item.id, event)}>
                        <MaterialIcons
                          name="more-horiz"
                          size={20}
                          color={isDarkMode ? '#d1d5db' : '#64748b'}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={[styles.feedTitle, isDarkMode && styles.feedTitleDark]} numberOfLines={1}>
                    {item.title}
                  </Text>

                  {item.previewImage ? (
                    <Image source={item.previewImage} style={styles.feedPreviewImage} resizeMode="cover" />
                  ) : null}

                  <Text style={[styles.feedDescription, isDarkMode && styles.feedDescriptionDark]} numberOfLines={6}>
                    {item.description}
                  </Text>

                  <View style={styles.feedActionsRow}>
                    <View style={[styles.feedVoteGroup, isDarkMode && styles.feedVoteGroupDark]}>
                      <Pressable style={styles.feedVoteLikeButton}>
                        <MaterialCommunityIcons
                          name="arrow-up-bold-outline"
                          size={16}
                          color={isDarkMode ? '#e2e8f0' : '#475569'}
                        />
                        <Text style={[styles.feedVoteLikeText, isDarkMode && styles.feedVoteLikeTextDark]}>
                          {item.likes}
                        </Text>
                      </Pressable>
                      <Pressable style={[styles.feedVoteDislikeButton, isDarkMode && styles.feedVoteDislikeButtonDark]}>
                        <MaterialCommunityIcons
                          name="arrow-down-bold-outline"
                          size={16}
                          color={isDarkMode ? '#e2e8f0' : '#475569'}
                        />
                      </Pressable>
                    </View>
                    <Pressable style={[styles.feedCommentButton, isDarkMode && styles.feedOutlineButtonDark]}>
                      <MaterialCommunityIcons
                        name="comment-text-outline"
                        size={16}
                        color={isDarkMode ? '#e2e8f0' : '#475569'}
                      />
                      <Text style={[styles.feedCommentCountText, isDarkMode && styles.feedCommentCountTextDark]}>
                        {item.comments}
                      </Text>
                    </Pressable>
                    <Pressable style={[styles.feedShareButton, isDarkMode && styles.feedOutlineButtonDark]}>
                      <MaterialIcons
                        name={'ios-share' as any}
                        size={16}
                        color={isDarkMode ? '#e2e8f0' : '#475569'}
                      />
                      <Text style={[styles.feedShareButtonText, isDarkMode && styles.feedShareButtonTextDark]}>
                        공유
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
                {index < feedItems.length - 1 && (
                  <View style={[styles.feedSeparator, isDarkMode && styles.feedSeparatorDark]} />
                )}
              </View>
            ))}
          </View>

          {isLoadingNextPage && (
            <View style={styles.bottomLoader}>
              <ActivityIndicator size="small" color={isDarkMode ? '#e2e8f0' : '#334155'} />
              <Text style={[styles.bottomLoaderText, isDarkMode && styles.bottomLoaderTextDark]}>
                다음 글 불러오는 중...
              </Text>
            </View>
          )}
        </View>

        {showSectorBoard && (
          <View style={[styles.sectorBoardColumn, isDarkMode && styles.sectorBoardColumnDark]}>
            <View style={[styles.sectorBoardHeader, isDarkMode && styles.sectorBoardHeaderDark]}>
              <Text style={[styles.sectorBoardTitle, isDarkMode && styles.sectorBoardTitleDark]}>섹터 게시판</Text>
              <View style={styles.sectorBoardHeaderRight}>
                <Text style={[styles.sectorBoardSubTitle, isDarkMode && styles.sectorBoardSubTitleDark]}>
                  인기순
                </Text>
                <Pressable
                  style={[styles.sectorAddMiniButton, isDarkMode && styles.sectorAddMiniButtonDark]}
                  onPress={openSectorAddMenu}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={isDarkMode ? '#e2e8f0' : '#0f172a'}
                  />
                </Pressable>
              </View>
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
                      <Pressable
                        style={[styles.sectorPopularityButton, isDarkMode && styles.sectorPopularityButtonDark]}
                        onPress={(event) => {
                          event.stopPropagation?.();
                          onBoostSectorPopularity(sector.id);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="arrow-up-bold"
                          size={12}
                          color={isDarkMode ? '#e2e8f0' : '#334155'}
                          style={styles.sectorPopularityIcon}
                        />
                        <Text style={[styles.sectorPopularityText, isDarkMode && styles.sectorPopularityTextDark]}>
                          {sector.popularity}
                        </Text>
                      </Pressable>
                    </View>
                    <Text
                      style={[styles.sectorIndustries, isDarkMode && styles.sectorIndustriesDark]}
                      numberOfLines={1}
                    >
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
        visible={!!menuAnchor && !!feedMenuPosition}
        transparent
        animationType="fade"
        onRequestClose={closeFeedMenu}
      >
        <Pressable style={styles.feedMenuBackdrop} onPress={closeFeedMenu}>
          {feedMenuPosition ? (
            <View
              style={[
                styles.feedMenuSheet,
                isDarkMode && styles.feedMenuSheetDark,
                {
                  left: feedMenuPosition.left,
                  top: feedMenuPosition.top
                }
              ]}
            >
              {FEED_MENU_ACTIONS.map((action, index) => {
                const isActive = activeMenuState[action.key];
                const iconName = isActive ? action.iconOn : action.iconOff;
                const isDanger = action.key === 'report';

                return (
                <Pressable
                  key={`${menuPostId ?? 'post'}-${action.key}`}
                  style={[
                    styles.feedMenuItem,
                    isDarkMode && styles.feedMenuItemDark,
                    index < FEED_MENU_ACTIONS.length - 1 && styles.feedMenuItemDivider,
                    index < FEED_MENU_ACTIONS.length - 1 && isDarkMode && styles.feedMenuItemDividerDark
                  ]}
                  onPress={() => onPressFeedMenuAction(action.key)}
                >
                  <View style={styles.feedMenuItemContent}>
                    <MaterialCommunityIcons
                      name={iconName as any}
                      size={18}
                      color={
                        isDanger ? '#ef4444' : isDarkMode ? '#e2e8f0' : '#334155'
                      }
                      style={styles.feedMenuItemIcon}
                    />
                    <Text
                      style={[
                        styles.feedMenuItemText,
                        isDarkMode && styles.feedMenuItemTextDark,
                        isDanger && styles.feedMenuItemDangerText
                      ]}
                    >
                      {action.label}
                    </Text>
                  </View>
                </Pressable>
                );
              })}
            </View>
          ) : null}
        </Pressable>
      </Modal>

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
    paddingHorizontal: 20
  },
  contentMobile: {
    paddingHorizontal: 0
  },
  heroScrollContent: {
    paddingBottom: 14
  },
  heroScrollContentDesktop: {
    paddingHorizontal: 0
  },
  heroScrollContentMobile: {
    paddingHorizontal: 12
  },
  heroScrollWrap: {
    position: 'relative'
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
    borderRadius: 16,
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
  feedColumn: {
    minWidth: 0
  },
  feedColumnWide: {
    flex: 3.35,
    marginRight: 16
  },
  feedColumnSingle: {
    flex: 1
  },
  feedList: {
    paddingTop: 4
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
  sectorBoardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectorBoardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectorBoardTitleDark: {
    color: '#f8fafc'
  },
  sectorBoardSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  sectorBoardSubTitleDark: {
    color: '#cbd5e1'
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
  sectorPopularityButton: {
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectorPopularityButtonDark: {
    borderColor: '#4b5563',
    backgroundColor: '#27303a'
  },
  sectorPopularityIcon: {
    marginRight: 3
  },
  sectorPopularityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  sectorPopularityTextDark: {
    color: '#e2e8f0'
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
  bottomLoader: {
    height: 48,
    marginTop: 2,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  bottomLoaderText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  bottomLoaderTextDark: {
    color: '#cbd5e1'
  },
  feedItemWrap: {
    marginBottom: 0
  },
  feedCard: {
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 0
  },
  feedCardDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  feedSeparator: {
    height: 1,
    marginHorizontal: 14,
    backgroundColor: '#e2e8f0'
  },
  feedSeparatorDark: {
    backgroundColor: '#36363B'
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  feedHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  feedSymbolIcon: {
    width: 22,
    height: 22,
    borderRadius: 7
  },
  feedMetaText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  feedMetaTextDark: {
    color: '#cbd5e1'
  },
  feedHeaderRight: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  followButton: {
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  followButtonDark: {
    borderColor: '#4b5563',
    backgroundColor: '#27303a'
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  followButtonTextDark: {
    color: '#e2e8f0'
  },
  moreButton: {
    width: 28,
    height: 28,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  feedTitleDark: {
    color: '#f8fafc'
  },
  feedPreviewImage: {
    width: '100%',
    height: 184,
    borderRadius: 12,
    marginTop: 10
  },
  feedDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#334155'
  },
  feedDescriptionDark: {
    color: '#d1d5db'
  },
  feedActionsRow: {
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  feedVoteGroup: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14
  },
  feedVoteGroupDark: {
    borderColor: '#4b5563'
  },
  feedVoteLikeButton: {
    height: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedVoteLikeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  feedVoteLikeTextDark: {
    color: '#e2e8f0'
  },
  feedVoteDislikeButton: {
    width: 34,
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedVoteDislikeButtonDark: {
    borderLeftColor: '#4b5563'
  },
  feedCommentButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 10
  },
  feedCommentCountText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  feedCommentCountTextDark: {
    color: '#d1d5db'
  },
  feedShareButton: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 12
  },
  feedOutlineButtonDark: {
    borderColor: '#4b5563'
  },
  feedShareButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  feedShareButtonTextDark: {
    color: '#d1d5db'
  },
  feedMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  feedMenuSheet: {
    position: 'absolute',
    width: FEED_MENU_WIDTH,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10
  },
  feedMenuSheetDark: {
    backgroundColor: '#212429',
    borderColor: '#36363B'
  },
  feedMenuItem: {
    minHeight: 43,
    paddingHorizontal: 14,
    justifyContent: 'center'
  },
  feedMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  feedMenuItemIcon: {
    marginRight: 10
  },
  feedMenuItemDark: {
    backgroundColor: '#212429'
  },
  feedMenuItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  feedMenuItemDividerDark: {
    borderBottomColor: '#36363B'
  },
  feedMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  feedMenuItemTextDark: {
    color: '#e2e8f0'
  },
  feedMenuItemDangerText: {
    color: '#ef4444'
  }
});
