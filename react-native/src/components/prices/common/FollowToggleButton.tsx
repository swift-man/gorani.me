import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type FollowToggleButtonProps = {
  isDarkMode: boolean;
  isFollowing: boolean;
  onToggle: () => void;
  followLabel?: string;
  followingLabel?: string;
};

export default function FollowToggleButton({
  isDarkMode,
  isFollowing,
  onToggle,
  followLabel = '팔로우',
  followingLabel = '팔로잉'
}: FollowToggleButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

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

  return (
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
        onToggle();
      }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Text style={[styles.buttonText, { color: resolvedColor }]}>
        {isFollowing ? followingLabel : followLabel}
      </Text>
    </Pressable>
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
  }
});
