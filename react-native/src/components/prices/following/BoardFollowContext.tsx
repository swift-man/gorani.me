import React from 'react';

type BoardFollowContextValue = {
  isBoardFollowing: (boardKey?: string | null) => boolean;
  followBoard: (boardKey?: string | null) => void;
  unfollowBoard: (boardKey?: string | null) => void;
  hasShownFirstFollowPopup: (boardKey?: string | null) => boolean;
  markFirstFollowPopupShown: (boardKey?: string | null) => void;
};

const FOLLOWING_STORAGE_KEY = 'gorani.web.followingBoards';
const FIRST_POPUP_STORAGE_KEY = 'gorani.web.firstFollowPopupShownBoards';

const BoardFollowContext = React.createContext<BoardFollowContextValue>({
  isBoardFollowing: () => false,
  followBoard: () => {},
  unfollowBoard: () => {},
  hasShownFirstFollowPopup: () => false,
  markFirstFollowPopupShown: () => {}
});

const resolveBoardKey = (boardKey?: string | null): string | null => {
  const trimmed = boardKey?.trim();
  return trimmed ? trimmed : null;
};

const readStorageMap = (storageKey: string): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed).reduce<Record<string, boolean>>((acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const writeStorageMap = (storageKey: string, map: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(map));
  } catch {
    // ignore storage write failures
  }
};

export function BoardFollowProvider({ children }: { children: React.ReactNode }) {
  const [followingMap, setFollowingMap] = React.useState<Record<string, boolean>>(() =>
    readStorageMap(FOLLOWING_STORAGE_KEY)
  );
  const [popupShownMap, setPopupShownMap] = React.useState<Record<string, boolean>>(() =>
    readStorageMap(FIRST_POPUP_STORAGE_KEY)
  );

  React.useEffect(() => {
    writeStorageMap(FOLLOWING_STORAGE_KEY, followingMap);
  }, [followingMap]);

  React.useEffect(() => {
    writeStorageMap(FIRST_POPUP_STORAGE_KEY, popupShownMap);
  }, [popupShownMap]);

  const isBoardFollowing = React.useCallback(
    (boardKey?: string | null) => {
      const resolvedKey = resolveBoardKey(boardKey);
      if (!resolvedKey) return false;
      return !!followingMap[resolvedKey];
    },
    [followingMap]
  );

  const followBoard = React.useCallback((boardKey?: string | null) => {
    const resolvedKey = resolveBoardKey(boardKey);
    if (!resolvedKey) return;

    setFollowingMap((prev) => ({
      ...prev,
      [resolvedKey]: true
    }));
  }, []);

  const unfollowBoard = React.useCallback((boardKey?: string | null) => {
    const resolvedKey = resolveBoardKey(boardKey);
    if (!resolvedKey) return;

    setFollowingMap((prev) => ({
      ...prev,
      [resolvedKey]: false
    }));
  }, []);

  const hasShownFirstFollowPopup = React.useCallback(
    (boardKey?: string | null) => {
      const resolvedKey = resolveBoardKey(boardKey);
      if (!resolvedKey) return false;
      return !!popupShownMap[resolvedKey];
    },
    [popupShownMap]
  );

  const markFirstFollowPopupShown = React.useCallback((boardKey?: string | null) => {
    const resolvedKey = resolveBoardKey(boardKey);
    if (!resolvedKey) return;

    setPopupShownMap((prev) => ({
      ...prev,
      [resolvedKey]: true
    }));
  }, []);

  const value = React.useMemo(
    () => ({
      isBoardFollowing,
      followBoard,
      unfollowBoard,
      hasShownFirstFollowPopup,
      markFirstFollowPopupShown
    }),
    [followBoard, hasShownFirstFollowPopup, isBoardFollowing, markFirstFollowPopupShown, unfollowBoard]
  );

  return <BoardFollowContext.Provider value={value}>{children}</BoardFollowContext.Provider>;
}

export function useBoardFollow() {
  return React.useContext(BoardFollowContext);
}
