import React from 'react';
import { router } from 'expo-router';
import { Asset } from 'expo-asset';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { getStockIconUri } from '../../../constants/stockIcons';
import {
  FEED_MENU_WIDTH,
  SECTOR_SORT_MENU_WIDTH,
  type CommunityFeedController
} from './useCommunityFeed';
import FollowToggleButton from '../common/FollowToggleButton';
import { useWebTheme } from '../../../theme/WebThemeContext';

const MEDIA_CORNER_RADIUS = 20;
const AUTHOR_NAMES = ['차트헌터', '볼륨러너', '퀀트고라니', '모멘텀킴', '브레이크아웃', '데이터폭스'];
const AUTHOR_POST_ATTR = 'data-author-post-id';

const getAuthorName = (id: string, symbol: string) => {
  const symbolMatch = symbol.match(/\d+/)?.[0];
  const symbolSeq = symbolMatch ? Number.parseInt(symbolMatch, 10) : 0;
  const idSeq = Number.parseInt(id.replace(/\D/g, ''), 10);
  const seq = Number.isFinite(symbolSeq) ? symbolSeq : 0;
  const index = Number.isFinite(idSeq) ? (idSeq + seq) % AUTHOR_NAMES.length : seq % AUTHOR_NAMES.length;
  return AUTHOR_NAMES[Math.abs(index)];
};

type CommunityContentListProps = {
  isDarkMode: boolean;
  showSidePanel: boolean;
  feedController: CommunityFeedController;
  topInset?: number;
  followBoardKey?: string;
  followBoardName?: string;
  followBoardIconUri?: string;
  contentVariant?: 'main' | 'board';
};

type AuthorPopupState = {
  postId: string;
  authorName: string;
  stockName: string;
  timeAgo: string;
  left: number;
  top: number;
  triggerRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null;
};

export default function CommunityContentList({
  isDarkMode,
  showSidePanel,
  feedController,
  topInset = 0,
  followBoardKey,
  followBoardName,
  followBoardIconUri,
  contentVariant = 'main'
}: CommunityContentListProps) {
  const [authorPopup, setAuthorPopup] = React.useState<AuthorPopupState | null>(null);
  const [voteMap, setVoteMap] = React.useState<Record<string, 'up' | 'down' | null>>({});
  const { trendColors } = useWebTheme();
  const portraitPreviewBlurWebStyle = React.useMemo(
    () =>
      Platform.OS === 'web'
        ? ({
            filter: 'blur(20px) saturate(1.06)',
            WebkitFilter: 'blur(20px) saturate(1.06)'
          } as any)
        : null,
    []
  );
  const onPressVoteUp = React.useCallback((postId: string) => {
    setVoteMap((prev) => ({
      ...prev,
      [postId]: prev[postId] === 'up' ? null : 'up'
    }));
  }, []);
  const onPressVoteDown = React.useCallback((postId: string) => {
    setVoteMap((prev) => ({
      ...prev,
      [postId]: prev[postId] === 'down' ? null : 'down'
    }));
  }, []);
  const openAuthorPopup = React.useCallback(
    (postId: string, authorName: string, stockName: string, timeAgo: string, event: any) => {
      if (Platform.OS !== 'web') return;

      const targetElement =
        (event?.currentTarget as HTMLElement | undefined) ??
        (event?.nativeEvent?.target as HTMLElement | undefined);
      const rect =
        targetElement && typeof targetElement.getBoundingClientRect === 'function'
          ? targetElement.getBoundingClientRect()
          : null;
      const clientX = event?.nativeEvent?.clientX ?? event?.nativeEvent?.pageX ?? 20;
      const clientY = event?.nativeEvent?.clientY ?? event?.nativeEvent?.pageY ?? 20;
      const left = Math.max(12, (rect?.left ?? clientX) - 10);
      const top = Math.max(12, (rect?.bottom ?? clientY) + 8);

      setAuthorPopup({
        postId,
        authorName,
        stockName,
        timeAgo,
        left,
        top,
        triggerRect: rect
          ? {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom
            }
          : null
      });
    },
    []
  );
  const closeAuthorPopup = React.useCallback(() => {
    setAuthorPopup(null);
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !authorPopup || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const getTriggerRect = () => {
      const trigger = document.querySelector(
        `[${AUTHOR_POST_ATTR}="${authorPopup.postId}"]`
      ) as HTMLElement | null;
      if (!trigger) return null;
      return trigger.getBoundingClientRect();
    };

    const isInsideTriggerRect = (clientX: number, clientY: number) => {
      const rect = authorPopup.triggerRect ?? getTriggerRect();
      if (!rect) return false;

      const hoverBuffer = 8;
      return (
        clientX >= rect.left - hoverBuffer &&
        clientX <= rect.right + hoverBuffer &&
        clientY >= rect.top - hoverBuffer &&
        clientY <= rect.bottom + hoverBuffer
      );
    };

    let pendingCloseTimer: number | null = null;
    const clearPendingClose = () => {
      if (!pendingCloseTimer) return;
      window.clearTimeout(pendingCloseTimer);
      pendingCloseTimer = null;
    };

    const scheduleClose = () => {
      if (pendingCloseTimer) return;
      pendingCloseTimer = window.setTimeout(() => {
        pendingCloseTimer = null;
        closeAuthorPopup();
      }, 80);
    };

    const onMouseDownWindow = (event: MouseEvent) => {
      if (isInsideTriggerRect(event.clientX, event.clientY)) return;
      clearPendingClose();
      closeAuthorPopup();
    };
    const onMouseMoveWindow = (event: MouseEvent) => {
      if (isInsideTriggerRect(event.clientX, event.clientY)) {
        clearPendingClose();
        return;
      }
      scheduleClose();
    };

    const onEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuthorPopup();
      }
    };

    const onWindowBlur = () => {
      clearPendingClose();
      closeAuthorPopup();
    };

    window.addEventListener('mousedown', onMouseDownWindow, true);
    window.addEventListener('mousemove', onMouseMoveWindow, true);
    window.addEventListener('keydown', onEscapeKey);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      clearPendingClose();
      window.removeEventListener('mousedown', onMouseDownWindow, true);
      window.removeEventListener('mousemove', onMouseMoveWindow, true);
      window.removeEventListener('keydown', onEscapeKey);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [authorPopup, closeAuthorPopup]);

  return (
    <>
      <View style={[styles.feedColumn, showSidePanel ? styles.feedColumnWide : styles.feedColumnSingle]}>
        <View style={[styles.communityListTopBar, { marginTop: topInset }, isDarkMode && styles.communityListTopBarDark]}>
          <Pressable style={[styles.sortMenuButton, isDarkMode && styles.sortMenuButtonDark]} onPress={feedController.openSortMenu}>
            <Text style={[styles.sortMenuButtonText, isDarkMode && styles.sortMenuButtonTextDark]}>
              {feedController.selectedSectorSortOption.label}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={14}
              color={isDarkMode ? '#cbd5e1' : '#475569'}
              style={styles.sortMenuButtonIcon}
            />
          </Pressable>
        </View>
        <View style={[styles.communityListTopBarDivider, isDarkMode && styles.communityListTopBarDividerDark]} />

        <View style={styles.feedList}>
          {feedController.sortedFeedItems.map((item, index) => {
            const isBoardVariant = contentVariant === 'board';
            const authorName = getAuthorName(item.id, item.symbol);
            const voteState = voteMap[item.id] ?? null;
            const isUpSelected = voteState === 'up';
            const isDownSelected = voteState === 'down';
            const voteBackgroundColor =
              voteState === 'up'
                ? trendColors.rise
                : voteState === 'down'
                  ? trendColors.fall
                  : null;

            return (
              <View key={item.id} style={styles.feedItemWrap}>
                <Pressable
                  style={[styles.feedCard, isDarkMode && styles.feedCardDark]}
                  onPress={() => router.push({ pathname: '/communities/detail', params: { symbol: item.symbol } })}
                >
                <View style={styles.feedHeader}>
                    <View style={[styles.feedHeaderLeft, isBoardVariant && styles.feedHeaderLeftBoard]}>
                      <Image
                        source={{ uri: getStockIconUri(item.symbol) }}
                        style={[styles.feedSymbolIcon, isBoardVariant && styles.feedSymbolIconBoard]}
                      />
                      {isBoardVariant ? (
                        <View style={styles.feedMetaBoardBlock}>
                          <Text style={[styles.feedMetaBoardTop, isDarkMode && styles.feedMetaBoardTopDark]} numberOfLines={1}>
                            {item.stockName}
                          </Text>
                          <View style={styles.feedAuthorLineWrap}>
                            <View
                              {...(Platform.OS === 'web'
                                ? ({ [AUTHOR_POST_ATTR]: item.id } as any)
                                : {})}
                            >
                            <Pressable
                              style={styles.feedAuthorHoverTrigger}
                              onHoverIn={(event) =>
                                openAuthorPopup(item.id, authorName, item.stockName, item.timeAgo, event)
                              }
                              onBlur={closeAuthorPopup}
                              onPress={(event) => event.stopPropagation?.()}
                            >
                              <Text
                                style={[styles.feedMetaBoardAuthor, isDarkMode && styles.feedMetaBoardAuthorDark]}
                                numberOfLines={1}
                              >
                                {authorName}
                              </Text>
                            </Pressable>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.feedMetaText, isDarkMode && styles.feedMetaTextDark]} numberOfLines={1}>
                          {item.stockName} • {item.timeAgo}
                        </Text>
                      )}
                    </View>
                    <View style={styles.feedHeaderRight}>
                      <FollowToggleButton
                        isDarkMode={isDarkMode}
                        boardKey={followBoardKey ?? `symbol:${item.symbol}`}
                        boardName={followBoardName ?? item.stockName}
                        boardIconUri={followBoardIconUri ?? getStockIconUri(item.symbol)}
                      />
                      <Pressable style={styles.moreButton} onPress={(event) => feedController.openFeedMenu(item.id, event)}>
                        <MaterialIcons name="more-horiz" size={20} color={isDarkMode ? '#d1d5db' : '#64748b'} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={[styles.feedTitle, isDarkMode && styles.feedTitleDark]} numberOfLines={1}>
                    {item.title}
                  </Text>

                  {item.previewImage
                    ? (() => {
                        const previewAsset = Asset.fromModule(item.previewImage);
                        const previewAspectRatio =
                          item.previewAspectRatio ??
                          (previewAsset?.width && previewAsset?.height
                            ? previewAsset.width / previewAsset.height
                            : 16 / 9);
                        const isPortraitPreview = previewAspectRatio < 1;

                        return (
                          <View
                            style={[
                              styles.feedPreviewImageFrame,
                              isDarkMode && styles.feedPreviewImageFrameDark,
                              { aspectRatio: isPortraitPreview ? 1 : previewAspectRatio }
                            ]}
                          >
                            {isPortraitPreview ? (
                              <Image
                                source={item.previewImage}
                                style={[styles.feedPreviewBlurBackground, portraitPreviewBlurWebStyle]}
                                resizeMode="cover"
                                blurRadius={22}
                              />
                            ) : null}
                            <Image source={item.previewImage} style={styles.feedPreviewImage} resizeMode="contain" />
                          </View>
                        );
                      })()
                    : (
                      <Text style={[styles.feedDescription, isDarkMode && styles.feedDescriptionDark]} numberOfLines={6}>
                        {item.description}
                      </Text>
                    )}

                  <View style={styles.feedActionsRow}>
                    <View style={[styles.feedVoteGroup, isDarkMode && styles.feedVoteGroupDark]}>
                      <Pressable
                        style={[styles.feedVoteLikeButton, voteBackgroundColor && { backgroundColor: voteBackgroundColor }]}
                        onPress={() => onPressVoteUp(item.id)}
                      >
                        {isUpSelected ? (
                          <MaterialCommunityIcons name="thumb-up" size={16} color="#ffffff" />
                        ) : (
                          <SimpleLineIcons
                            name={'like' as any}
                            size={15}
                            color={voteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
                          />
                        )}
                        <Text
                          style={[
                            styles.feedVoteLikeText,
                            isDarkMode && styles.feedVoteLikeTextDark,
                            isUpSelected && styles.feedVoteLikeTextSelected
                          ]}
                        >
                          {item.likes}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.feedVoteDislikeButton, voteBackgroundColor && { backgroundColor: voteBackgroundColor }]}
                        onPress={() => onPressVoteDown(item.id)}
                      >
                        {isDownSelected ? (
                          <MaterialCommunityIcons name="thumb-down" size={16} color="#ffffff" />
                        ) : (
                          <SimpleLineIcons
                            name={'dislike' as any}
                            size={15}
                            color={voteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
                          />
                        )}
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
                      <MaterialIcons name={'ios-share' as any} size={16} color={isDarkMode ? '#e2e8f0' : '#475569'} />
                      <Text style={[styles.feedShareButtonText, isDarkMode && styles.feedShareButtonTextDark]}>공유</Text>
                    </Pressable>
                  </View>
                </Pressable>
                {index < feedController.sortedFeedItems.length - 1 && (
                  <View style={[styles.feedSeparator, isDarkMode && styles.feedSeparatorDark]} />
                )}
              </View>
            );
          })}
        </View>

        {feedController.hasNextPage && feedController.isLoadingNextPage && (
          <View style={styles.bottomLoader}>
            <ActivityIndicator size="small" color={isDarkMode ? '#e2e8f0' : '#334155'} />
            <Text style={[styles.bottomLoaderText, isDarkMode && styles.bottomLoaderTextDark]}>
              다음 글 불러오는 중...
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={Platform.OS === 'web' && !!authorPopup}
        transparent
        animationType="none"
        onRequestClose={closeAuthorPopup}
      >
        <View style={styles.authorPopupPortalRoot} pointerEvents="none">
          {authorPopup ? (
            <View
              style={[
                styles.feedAuthorPopup,
                isDarkMode && styles.feedAuthorPopupDark,
                {
                  left: authorPopup.left,
                  top: authorPopup.top
                }
              ]}
            >
              <Text style={[styles.feedAuthorPopupTitle, isDarkMode && styles.feedAuthorPopupTitleDark]}>
                {authorPopup.authorName}
              </Text>
              <Text style={[styles.feedAuthorPopupText, isDarkMode && styles.feedAuthorPopupTextDark]}>
                관심 종목: {authorPopup.stockName}
              </Text>
              <Text style={[styles.feedAuthorPopupText, isDarkMode && styles.feedAuthorPopupTextDark]}>
                최근 활동: {authorPopup.timeAgo}
              </Text>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={feedController.isSortMenuVisible && !!feedController.sortMenuPosition}
        transparent
        animationType="fade"
        onRequestClose={feedController.closeSortMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={feedController.closeSortMenu}>
          {feedController.sortMenuPosition ? (
            <View
              style={[
                styles.sortMenuSheet,
                isDarkMode && styles.sortMenuSheetDark,
                {
                  left: feedController.sortMenuPosition.left,
                  top: feedController.sortMenuPosition.top
                }
              ]}
            >
              <View style={[styles.sortMenuHeader, isDarkMode && styles.sortMenuHeaderDark]}>
                <Text style={[styles.sortMenuHeaderText, isDarkMode && styles.sortMenuHeaderTextDark]}>정렬</Text>
              </View>
              {feedController.sortOptions.map((option, index) => {
                const isSelected = option.key === feedController.sortKey;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.sortMenuItem,
                      isDarkMode && styles.sortMenuItemDark,
                      index < feedController.sortOptions.length - 1 && styles.sortMenuItemDivider,
                      index < feedController.sortOptions.length - 1 && isDarkMode && styles.sortMenuItemDividerDark
                    ]}
                    onPress={() => feedController.onSelectSort(option.key)}
                  >
                    <Text
                      style={[
                        styles.sortMenuItemText,
                        isDarkMode && styles.sortMenuItemTextDark,
                        isSelected && styles.sortMenuItemTextSelected,
                        isSelected && isDarkMode && styles.sortMenuItemTextSelectedDark
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Pressable>
      </Modal>

      <Modal
        visible={feedController.isFeedMenuVisible && !!feedController.feedMenuPosition}
        transparent
        animationType="fade"
        onRequestClose={feedController.closeFeedMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={feedController.closeFeedMenu}>
          {feedController.feedMenuPosition ? (
            <View
              style={[
                styles.feedMenuSheet,
                isDarkMode && styles.feedMenuSheetDark,
                {
                  left: feedController.feedMenuPosition.left,
                  top: feedController.feedMenuPosition.top
                }
              ]}
            >
              {feedController.feedMenuActions.map((action, index) => {
                const isActive = feedController.activeFeedMenuState[action.key];
                const iconName = isActive ? action.iconOn : action.iconOff;
                const isDanger = action.key === 'report';

                return (
                  <Pressable
                    key={action.key}
                    style={[
                      styles.feedMenuItem,
                      isDarkMode && styles.feedMenuItemDark,
                      index < feedController.feedMenuActions.length - 1 && styles.feedMenuItemDivider,
                      index < feedController.feedMenuActions.length - 1 && isDarkMode && styles.feedMenuItemDividerDark
                    ]}
                    onPress={() => feedController.onPressFeedMenuAction(action.key)}
                  >
                    <View style={styles.feedMenuItemContent}>
                      <MaterialCommunityIcons
                        name={iconName as any}
                        size={18}
                        color={isDanger ? '#ef4444' : isDarkMode ? '#e2e8f0' : '#334155'}
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
    </>
  );
}

const styles = StyleSheet.create({
  feedColumn: {
    minWidth: 0
  },
  feedColumnWide: {
    flex: 3.35,
    marginRight: 10
  },
  feedColumnSingle: {
    flex: 1
  },
  communityListTopBar: {
    height: 36,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  communityListTopBarDark: {
    backgroundColor: 'transparent'
  },
  communityListTopBarDivider: {
    height: 1,
    marginHorizontal: 10,
    marginBottom: 6,
    backgroundColor: '#e2e8f0'
  },
  communityListTopBarDividerDark: {
    backgroundColor: '#36363B'
  },
  sortMenuButton: {
    height: 28,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  sortMenuButtonDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  sortMenuButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  sortMenuButtonTextDark: {
    color: '#cbd5e1'
  },
  sortMenuButtonIcon: {
    marginLeft: 4
  },
  feedList: {
    paddingTop: 4,
    width: '100%',
    alignSelf: 'stretch'
  },
  feedItemWrap: {
    marginBottom: 0,
    width: '100%',
    alignSelf: 'stretch'
  },
  feedCard: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 0
  },
  feedCardDark: {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  feedSeparator: {
    height: 1,
    marginHorizontal: 10,
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
  feedHeaderLeftBoard: {
    alignItems: 'flex-start'
  },
  feedSymbolIcon: {
    width: 22,
    height: 22,
    borderRadius: 7
  },
  feedSymbolIconBoard: {
    width: 30,
    height: 30,
    borderRadius: 10
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
  feedMetaBoardBlock: {
    marginLeft: 8,
    minWidth: 0,
    flex: 1,
    height: 30,
    justifyContent: 'space-between'
  },
  feedMetaBoardTop: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#475569'
  },
  feedMetaBoardTopDark: {
    color: '#cbd5e1'
  },
  feedAuthorLineWrap: {
    position: 'relative',
    alignSelf: 'flex-start'
  },
  feedMetaBoardAuthor: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  feedMetaBoardAuthorDark: {
    color: '#94a3b8'
  },
  feedAuthorHoverTrigger: {
    alignSelf: 'flex-start',
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginHorizontal: -3,
    marginVertical: -2
  },
  authorPopupPortalRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent'
  },
  feedAuthorPopup: {
    position: 'absolute',
    left: 0,
    top: 20,
    minWidth: 170,
    maxWidth: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    zIndex: 9999
  },
  feedAuthorPopupDark: {
    borderColor: '#4b5563',
    backgroundColor: '#1f2732'
  },
  feedAuthorPopupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  feedAuthorPopupTitleDark: {
    color: '#f8fafc'
  },
  feedAuthorPopupText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: '#475569'
  },
  feedAuthorPopupTextDark: {
    color: '#cbd5e1'
  },
  feedHeaderRight: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center'
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
  feedDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#334155'
  },
  feedDescriptionDark: {
    color: '#d1d5db'
  },
  feedPreviewImageFrame: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: MEDIA_CORNER_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9dee7',
    backgroundColor: '#111827',
    overflow: 'hidden',
    marginTop: 10
  },
  feedPreviewImageFrameDark: {
    borderColor: '#4b5563'
  },
  feedPreviewBlurBackground: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.24 }],
    opacity: 1
  },
  feedPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    marginTop: 0
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
    paddingRight: 8,
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
  feedVoteLikeTextSelected: {
    color: '#ffffff'
  },
  feedVoteDislikeButton: {
    width: 28,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  sortMenuSheet: {
    position: 'absolute',
    width: SECTOR_SORT_MENU_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    overflow: 'hidden'
  },
  sortMenuSheetDark: {
    borderColor: '#36363B',
    backgroundColor: '#212429'
  },
  sortMenuHeader: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  sortMenuHeaderDark: {
    backgroundColor: '#27303a',
    borderBottomColor: '#36363B'
  },
  sortMenuHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8'
  },
  sortMenuHeaderTextDark: {
    color: '#94a3b8'
  },
  sortMenuItem: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  sortMenuItemDark: {
    backgroundColor: '#212429'
  },
  sortMenuItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  sortMenuItemDividerDark: {
    borderBottomColor: '#36363B'
  },
  sortMenuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  sortMenuItemTextDark: {
    color: '#e2e8f0'
  },
  sortMenuItemTextSelected: {
    color: '#0f172a'
  },
  sortMenuItemTextSelectedDark: {
    color: '#ffffff'
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
