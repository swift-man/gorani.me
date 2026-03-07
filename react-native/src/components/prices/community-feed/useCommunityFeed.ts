import React from 'react';
import { createFeedPageItems, type FeedCardItem } from '../mainCommunityData';

export type FeedMenuActionKey = 'alarm' | 'save' | 'hide' | 'report';

export type FeedMenuAction = {
  key: FeedMenuActionKey;
  label: string;
  iconOn: string;
  iconOff: string;
};

export type FeedMenuState = {
  alarm: boolean;
  save: boolean;
  hide: boolean;
  report: boolean;
};

export type SectorSortKey = 'best' | 'newest' | 'views';

export type SectorSortOption = {
  key: SectorSortKey;
  label: string;
};

export type MenuPosition = {
  left: number;
  top: number;
};

export type CommunityFeedController = {
  sortedFeedItems: FeedCardItem[];
  isLoadingNextPage: boolean;
  handleScroll: (event: any) => void;
  selectedSectorSortOption: SectorSortOption;
  sortOptions: SectorSortOption[];
  sortKey: SectorSortKey;
  isSortMenuVisible: boolean;
  sortMenuPosition: MenuPosition | null;
  openSortMenu: (event: any) => void;
  closeSortMenu: () => void;
  onSelectSort: (nextSortKey: SectorSortKey) => void;
  isFeedMenuVisible: boolean;
  feedMenuPosition: MenuPosition | null;
  activeFeedMenuState: FeedMenuState;
  feedMenuActions: FeedMenuAction[];
  openFeedMenu: (postId: string, event: any) => void;
  closeFeedMenu: () => void;
  onPressFeedMenuAction: (actionKey: FeedMenuActionKey) => void;
};

type UseCommunityFeedParams = {
  screenWidth: number;
  screenHeight: number;
};

const NEXT_PAGE_LOAD_DELAY_MS = 720;
const BOTTOM_LOAD_THRESHOLD = 140;
const FEED_MENU_OFFSET_Y = 8;
const FEED_MENU_SCREEN_PADDING = 10;
const SECTOR_SORT_MENU_OFFSET_Y = 6;

export const FEED_MENU_WIDTH = 168;
export const FEED_MENU_HEIGHT = 172;
export const SECTOR_SORT_MENU_WIDTH = 132;
export const SECTOR_SORT_MENU_HEIGHT = 146;

const DEFAULT_FEED_MENU_STATE: FeedMenuState = {
  alarm: false,
  save: false,
  hide: false,
  report: false
};

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

const SECTOR_SORT_OPTIONS: SectorSortOption[] = [
  { key: 'best', label: '베스트' },
  { key: 'newest', label: '신규' },
  { key: 'views', label: '조회수' }
];

export function useCommunityFeed({ screenWidth, screenHeight }: UseCommunityFeedParams): CommunityFeedController {
  const [feedItems, setFeedItems] = React.useState<FeedCardItem[]>(() => createFeedPageItems(0));
  const [nextPage, setNextPage] = React.useState(1);
  const [isLoadingNextPage, setIsLoadingNextPage] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const [menuPostId, setMenuPostId] = React.useState<string | null>(null);
  const [postMenuStateMap, setPostMenuStateMap] = React.useState<Record<string, FeedMenuState>>({});
  const [sectorSortKey, setSectorSortKey] = React.useState<SectorSortKey>('best');
  const [sectorSortMenuAnchor, setSectorSortMenuAnchor] = React.useState<{ x: number; y: number } | null>(
    null
  );
  const nextPageTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const sortedFeedItems = React.useMemo(() => {
    if (sectorSortKey === 'newest') {
      return [...feedItems].reverse();
    }

    if (sectorSortKey === 'views') {
      return [...feedItems].sort((a, b) => {
        const aViews = a.likes * 10 + a.comments * 16 + a.shares * 12;
        const bViews = b.likes * 10 + b.comments * 16 + b.shares * 12;
        if (bViews !== aViews) return bViews - aViews;
        return b.likes - a.likes;
      });
    }

    return [...feedItems].sort((a, b) => {
      const aBest = a.likes * 8 + a.comments * 10 + a.shares * 6;
      const bBest = b.likes * 8 + b.comments * 10 + b.shares * 6;
      if (bBest !== aBest) return bBest - aBest;
      return b.likes - a.likes;
    });
  }, [feedItems, sectorSortKey]);

  const selectedSectorSortOption = React.useMemo(
    () => SECTOR_SORT_OPTIONS.find((option) => option.key === sectorSortKey) ?? SECTOR_SORT_OPTIONS[0],
    [sectorSortKey]
  );

  const openSortMenu = React.useCallback((event: any) => {
    const rawX = event?.nativeEvent?.pageX ?? event?.nativeEvent?.locationX ?? FEED_MENU_SCREEN_PADDING;
    const rawY = event?.nativeEvent?.pageY ?? event?.nativeEvent?.locationY ?? FEED_MENU_SCREEN_PADDING;

    setSectorSortMenuAnchor({
      x: rawX,
      y: rawY
    });
  }, []);

  const closeSortMenu = React.useCallback(() => {
    setSectorSortMenuAnchor(null);
  }, []);

  const onSelectSort = React.useCallback((nextSortKey: SectorSortKey) => {
    setSectorSortKey(nextSortKey);
    setSectorSortMenuAnchor(null);
  }, []);

  const sortMenuPosition = React.useMemo(() => {
    if (!sectorSortMenuAnchor) return null;

    const left = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenWidth - SECTOR_SORT_MENU_WIDTH - FEED_MENU_SCREEN_PADDING,
        sectorSortMenuAnchor.x - SECTOR_SORT_MENU_WIDTH + 26
      )
    );
    const top = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(
        screenHeight - SECTOR_SORT_MENU_HEIGHT - FEED_MENU_SCREEN_PADDING,
        sectorSortMenuAnchor.y + SECTOR_SORT_MENU_OFFSET_Y
      )
    );

    return { left, top };
  }, [screenHeight, screenWidth, sectorSortMenuAnchor]);

  const closeFeedMenu = React.useCallback(() => {
    setMenuAnchor(null);
    setMenuPostId(null);
  }, []);

  const openFeedMenu = React.useCallback((postId: string, event: any) => {
    const rawX = event?.nativeEvent?.pageX ?? event?.nativeEvent?.locationX ?? FEED_MENU_SCREEN_PADDING;
    const rawY = event?.nativeEvent?.pageY ?? event?.nativeEvent?.locationY ?? FEED_MENU_SCREEN_PADDING;

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
      Math.min(screenWidth - FEED_MENU_WIDTH - FEED_MENU_SCREEN_PADDING, menuAnchor.x - FEED_MENU_WIDTH + 26)
    );
    const top = Math.max(
      FEED_MENU_SCREEN_PADDING,
      Math.min(screenHeight - FEED_MENU_HEIGHT - FEED_MENU_SCREEN_PADDING, menuAnchor.y + FEED_MENU_OFFSET_Y)
    );

    return { left, top };
  }, [menuAnchor, screenHeight, screenWidth]);

  const activeFeedMenuState = React.useMemo(() => {
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

  return {
    sortedFeedItems,
    isLoadingNextPage,
    handleScroll,
    selectedSectorSortOption,
    sortOptions: SECTOR_SORT_OPTIONS,
    sortKey: sectorSortKey,
    isSortMenuVisible: !!sectorSortMenuAnchor && !!sortMenuPosition,
    sortMenuPosition,
    openSortMenu,
    closeSortMenu,
    onSelectSort,
    isFeedMenuVisible: !!menuAnchor && !!feedMenuPosition,
    feedMenuPosition,
    activeFeedMenuState,
    feedMenuActions: FEED_MENU_ACTIONS,
    openFeedMenu,
    closeFeedMenu,
    onPressFeedMenuAction
  };
}
