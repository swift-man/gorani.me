import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBoardFollow } from '../following/BoardFollowContext';

type FollowToggleButtonProps = {
  isDarkMode: boolean;
  boardKey: string;
  boardName?: string;
  boardIconUri?: string;
  followLabel?: string;
  followingLabel?: string;
};

export default function FollowToggleButton({
  isDarkMode,
  boardKey,
  boardName,
  boardIconUri,
  followLabel = '팔로우',
  followingLabel = '팔로잉'
}: FollowToggleButtonProps) {
  const {
    isBoardFollowing,
    followBoard,
    unfollowBoard,
    hasShownFirstFollowPopup,
    markFirstFollowPopupShown
  } = useBoardFollow();

  const isFollowing = isBoardFollowing(boardKey);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFollowPopupVisible, setIsFollowPopupVisible] = React.useState(false);
  const [isPendingFollowCommit, setIsPendingFollowCommit] = React.useState(false);

  const isFollowingActive = isFollowing && isHovered;
  const resolvedColor = isFollowing
    ? isDarkMode
      ? isFollowingActive
        ? '#ffffff'
        : '#667780'
      : isFollowingActive
        ? '#000000'
        : '#1f2937'
    : '#ffffff';
  const resolvedBoardName = boardName?.trim();
  const hasBoardTitle = !!resolvedBoardName;

  const closePopup = React.useCallback(() => {
    setIsFollowPopupVisible(false);
    setIsPendingFollowCommit((prev) => {
      if (prev) {
        followBoard(boardKey);
      }
      return false;
    });
  }, [boardKey, followBoard]);

  return (
    <>
      <Pressable
        style={[
          styles.button,
          isFollowing && styles.buttonFollowing,
          isFollowing && isDarkMode && styles.buttonFollowingDark,
          isFollowing && isDarkMode && isHovered && styles.buttonFollowingDarkHover,
          isFollowing && !isDarkMode && styles.buttonFollowingLight,
          isFollowing && !isDarkMode && isHovered && styles.buttonFollowingLightHover
        ]}
        onPress={(event) => {
          event.stopPropagation?.();
          if (isFollowing) {
            unfollowBoard(boardKey);
            return;
          }

          const shouldShowPopup = !hasShownFirstFollowPopup(boardKey);
          if (shouldShowPopup) {
            markFirstFollowPopupShown(boardKey);
            setIsPendingFollowCommit(true);
            setIsFollowPopupVisible(true);
            return;
          }

          followBoard(boardKey);
        }}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
      >
        <Text style={[styles.buttonText, { color: resolvedColor }]}>
          {isFollowing ? followingLabel : followLabel}
        </Text>
      </Pressable>

      <Modal
        visible={isFollowPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <Pressable style={styles.popupBackdrop} onPress={closePopup}>
          <Pressable
            style={[styles.popupCard, isDarkMode && styles.popupCardDark]}
            onPress={(event) => event.stopPropagation?.()}
          >
            {hasBoardTitle ? (
              <View style={styles.popupBoardHeader}>
                {boardIconUri ? (
                  <Image source={{ uri: boardIconUri }} style={styles.popupBoardIcon} resizeMode="cover" />
                ) : null}
                <Text style={[styles.popupTitle, isDarkMode && styles.popupTitleDark]}>{resolvedBoardName}</Text>
              </View>
            ) : null}
            <Text style={[styles.popupSubtitle, isDarkMode && styles.popupSubtitleDark]}>
              게시판을 팔로우 했습니다.
            </Text>
            <Image source={require('../../../assets/following.png')} style={styles.popupImage} resizeMode="cover" />
            <View style={styles.popupDescriptionWrap}>
              <Text style={[styles.popupDescription, isDarkMode && styles.popupDescriptionDark]}>
                이 게시판의 글이 홈에 노출 됩니다.
              </Text>
              <Text style={[styles.popupDescription, styles.popupDescriptionSecond, isDarkMode && styles.popupDescriptionDark]}>
                이 게시판의 활동이 알림으로 발송 됩니다.
              </Text>
            </View>
            <Pressable
              style={[styles.popupConfirmButton, isDarkMode && styles.popupConfirmButtonDark]}
              onPress={closePopup}
            >
              <Text style={[styles.popupConfirmButtonText, isDarkMode && styles.popupConfirmButtonTextDark]}>
                확인
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2e9a40',
    backgroundColor: '#2e9a40',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonFollowing: {
    backgroundColor: 'transparent'
  },
  buttonFollowingDark: {
    borderColor: '#667780'
  },
  buttonFollowingDarkHover: {
    borderColor: '#ffffff'
  },
  buttonFollowingLight: {
    borderColor: '#1f2937'
  },
  buttonFollowingLightHover: {
    borderColor: '#000000'
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  popupBackdrop: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(2, 6, 23, 0.56)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popupCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d6dde6',
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    alignItems: 'center'
  },
  popupCardDark: {
    backgroundColor: '#161c2b',
    borderColor: '#384253'
  },
  popupTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  popupTitleDark: {
    color: '#f8fafc'
  },
  popupBoardHeader: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popupBoardIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 8
  },
  popupSubtitle: {
    marginTop: 2,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  popupSubtitleDark: {
    color: '#f8fafc'
  },
  popupImage: {
    width: '100%',
    height: 188,
    marginTop: 6
  },
  popupDescriptionWrap: {
    marginTop: 6,
    alignSelf: 'stretch'
  },
  popupDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    textAlign: 'left'
  },
  popupDescriptionSecond: {
    marginTop: 2
  },
  popupDescriptionDark: {
    color: '#cbd5e1'
  },
  popupConfirmButton: {
    marginTop: 10,
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popupConfirmButtonDark: {
    backgroundColor: '#f1f5f9'
  },
  popupConfirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc'
  },
  popupConfirmButtonTextDark: {
    color: '#0f172a'
  }
});
