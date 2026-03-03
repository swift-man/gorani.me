import React from 'react';
import { useFonts } from 'expo-font';
import { router, usePathname } from 'expo-router';
import { Lucide } from '@react-native-vector-icons/lucide';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { getStockIconUri } from '../constants/stockIcons';
import {
  COLLAPSED_PANEL_WIDTH,
  DARK_BORDER_COLOR,
  LIGHT_SIDEBAR_BACKGROUND,
  LIGHT_SIDEBAR_BORDER,
  LIST_HORIZONTAL_MARGIN,
  MIN_PANEL_WIDTH,
  RESIZE_COLLAPSE_THRESHOLD,
  RESIZE_HANDLE_MARGIN_WIDTH,
  ROW_HEIGHT,
  ROW_SEPARATOR_HEIGHT,
  SCROLL_HINT_HEIGHT,
  SECTION_HEADER_HEIGHT,
  UNFOLD_HORIZONTAL_CODEPOINT,
  type QuoteItem,
  getLayoutMode,
  mockQuotes
} from './market-sidebar/config';
import SidebarQuoteRow from './market-sidebar/SidebarQuoteRow';
import SidebarSectionHeader from './market-sidebar/SidebarSectionHeader';
import { useWebTheme } from '../theme/WebThemeContext';

const AnimatedIcon = Animated.createAnimatedComponent(Lucide);

export default function MarketSidebar() {
  const { resolvedMode, colors, trendColors } = useWebTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isResizeHandleHover, setIsResizeHandleHover] = React.useState(false);
  const [fontsLoaded] = useFonts({
    Lucide: require('@react-native-vector-icons/lucide/fonts/Lucide.ttf')
  });
  const { width } = useWindowDimensions();
  const isDarkMode = resolvedMode === 'dark';
  const resizeCursor = React.useMemo(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined' || !fontsLoaded) {
      return 'ew-resize';
    }

    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return 'ew-resize';
    }

    const icon = String.fromCodePoint(UNFOLD_HORIZONTAL_CODEPOINT);
    const color = isDarkMode ? '#e2e8f0' : '#1e293b';
    ctx.clearRect(0, 0, 24, 24);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px "Lucide"';
    ctx.fillText(icon, 12, 12);

    return `url("${canvas.toDataURL('image/png')}") 12 12, ew-resize`;
  }, [fontsLoaded, isDarkMode]);

  const [expandedPanelWidth, setExpandedPanelWidth] = React.useState(
    Math.max(MIN_PANEL_WIDTH, Math.floor(width / 4))
  );
  const maxPanelWidth = Math.max(MIN_PANEL_WIDTH, Math.floor(width * 0.55));
  const expandedWidthRef = React.useRef(expandedPanelWidth);
  const collapsedRef = React.useRef(collapsed);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(expandedPanelWidth);
  const activePointerIdRef = React.useRef<number | null>(null);
  const [showBottomScrollHint, setShowBottomScrollHint] = React.useState(false);
  const [layoutMode, setLayoutMode] = React.useState(getLayoutMode(expandedPanelWidth));
  const listViewportHeightRef = React.useRef(0);
  const listContentHeightRef = React.useRef(0);
  const listOffsetYRef = React.useRef(0);

  const panelWidthAnim = React.useRef(new Animated.Value(expandedPanelWidth)).current;
  const titleOpacityAnim = React.useRef(new Animated.Value(1)).current;
  const iconProgressAnim = React.useRef(new Animated.Value(0)).current;
  const scrollHintWebStyle = React.useMemo(() => {
    if (Platform.OS !== 'web') return null;

    return isDarkMode
      ? ({
          backgroundColor: 'transparent',
          backgroundImage:
            'linear-gradient(180deg, rgba(26,28,33,0) 0%, rgba(26,28,33,0.92) 100%)'
        } as any)
      : ({
          backgroundColor: 'transparent',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 100%)'
        } as any);
  }, [isDarkMode]);

  const syncScrollHint = React.useCallback(() => {
    const viewportHeight = listViewportHeightRef.current;
    const contentHeight = listContentHeightRef.current;
    const offsetY = listOffsetYRef.current;

    if (viewportHeight <= 0 || contentHeight <= 0) {
      setShowBottomScrollHint(false);
      return;
    }

    const canScroll = contentHeight > viewportHeight + 2;
    const reachedBottom = offsetY + viewportHeight >= contentHeight - 2;
    setShowBottomScrollHint(canScroll && !reachedBottom);
  }, []);

  React.useEffect(() => {
    expandedWidthRef.current = expandedPanelWidth;
  }, [expandedPanelWidth]);

  React.useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

  React.useEffect(() => {
    setExpandedPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(prev, maxPanelWidth)));
  }, [maxPanelWidth]);

  React.useEffect(() => {
    if (collapsed) return;
    setLayoutMode(getLayoutMode(expandedPanelWidth));
  }, [collapsed, expandedPanelWidth]);

  React.useEffect(() => {
    if (collapsed) {
      setShowBottomScrollHint(false);
      return;
    }

    syncScrollHint();
  }, [collapsed, syncScrollHint]);

  React.useEffect(() => {
    if (isResizing) return;

    const targetWidth = collapsed ? COLLAPSED_PANEL_WIDTH : expandedPanelWidth;
    const targetCollapsed = collapsed ? 1 : 0;

    Animated.parallel([
      Animated.timing(panelWidthAnim, {
        toValue: targetWidth,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      }),
      Animated.timing(titleOpacityAnim, {
        toValue: collapsed ? 0 : 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false
      }),
      Animated.timing(iconProgressAnim, {
        toValue: targetCollapsed,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false
      })
    ]).start();
  }, [collapsed, expandedPanelWidth, iconProgressAnim, isResizing, panelWidthAnim, titleOpacityAnim]);

  const iconRotate = iconProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const resolveTargetPath = React.useCallback(() => {
    if (pathname.startsWith('/prediction')) return '/prediction';
    if (pathname.startsWith('/news')) return '/news';
    return '/prices';
  }, [pathname]);

  const onPressQuote = React.useCallback((rank: number, symbol: string) => {
    const targetPath = resolveTargetPath();
    const nextParams = { rank: String(rank), symbol } as const;
    const nextRoute = { pathname: targetPath, params: nextParams } as const;

    if (pathname === targetPath) {
      router.setParams(nextParams);
      return;
    }

    router.push(nextRoute);
  }, [pathname, resolveTargetPath]);

  const applyResizeWidth = React.useCallback((clientX: number) => {
    const deltaX = clientX - resizeStartXRef.current;
    const rawWidth = resizeStartWidthRef.current + deltaX;

    if (rawWidth <= RESIZE_COLLAPSE_THRESHOLD) {
      if (!collapsedRef.current) {
        collapsedRef.current = true;
        setCollapsed(true);
      }
      panelWidthAnim.setValue(COLLAPSED_PANEL_WIDTH);
      titleOpacityAnim.setValue(0);
      iconProgressAnim.setValue(1);
      return;
    }

    const nextWidth = Math.max(MIN_PANEL_WIDTH, Math.min(maxPanelWidth, rawWidth));
    setLayoutMode((prev) => {
      const next = getLayoutMode(nextWidth);
      return prev === next ? prev : next;
    });
    expandedWidthRef.current = nextWidth;

    if (collapsedRef.current) {
      collapsedRef.current = false;
      setCollapsed(false);
    }

    panelWidthAnim.setValue(nextWidth);
    titleOpacityAnim.setValue(1);
    iconProgressAnim.setValue(0);
  }, [iconProgressAnim, maxPanelWidth, panelWidthAnim, titleOpacityAnim]);

  const onResizeHandlePointerDown = React.useCallback((event: any) => {
    if (Platform.OS !== 'web') return;

    const button = event.button ?? event.nativeEvent?.button;
    if (typeof button === 'number' && button !== 0) return;

    event.preventDefault?.();
    event.stopPropagation?.();

    const clientX =
      event.clientX ??
      event.nativeEvent?.clientX ??
      event.pageX ??
      event.nativeEvent?.pageX;
    if (typeof clientX !== 'number') return;

    const pointerId = event.pointerId ?? event.nativeEvent?.pointerId;
    activePointerIdRef.current = typeof pointerId === 'number' ? pointerId : null;
    const target = event.currentTarget as { setPointerCapture?: (id: number) => void } | undefined;
    if (target?.setPointerCapture && typeof activePointerIdRef.current === 'number') {
      target.setPointerCapture(activePointerIdRef.current);
    }

    panelWidthAnim.stopAnimation((currentWidth) => {
      resizeStartWidthRef.current = currentWidth;
      resizeStartXRef.current = clientX;
      setIsResizing(true);
    });
  }, [panelWidthAnim]);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !isResizing) return;

    const onPointerMove = (event: PointerEvent) => {
      if (
        typeof activePointerIdRef.current === 'number' &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      if ((event.buttons & 1) !== 1) return;

      applyResizeWidth(event.clientX);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (
        typeof activePointerIdRef.current === 'number' &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      if (!collapsedRef.current) {
        setExpandedPanelWidth(expandedWidthRef.current);
      }
      activePointerIdRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [applyResizeWidth, isResizing]);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const shouldResizeCursor = isResizeHandleHover || isResizing;
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;

    if (shouldResizeCursor) {
      document.body.style.cursor = resizeCursor;
    }
    if (isResizing) {
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isResizeHandleHover, isResizing, resizeCursor]);

  const resizeHandleProps =
    Platform.OS === 'web'
      ? ({
          onPointerDown: onResizeHandlePointerDown,
          onMouseEnter: () => setIsResizeHandleHover(true),
          onMouseLeave: () => setIsResizeHandleHover(false),
          onClick: (event: any) => {
            event.preventDefault?.();
            event.stopPropagation?.();
          }
        } as any)
      : {};
  const hideFlowColumns = layoutMode >= 1;
  const hideVolumeColumn = layoutMode >= 2;
  const isTwoColumnLayout = layoutMode >= 2;
  const sectionHeader = React.useMemo(
    () => (
      <SidebarSectionHeader
        isDarkMode={isDarkMode}
        isTwoColumnLayout={isTwoColumnLayout}
        hideVolumeColumn={hideVolumeColumn}
        hideFlowColumns={hideFlowColumns}
      />
    ),
    [hideFlowColumns, hideVolumeColumn, isDarkMode, isTwoColumnLayout]
  );

  const renderQuoteItem = React.useCallback(
    ({ item }: { item: QuoteItem }) => (
      <SidebarQuoteRow
        item={item}
        isDarkMode={isDarkMode}
        isTwoColumnLayout={isTwoColumnLayout}
        hideVolumeColumn={hideVolumeColumn}
        hideFlowColumns={hideFlowColumns}
        layoutMode={layoutMode}
        detailBackground={colors.detailBackground}
        trendColors={trendColors}
        onPressQuote={onPressQuote}
      />
    ),
    [
      colors.detailBackground,
      hideFlowColumns,
      hideVolumeColumn,
      isDarkMode,
      isTwoColumnLayout,
      layoutMode,
      onPressQuote,
      trendColors
    ]
  );

  const keyExtractor = React.useCallback((item: QuoteItem) => item.symbol, []);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<(typeof mockQuotes)[number]> | null | undefined, index: number) => ({
      length: ROW_HEIGHT + ROW_SEPARATOR_HEIGHT,
      offset: SECTION_HEADER_HEIGHT + (ROW_HEIGHT + ROW_SEPARATOR_HEIGHT) * index,
      index
    }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.leftPanel,
        { width: panelWidthAnim },
        collapsed && styles.leftPanelCollapsed
      ]}
    >
      <View
        style={[
          styles.leftPanelSurface,
          isDarkMode && styles.leftPanelSurfaceDark,
          collapsed && styles.leftPanelSurfaceCollapsed
        ]}
      >
        <View
          style={[
            styles.leftPanelTopBar,
            isDarkMode && styles.leftPanelTopBarDark,
            collapsed && styles.leftPanelTopBarCollapsed
          ]}
        >
          <Animated.View style={[styles.leftPanelTitleWrap, { opacity: titleOpacityAnim }]}>
            <Text style={[styles.leftPanelTitle, isDarkMode && styles.leftPanelTitleDark]}>시세</Text>
          </Animated.View>
          <Pressable
            style={[
              styles.collapseButton,
              isDarkMode && styles.collapseButtonDark,
              collapsed && styles.collapseButtonCollapsed
            ]}
            onPress={() => setCollapsed((prev) => !prev)}
          >
            {fontsLoaded ? (
              <AnimatedIcon
                name="panel-right"
                size={18}
                style={[styles.collapseIcon, isDarkMode && styles.collapseIconDark, { transform: [{ rotate: iconRotate }] }]}
              />
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
          </Pressable>
        </View>

        {!collapsed && (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={mockQuotes}
            onLayout={(event) => {
              listViewportHeightRef.current = event.nativeEvent.layout.height;
              syncScrollHint();
            }}
            onContentSizeChange={(_, height) => {
              listContentHeightRef.current = height;
              syncScrollHint();
            }}
            onScroll={(event) => {
              listOffsetYRef.current = event.nativeEvent.contentOffset.y;
              syncScrollHint();
            }}
            ListHeaderComponent={sectionHeader}
            stickyHeaderIndices={[0]}
            renderItem={renderQuoteItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            ItemSeparatorComponent={() => <View style={[styles.listSeparator, isDarkMode && styles.listSeparatorDark]} />}
            removeClippedSubviews={Platform.OS !== 'web'}
            initialNumToRender={24}
            maxToRenderPerBatch={24}
            updateCellsBatchingPeriod={16}
            windowSize={12}
          />
        )}

        {!collapsed && showBottomScrollHint && (
          <View
            pointerEvents="none"
            style={[
              styles.scrollHintOverlay,
              isDarkMode ? styles.scrollHintOverlayDark : styles.scrollHintOverlayLight,
              scrollHintWebStyle
            ]}
          />
        )}
      </View>

      <View
        style={[styles.resizeHandleHitBox, { backgroundColor: colors.pageBackground }]}
        {...resizeHandleProps}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  leftPanel: {
    marginLeft: 20,
    marginRight: 0,
    marginBottom: 20,
    marginTop: 0,
    position: 'relative',
    zIndex: 40
  },
  leftPanelSurface: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: LIGHT_SIDEBAR_BACKGROUND,
    overflow: 'hidden'
  },
  leftPanelSurfaceDark: {
    backgroundColor: '#212429'
  },
  leftPanelSurfaceCollapsed: {
    backgroundColor: 'transparent'
  },
  leftPanelCollapsed: {
    minWidth: COLLAPSED_PANEL_WIDTH
  },
  leftPanelTopBar: {
    height: 48,
    paddingLeft: 14,
    paddingRight: 8,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_SIDEBAR_BORDER,
    backgroundColor: LIGHT_SIDEBAR_BACKGROUND,
    position: 'relative'
  },
  leftPanelTopBarDark: {
    backgroundColor: '#212429',
    borderBottomColor: DARK_BORDER_COLOR
  },
  leftPanelTopBarCollapsed: {
    borderBottomWidth: 0,
    borderRadius: 12,
    paddingLeft: 0,
    paddingRight: 0
  },
  leftPanelTitleWrap: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center'
  },
  leftPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  leftPanelTitleDark: {
    color: '#e2e8f0'
  },
  collapseButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-end'
  },
  collapseButtonDark: {
    backgroundColor: '#2c313b'
  },
  collapseButtonCollapsed: {
    alignSelf: 'center'
  },
  collapseIcon: {
    color: '#1e293b'
  },
  collapseIconDark: {
    color: '#e2e8f0'
  },
  iconPlaceholder: {
    width: 18,
    height: 18
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: 8
  },
  listSeparator: {
    height: ROW_SEPARATOR_HEIGHT,
    marginHorizontal: LIST_HORIZONTAL_MARGIN,
    backgroundColor: LIGHT_SIDEBAR_BORDER
  },
  listSeparatorDark: {
    backgroundColor: DARK_BORDER_COLOR
  },
  scrollHintOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCROLL_HINT_HEIGHT,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  scrollHintOverlayLight: {
    backgroundColor: 'rgba(255,255,255,0.86)'
  },
  scrollHintOverlayDark: {
    backgroundColor: 'rgba(26,28,33,0.86)'
  },
  resizeHandleHitBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: -RESIZE_HANDLE_MARGIN_WIDTH,
    width: RESIZE_HANDLE_MARGIN_WIDTH,
    zIndex: 30
  }
});
