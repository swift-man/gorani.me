import React from 'react';
import { router } from 'expo-router';
import { Asset } from 'expo-asset';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

const MEDIA_CORNER_RADIUS = 20;

type CommunityContentListProps = {
  isDarkMode: boolean;
  showSidePanel: boolean;
  feedController: CommunityFeedController;
  topInset?: number;
  followBoardKey?: string;
  followBoardName?: string;
  followBoardIconUri?: string;
};

export default function CommunityContentList({
  isDarkMode,
  showSidePanel,
  feedController,
  topInset = 0,
  followBoardKey,
  followBoardName,
  followBoardIconUri
}: CommunityContentListProps) {
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
          {feedController.sortedFeedItems.map((item, index) => (
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
                    <MaterialIcons name={'ios-share' as any} size={16} color={isDarkMode ? '#e2e8f0' : '#475569'} />
                    <Text style={[styles.feedShareButtonText, isDarkMode && styles.feedShareButtonTextDark]}>공유</Text>
                  </Pressable>
                </View>
              </Pressable>
              {index < feedController.sortedFeedItems.length - 1 && (
                <View style={[styles.feedSeparator, isDarkMode && styles.feedSeparatorDark]} />
              )}
            </View>
          ))}
        </View>

        {feedController.isLoadingNextPage && (
          <View style={styles.bottomLoader}>
            <ActivityIndicator size="small" color={isDarkMode ? '#e2e8f0' : '#334155'} />
            <Text style={[styles.bottomLoaderText, isDarkMode && styles.bottomLoaderTextDark]}>
              다음 글 불러오는 중...
            </Text>
          </View>
        )}
      </View>

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
