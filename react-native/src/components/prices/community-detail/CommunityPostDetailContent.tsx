import React from 'react';
import { Asset } from 'expo-asset';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { getStockIconUri } from '../../../constants/stockIcons';
import { createFeedPageItems } from '../mainCommunityData';
import { useWebTheme } from '../../../theme/WebThemeContext';

type CommunityPostDetailContentProps = {
  isDarkMode: boolean;
  showSidePanel: boolean;
  selectedSymbol: string;
  topInset?: number;
};

type CommentSortKey = 'best' | 'newest' | 'hot';

type CommentNode = {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  likes: number;
  order: number;
  replies?: CommentNode[];
};

const DETAIL_FEED_ITEMS = createFeedPageItems(0);
const COMMENT_SORT_OPTIONS: { key: CommentSortKey; label: 'Best' | 'New' | 'Hot' }[] = [
  { key: 'best', label: 'Best' },
  { key: 'newest', label: 'New' },
  { key: 'hot', label: 'Hot' }
];
const SORT_MENU_WIDTH = 132;
const SORT_MENU_HEIGHT = 146;
const MENU_SCREEN_PADDING = 10;
const PINNED_BEST_COMMENT = {
  id: 'c-pinned',
  author: '차트헌터',
  timeAgo: '43분 전',
  content: '이 구간은 고점 추격보다 눌림 확인 후 분할 진입이 유리해서 참고용으로 고정해둡니다.',
  likes: 214
};

const BASE_COMMENTS: CommentNode[] = [
  {
    id: 'c-1',
    author: '차트헌터',
    timeAgo: '31분 전',
    content: '단기 지지선 확인하고 분할로 접근하는 전략이 지금 구간에서는 가장 안정적입니다.',
    likes: 96,
    order: 9,
    replies: [
      {
        id: 'c-1-r1',
        author: '모멘텀킴',
        timeAgo: '24분 전',
        content: '동의합니다. 거래대금이 붙는지 함께 보면 실패 확률이 줄어요.',
        likes: 24,
        order: 8
      },
      {
        id: 'c-1-r2',
        author: '데이터폭스',
        timeAgo: '21분 전',
        content: '손절 라인을 먼저 정해두면 심리적으로도 훨씬 편합니다.',
        likes: 13,
        order: 7
      }
    ]
  },
  {
    id: 'c-2',
    author: '볼륨러너',
    timeAgo: '52분 전',
    content: '외국인 수급이 다시 플러스로 돌아서기 전까지는 추격 매수보다 눌림 대응이 좋아 보여요.',
    likes: 88,
    order: 6,
    replies: [
      {
        id: 'c-2-r1',
        author: '브레이크아웃',
        timeAgo: '40분 전',
        content: '맞아요. 변동성 큰 날에는 비중을 절반으로 줄이는 게 체감상 좋았습니다.',
        likes: 17,
        order: 5
      }
    ]
  },
  {
    id: 'c-3',
    author: '퀀트고라니',
    timeAgo: '1시간 전',
    content: '오늘 공시 반응은 단기 과열 느낌이라 고점 추격보다는 다음 눌림 확인이 낫습니다.',
    likes: 74,
    order: 4
  },
  {
    id: 'c-4',
    author: '캔들수집가',
    timeAgo: '1시간 전',
    content: '저는 5분봉 저점 이탈 전까지는 홀딩 관점 유지 중입니다.',
    likes: 36,
    order: 3
  },
  {
    id: 'c-5',
    author: '리스크매니저',
    timeAgo: '2시간 전',
    content: '반등 구간에서도 익절 분할은 반드시 하시는 걸 추천합니다.',
    likes: 21,
    order: 2
  },
  {
    id: 'c-6',
    author: '스윙트레이더',
    timeAgo: '2시간 전',
    content: '오늘은 변동폭이 커서 짧은 구간 매매가 더 유리해 보입니다.',
    likes: 14,
    order: 1
  }
];

const normalize = (value: string) => value.trim().toLowerCase();

const filterCommentNodes = (nodes: CommentNode[], keyword: string): CommentNode[] => {
  if (!keyword) return nodes;

  return nodes.reduce<CommentNode[]>((acc, node) => {
    const filteredReplies = filterCommentNodes(node.replies ?? [], keyword);
    const selfMatched =
      normalize(node.author).includes(keyword) || normalize(node.content).includes(keyword);

    if (selfMatched || filteredReplies.length > 0) {
      acc.push({
        ...node,
        replies: filteredReplies
      });
    }

    return acc;
  }, []);
};

const sortTopLevelComments = (nodes: CommentNode[], sortKey: CommentSortKey): CommentNode[] => {
  const next = [...nodes];
  if (sortKey === 'newest') {
    return next.sort((a, b) => b.order - a.order);
  }
  if (sortKey === 'hot') {
    return next.sort((a, b) => b.likes * 2 + b.order * 12 - (a.likes * 2 + a.order * 12));
  }

  return next.sort((a, b) => b.likes - a.likes);
};

const getMaxCommentOrder = (nodes: CommentNode[]): number => {
  return nodes.reduce((maxOrder, node) => {
    const childMax = getMaxCommentOrder(node.replies ?? []);
    return Math.max(maxOrder, node.order, childMax);
  }, 0);
};

const appendReplyToNode = (
  node: CommentNode,
  parentId: string,
  reply: CommentNode
): { node: CommentNode; updated: boolean } => {
  if (node.id === parentId) {
    return {
      node: {
        ...node,
        replies: [...(node.replies ?? []), reply]
      },
      updated: true
    };
  }

  const replies = node.replies ?? [];
  if (replies.length === 0) {
    return { node, updated: false };
  }

  let updated = false;
  const nextReplies = replies.map((child) => {
    const result = appendReplyToNode(child, parentId, reply);
    if (result.updated) {
      updated = true;
    }
    return result.node;
  });

  if (!updated) {
    return { node, updated: false };
  }

  return {
    node: {
      ...node,
      replies: nextReplies
    },
    updated: true
  };
};

const appendReplyToTree = (
  nodes: CommentNode[],
  parentId: string,
  reply: CommentNode
): { nodes: CommentNode[]; updated: boolean } => {
  let updated = false;

  const nextNodes = nodes.map((node) => {
    const result = appendReplyToNode(node, parentId, reply);
    if (result.updated) {
      updated = true;
    }
    return result.node;
  });

  if (!updated) {
    return { nodes, updated: false };
  }

  return { nodes: nextNodes, updated: true };
};

export default function CommunityPostDetailContent({
  isDarkMode,
  showSidePanel,
  selectedSymbol,
  topInset = 6
}: CommunityPostDetailContentProps) {
  const { trendColors } = useWebTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [commentSortKey, setCommentSortKey] = React.useState<CommentSortKey>('best');
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [commentInputValue, setCommentInputValue] = React.useState('');
  const [isCommentInputFocused, setIsCommentInputFocused] = React.useState(false);
  const [postVote, setPostVote] = React.useState<'up' | 'down' | null>(null);
  const [commentVoteMap, setCommentVoteMap] = React.useState<Record<string, 'up' | 'down' | null>>({});
  const [sortMenuAnchor, setSortMenuAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const [commentTree, setCommentTree] = React.useState<CommentNode[]>(BASE_COMMENTS);
  const [pinnedComment, setPinnedComment] = React.useState<CommentNode>(() => ({
    ...PINNED_BEST_COMMENT,
    order: Number.MAX_SAFE_INTEGER,
    replies: []
  }));
  const [activeReplyTargetId, setActiveReplyTargetId] = React.useState<string | null>(null);
  const [replyDraftMap, setReplyDraftMap] = React.useState<Record<string, string>>({});
  const [replyFocusedTargetId, setReplyFocusedTargetId] = React.useState<string | null>(null);
  const [expandedReplyMap, setExpandedReplyMap] = React.useState<Record<string, boolean>>({});
  const replyOrderRef = React.useRef(getMaxCommentOrder(BASE_COMMENTS) + 1);
  const replyIdRef = React.useRef(0);
  const query = normalize(searchKeyword);
  const isCommentSubmitEnabled = commentInputValue.trim().length > 0;

  const post = React.useMemo(() => {
    return DETAIL_FEED_ITEMS.find((item) => item.symbol === selectedSymbol) ?? DETAIL_FEED_ITEMS[0];
  }, [selectedSymbol]);

  const symbolDisplayName = React.useMemo(() => {
    const matched = selectedSymbol.match(/\d+/)?.[0];
    const sequence = matched ? Number.parseInt(matched, 10) : 1;
    return `코인 ${Number.isFinite(sequence) ? sequence : 1}`;
  }, [selectedSymbol]);

  const previewAspectRatio = React.useMemo(() => {
    if (!post.previewImage) return null;

    const fromProps = post.previewAspectRatio;
    if (fromProps && Number.isFinite(fromProps) && fromProps > 0) {
      return fromProps;
    }

    const asset = Asset.fromModule(post.previewImage);
    if (asset?.width && asset?.height) {
      return asset.width / asset.height;
    }

    return 16 / 9;
  }, [post.previewAspectRatio, post.previewImage]);

  const filteredComments = React.useMemo(() => {
    return filterCommentNodes(commentTree, query);
  }, [commentTree, query]);

  const bestComments = React.useMemo(() => {
    return [...filteredComments].sort((a, b) => b.likes - a.likes).slice(0, 3);
  }, [filteredComments]);

  const remainingTopLevelComments = React.useMemo(() => {
    const bestIds = new Set(bestComments.map((item) => item.id));
    const remained = filteredComments.filter((item) => !bestIds.has(item.id));
    return sortTopLevelComments(remained, commentSortKey);
  }, [bestComments, commentSortKey, filteredComments]);

  const selectedSortOption = React.useMemo(
    () => COMMENT_SORT_OPTIONS.find((option) => option.key === commentSortKey) ?? COMMENT_SORT_OPTIONS[0],
    [commentSortKey]
  );
  const sortMenuPosition = React.useMemo(() => {
    if (!sortMenuAnchor) return null;

    const left = Math.max(
      MENU_SCREEN_PADDING,
      Math.min(screenWidth - SORT_MENU_WIDTH - MENU_SCREEN_PADDING, sortMenuAnchor.x - SORT_MENU_WIDTH + 30)
    );
    const top = Math.max(
      MENU_SCREEN_PADDING,
      Math.min(screenHeight - SORT_MENU_HEIGHT - MENU_SCREEN_PADDING, sortMenuAnchor.y + 8)
    );

    return { left, top };
  }, [screenHeight, screenWidth, sortMenuAnchor]);

  const openSortMenu = React.useCallback((event: any) => {
    const rawX = event?.nativeEvent?.pageX ?? event?.nativeEvent?.locationX ?? MENU_SCREEN_PADDING;
    const rawY = event?.nativeEvent?.pageY ?? event?.nativeEvent?.locationY ?? MENU_SCREEN_PADDING;
    setSortMenuAnchor({ x: rawX, y: rawY });
  }, []);

  const closeSortMenu = React.useCallback(() => {
    setSortMenuAnchor(null);
  }, []);

  const onSelectSort = React.useCallback((key: CommentSortKey) => {
    setCommentSortKey(key);
    setSortMenuAnchor(null);
  }, []);

  const onPressVoteUp = React.useCallback(() => {
    setPostVote((prev) => (prev === 'up' ? null : 'up'));
  }, []);

  const onPressVoteDown = React.useCallback(() => {
    setPostVote((prev) => (prev === 'down' ? null : 'down'));
  }, []);

  const onPressCommentVoteUp = React.useCallback((commentId: string) => {
    setCommentVoteMap((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === 'up' ? null : 'up'
    }));
  }, []);

  const onPressCommentVoteDown = React.useCallback((commentId: string) => {
    setCommentVoteMap((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === 'down' ? null : 'down'
    }));
  }, []);

  const onToggleReplyComposer = React.useCallback((commentId: string) => {
    setActiveReplyTargetId((prev) => (prev === commentId ? null : commentId));
  }, []);

  const onChangeReplyDraft = React.useCallback((commentId: string, value: string) => {
    setReplyDraftMap((prev) => ({
      ...prev,
      [commentId]: value
    }));
  }, []);

  const onExpandReplies = React.useCallback((commentId: string) => {
    setExpandedReplyMap((prev) => ({
      ...prev,
      [commentId]: true
    }));
  }, []);

  const buildReplyNode = React.useCallback((content: string): CommentNode => {
    return {
      id: `reply-${Date.now()}-${replyIdRef.current++}`,
      author: '나',
      timeAgo: '방금 전',
      content,
      likes: 0,
      order: replyOrderRef.current++,
      replies: []
    };
  }, []);

  const onSubmitReply = React.useCallback(
    (parentId: string) => {
      const draft = (replyDraftMap[parentId] ?? '').trim();
      if (!draft) {
        return;
      }

      const nextReply = buildReplyNode(draft);

      setPinnedComment((prev) => appendReplyToNode(prev, parentId, nextReply).node);
      setCommentTree((prev) => appendReplyToTree(prev, parentId, nextReply).nodes);
      setExpandedReplyMap((prev) => ({
        ...prev,
        [parentId]: true
      }));
      setReplyDraftMap((prev) => ({
        ...prev,
        [parentId]: ''
      }));
      setActiveReplyTargetId(null);
      setReplyFocusedTargetId(null);
    },
    [buildReplyNode, replyDraftMap]
  );

  const isUpSelected = postVote === 'up';
  const isDownSelected = postVote === 'down';
  const postVoteBackgroundColor =
    postVote === 'up' ? trendColors.rise : postVote === 'down' ? trendColors.fall : null;

  const renderCommentNode = (
    comment: CommentNode,
    depth = 0,
    options?: {
      isPinned?: boolean;
      isPinnedSectionItem?: boolean;
    }
  ): React.ReactElement => {
    const commentVoteState = commentVoteMap[comment.id] ?? null;
    const isCommentUpSelected = commentVoteState === 'up';
    const isCommentDownSelected = commentVoteState === 'down';
    const commentVoteBackgroundColor =
      commentVoteState === 'up'
        ? trendColors.rise
        : commentVoteState === 'down'
          ? trendColors.fall
          : null;
    const replies = comment.replies ?? [];
    const isExpanded = expandedReplyMap[comment.id] ?? false;
    const shouldCollapseReplies = !query && replies.length > 2 && !isExpanded;
    const visibleReplies = shouldCollapseReplies ? replies.slice(0, 2) : replies;
    const hiddenRepliesCount = Math.max(0, replies.length - visibleReplies.length);
    const isReplyComposerVisible = activeReplyTargetId === comment.id;
    const replyValue = replyDraftMap[comment.id] ?? '';
    const isReplySubmitEnabled = replyValue.trim().length > 0;
    const isReplyFocused = replyFocusedTargetId === comment.id;

    return (
      <View
        key={comment.id}
        style={[
          styles.commentItem,
          options?.isPinnedSectionItem && styles.commentItemPinned,
          depth > 0 && styles.commentItemNested,
          { marginLeft: depth * 16 }
        ]}
      >
        {depth > 0 ? <View style={[styles.replyCorner, isDarkMode && styles.replyCornerDark]} /> : null}
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, isDarkMode && styles.commentAuthorDark]}>{comment.author}</Text>
          {options?.isPinned ? (
            <View style={styles.pinnedByAuthorBadge}>
              <AntDesign name="pushpin" size={10} color={isDarkMode ? '#facc15' : '#ca8a04'} />
              <Text style={[styles.pinnedByAuthorBadgeText, isDarkMode && styles.pinnedByAuthorBadgeTextDark]}>
                작성자 고정
              </Text>
            </View>
          ) : null}
          <Text style={[styles.commentTime, isDarkMode && styles.commentTimeDark]}>{comment.timeAgo}</Text>
        </View>
        <Text style={[styles.commentContent, isDarkMode && styles.commentContentDark]}>{comment.content}</Text>

        <View style={styles.commentActionRow}>
          <View style={[styles.commentVoteGroup, isDarkMode && styles.feedOutlineButtonDark]}>
            <Pressable
              style={[
                styles.commentVoteLikeButton,
                commentVoteBackgroundColor && { backgroundColor: commentVoteBackgroundColor }
              ]}
              onPress={() => onPressCommentVoteUp(comment.id)}
            >
              {isCommentUpSelected ? (
                <MaterialCommunityIcons name="thumb-up" size={14} color="#ffffff" />
              ) : (
                <SimpleLineIcons
                  name={'like' as any}
                  size={13}
                  color={commentVoteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
                />
              )}
              <Text
                style={[
                  styles.commentVoteLikeText,
                  isDarkMode && styles.commentVoteLikeTextDark,
                  isCommentUpSelected && styles.commentVoteLikeTextSelected
                ]}
              >
                {comment.likes + (isCommentUpSelected ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.commentVoteDislikeButton,
                commentVoteBackgroundColor && { backgroundColor: commentVoteBackgroundColor }
              ]}
              onPress={() => onPressCommentVoteDown(comment.id)}
            >
              {isCommentDownSelected ? (
                <MaterialCommunityIcons name="thumb-down" size={14} color="#ffffff" />
              ) : (
                <SimpleLineIcons
                  name={'dislike' as any}
                  size={13}
                  color={commentVoteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
                />
              )}
            </Pressable>
          </View>

          <Pressable
            style={[styles.commentReplyButton, isDarkMode && styles.commentReplyButtonDark]}
            onPress={() => onToggleReplyComposer(comment.id)}
          >
            <MaterialCommunityIcons
              name="comment-text-outline"
              size={13}
              color={isDarkMode ? '#d1d5db' : '#475569'}
            />
            <Text style={[styles.commentReplyButtonText, isDarkMode && styles.commentReplyButtonTextDark]}>
              대댓글
            </Text>
          </Pressable>
        </View>

        {isReplyComposerVisible ? (
          <View
            style={[
              styles.replyComposer,
              isDarkMode && styles.replyComposerDark,
              isReplyFocused && (isDarkMode ? styles.replyComposerFocusedDark : styles.replyComposerFocused)
            ]}
          >
            <TextInput
              value={replyValue}
              onChangeText={(value) => onChangeReplyDraft(comment.id, value)}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor={isDarkMode ? '#8f96a3' : '#94a3b8'}
              onFocus={() => setReplyFocusedTargetId(comment.id)}
              onBlur={() =>
                setReplyFocusedTargetId((prev) => {
                  if (prev === comment.id) {
                    return null;
                  }
                  return prev;
                })
              }
              style={[styles.replyComposerInput, isDarkMode && styles.replyComposerInputDark]}
            />
            <Pressable
              disabled={!isReplySubmitEnabled}
              style={[
                styles.replyComposerSubmitButton,
                isDarkMode && styles.replyComposerSubmitButtonDark,
                isReplySubmitEnabled &&
                  (isDarkMode ? styles.replyComposerSubmitButtonActiveDark : styles.replyComposerSubmitButtonActive)
              ]}
              onPress={() => onSubmitReply(comment.id)}
            >
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isDarkMode ? (isReplySubmitEnabled ? '#ffffff' : '#9aa1ad') : '#000000'}
              />
            </Pressable>
          </View>
        ) : null}

        {visibleReplies.map((reply) => renderCommentNode(reply, depth + 1))}
        {shouldCollapseReplies && hiddenRepliesCount > 0 ? (
          <Pressable style={styles.moreRepliesButton} onPress={() => onExpandReplies(comment.id)}>
            <Text style={[styles.moreRepliesButtonText, isDarkMode && styles.moreRepliesButtonTextDark]}>
              더보기 {hiddenRepliesCount}개
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.feedColumn, showSidePanel ? styles.feedColumnWide : styles.feedColumnSingle]}>
      <View style={[styles.detailContainer, { marginTop: topInset }]}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <Image source={{ uri: getStockIconUri(selectedSymbol) }} style={styles.postSymbolIcon} />
            <View style={styles.postMetaWrap}>
              <Text style={[styles.postSymbolName, isDarkMode && styles.postSymbolNameDark]} numberOfLines={1}>
                {symbolDisplayName}
              </Text>
              <Text style={[styles.postMetaText, isDarkMode && styles.postMetaTextDark]} numberOfLines={1}>
                {post.stockName} • {post.timeAgo}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postTitle, isDarkMode && styles.postTitleDark]}>{post.title}</Text>

        {post.previewImage && previewAspectRatio ? (
          <View
            style={[
              styles.postImageFrame,
              isDarkMode && styles.postImageFrameDark,
              { aspectRatio: previewAspectRatio < 1 ? 1 : previewAspectRatio }
            ]}
          >
            <Image source={post.previewImage} style={styles.postImage} resizeMode="contain" />
          </View>
        ) : null}

        <Text style={[styles.postDescription, isDarkMode && styles.postDescriptionDark]}>{post.description}</Text>

        <View style={styles.feedActionsRow}>
          <View style={[styles.feedVoteGroup, isDarkMode && styles.feedVoteGroupDark]}>
            <Pressable
              style={[styles.feedVoteLikeButton, postVoteBackgroundColor && { backgroundColor: postVoteBackgroundColor }]}
              onPress={onPressVoteUp}
            >
              {isUpSelected ? (
                <MaterialCommunityIcons name="thumb-up" size={16} color="#ffffff" />
              ) : (
                <SimpleLineIcons
                  name={'like' as any}
                  size={15}
                  color={postVoteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
                />
              )}
              <Text
                style={[
                  styles.feedVoteLikeText,
                  isDarkMode && styles.feedVoteLikeTextDark,
                  isUpSelected && styles.feedVoteLikeTextSelected
                ]}
              >
                {post.likes + (isUpSelected ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.feedVoteDislikeButton, postVoteBackgroundColor && { backgroundColor: postVoteBackgroundColor }]}
              onPress={onPressVoteDown}
            >
              {isDownSelected ? (
                <MaterialCommunityIcons name="thumb-down" size={16} color="#ffffff" />
              ) : (
                <SimpleLineIcons
                  name={'dislike' as any}
                  size={15}
                  color={postVoteBackgroundColor ? '#ffffff' : isDarkMode ? '#e2e8f0' : '#475569'}
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
              {post.comments}
            </Text>
          </Pressable>
          <Pressable style={[styles.feedShareButton, isDarkMode && styles.feedOutlineButtonDark]}>
            <MaterialIcons name={'ios-share' as any} size={15} color={isDarkMode ? '#d1d5db' : '#475569'} />
            <Text style={[styles.feedShareButtonText, isDarkMode && styles.feedShareButtonTextDark]}>공유</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.commentComposer,
            isDarkMode && styles.commentComposerDark,
            isCommentInputFocused && (isDarkMode ? styles.commentComposerFocusedDark : styles.commentComposerFocused)
          ]}
        >
          <TextInput
            value={commentInputValue}
            onChangeText={setCommentInputValue}
            placeholder="댓글을 입력하세요..."
            placeholderTextColor={isDarkMode ? '#8f96a3' : '#94a3b8'}
            onFocus={() => setIsCommentInputFocused(true)}
            onBlur={() => setIsCommentInputFocused(false)}
            style={[styles.commentComposerInput, isDarkMode && styles.commentComposerInputDark]}
          />
          <Pressable
            disabled={!isCommentSubmitEnabled}
            style={[
              styles.commentComposerSubmitButton,
              isDarkMode && styles.commentComposerSubmitButtonDark,
              isCommentSubmitEnabled &&
                (isDarkMode
                  ? styles.commentComposerSubmitButtonActiveDark
                  : styles.commentComposerSubmitButtonActive)
            ]}
            onPress={() => setCommentInputValue('')}
          >
            <Ionicons
              name="arrow-forward"
              size={22}
              color={isDarkMode ? (isCommentSubmitEnabled ? '#ffffff' : '#9aa1ad') : '#000000'}
            />
          </Pressable>
        </View>

        <View style={styles.commentControlRow}>
          <Pressable style={[styles.sortMenuButton, isDarkMode && styles.sortMenuButtonDark]} onPress={openSortMenu}>
            <Text style={[styles.sortMenuButtonText, isDarkMode && styles.sortMenuButtonTextDark]}>
              {selectedSortOption.label}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={14}
              color={isDarkMode ? '#cbd5e1' : '#475569'}
              style={styles.sortMenuButtonIcon}
            />
          </Pressable>
          <View style={[styles.commentSearchWrap, isDarkMode && styles.commentSearchWrapDark]}>
            <MaterialCommunityIcons name="magnify" size={15} color={isDarkMode ? '#94a3b8' : '#64748b'} />
            <TextInput
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="댓글 검색"
              placeholderTextColor={isDarkMode ? '#94a3b8' : '#94a3b8'}
              style={[styles.commentSearchInput, isDarkMode && styles.commentSearchInputDark]}
            />
          </View>
        </View>

        <View
          style={[
            styles.commentSection,
            !isDarkMode && styles.pinnedCommentSectionLight,
            isDarkMode && styles.commentSectionDark
          ]}
        >
          <View style={styles.pinnedSectionTitleRow}>
            <AntDesign name="pushpin" size={12} color={isDarkMode ? '#facc15' : '#ca8a04'} />
            <Text style={[styles.commentSectionTitle, styles.pinnedSectionTitleText, isDarkMode && styles.commentSectionTitleDark]}>
              고정 댓글
            </Text>
          </View>
          <View style={[styles.pinnedCommentItem, isDarkMode && styles.pinnedCommentItemDark]}>
            {renderCommentNode(pinnedComment, 0, { isPinned: true, isPinnedSectionItem: true })}
          </View>
        </View>

        <View
          style={[
            styles.commentSection,
            !isDarkMode && styles.bestCommentSectionLight,
            isDarkMode && styles.commentSectionDark,
            isDarkMode && styles.bestCommentSectionDark
          ]}
        >
          <Text style={[styles.commentSectionTitle, isDarkMode && styles.commentSectionTitleDark]}>베스트 댓글</Text>
          {bestComments.length > 0 ? (
            bestComments.map((comment) => renderCommentNode(comment))
          ) : (
            <Text style={[styles.emptyCommentText, isDarkMode && styles.emptyCommentTextDark]}>
              검색 조건에 맞는 베스트 댓글이 없습니다.
            </Text>
          )}
        </View>

        <View style={[styles.commentSection, isDarkMode && styles.commentSectionDark]}>
          <Text style={[styles.commentSectionTitle, isDarkMode && styles.commentSectionTitleDark]}>전체 댓글</Text>
          {remainingTopLevelComments.length > 0 ? (
            remainingTopLevelComments.map((comment) => renderCommentNode(comment))
          ) : (
            <Text style={[styles.emptyCommentText, isDarkMode && styles.emptyCommentTextDark]}>
              검색 조건에 맞는 댓글이 없습니다.
            </Text>
          )}
        </View>
      </View>

      <Modal
        visible={!!sortMenuAnchor && !!sortMenuPosition}
        transparent
        animationType="fade"
        onRequestClose={closeSortMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={closeSortMenu}>
          {sortMenuPosition ? (
            <View
              style={[
                styles.sortMenuSheet,
                isDarkMode && styles.sortMenuSheetDark,
                { left: sortMenuPosition.left, top: sortMenuPosition.top }
              ]}
            >
              <View style={[styles.sortMenuHeader, isDarkMode && styles.sortMenuHeaderDark]}>
                <Text style={[styles.sortMenuHeaderText, isDarkMode && styles.sortMenuHeaderTextDark]}>정렬</Text>
              </View>
              {COMMENT_SORT_OPTIONS.map((option, index) => {
                const isSelected = option.key === commentSortKey;
                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.sortMenuItem,
                      isDarkMode && styles.sortMenuItemDark,
                      index < COMMENT_SORT_OPTIONS.length - 1 && styles.sortMenuItemDivider,
                      index < COMMENT_SORT_OPTIONS.length - 1 && isDarkMode && styles.sortMenuItemDividerDark
                    ]}
                    onPress={() => onSelectSort(option.key)}
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
    </View>
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
  detailContainer: {
    paddingHorizontal: 10,
    paddingBottom: 14
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0
  },
  postSymbolIcon: {
    width: 28,
    height: 28,
    borderRadius: 9
  },
  postMetaWrap: {
    marginLeft: 8,
    minWidth: 0
  },
  postSymbolName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  postSymbolNameDark: {
    color: '#cbd5e1'
  },
  postMetaText: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  postMetaTextDark: {
    color: '#94a3b8'
  },
  postTitle: {
    marginTop: 12,
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '800',
    color: '#0f172a'
  },
  postTitleDark: {
    color: '#f8fafc'
  },
  postImageFrame: {
    width: '100%',
    marginTop: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9dee7',
    backgroundColor: '#111827',
    overflow: 'hidden'
  },
  postImageFrameDark: {
    borderColor: '#4b5563'
  },
  postImage: {
    width: '100%',
    height: '100%'
  },
  postDescription: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 24,
    color: '#334155'
  },
  postDescriptionDark: {
    color: '#d1d5db'
  },
  feedActionsRow: {
    marginTop: 14,
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
    alignItems: 'center'
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
  commentComposer: {
    marginTop: 10,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  commentComposerDark: {
    borderColor: '#36363B'
  },
  commentComposerFocused: {
    borderColor: '#475569'
  },
  commentComposerFocusedDark: {
    borderColor: '#e8eaed'
  },
  commentComposerInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0f172a',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none'
        } as any)
      : null)
  },
  commentComposerInputDark: {
    color: '#d1d5db'
  },
  commentComposerSubmitButton: {
    width: 32,
    height: 33.5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb'
  },
  commentComposerSubmitButtonDark: {
    backgroundColor: '#f3f4f6'
  },
  commentComposerSubmitButtonActive: {
    backgroundColor: '#2563eb'
  },
  commentComposerSubmitButtonActiveDark: {
    backgroundColor: '#3b82f6'
  },
  commentControlRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center'
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
    color: '#475569'
  },
  sortMenuButtonTextDark: {
    color: '#cbd5e1'
  },
  sortMenuButtonIcon: {
    marginLeft: 4
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  sortMenuSheet: {
    position: 'absolute',
    width: SORT_MENU_WIDTH,
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
    paddingHorizontal: 10,
    backgroundColor: '#ffffff'
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
  commentSearchWrap: {
    marginLeft: 8,
    flex: 1,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentSearchWrapDark: {
    borderColor: '#4b5563',
    backgroundColor: '#1f2732'
  },
  commentSearchInput: {
    marginLeft: 5,
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#334155',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none'
        } as any)
      : null)
  },
  commentSearchInputDark: {
    color: '#e2e8f0'
  },
  commentSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  pinnedCommentSectionLight: {
    backgroundColor: '#FFF8E8'
  },
  bestCommentSectionLight: {
    backgroundColor: '#FEFBF2'
  },
  bestCommentSectionDark: {
    backgroundColor: '#2A3038'
  },
  commentSectionDark: {
    borderTopColor: '#36363B'
  },
  commentSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155'
  },
  commentSectionTitleDark: {
    color: '#e2e8f0'
  },
  pinnedSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pinnedSectionTitleText: {
    marginLeft: 6
  },
  pinnedByAuthorBadge: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  pinnedByAuthorBadgeText: {
    marginLeft: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#a16207'
  },
  pinnedByAuthorBadgeTextDark: {
    color: '#facc15'
  },
  pinnedCommentItem: {
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f5d88c',
    backgroundColor: '#fff6d9',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  pinnedCommentItemDark: {
    borderColor: '#5b4a1f',
    backgroundColor: '#2f2a1e'
  },
  commentItem: {
    marginTop: 10,
    paddingTop: 9,
    paddingBottom: 8
  },
  commentItemPinned: {
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  commentItemNested: {
    marginTop: 8
  },
  replyCorner: {
    position: 'absolute',
    left: -10,
    top: 10,
    width: 10,
    height: 10,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db'
  },
  replyCornerDark: {
    borderColor: '#4b5563'
  },
  replyIndentLine: {
    position: 'absolute',
    left: -8,
    top: 6,
    bottom: 6,
    width: 1,
    backgroundColor: '#e2e8f0'
  },
  replyIndentLineDark: {
    backgroundColor: '#36363B'
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  commentAuthorDark: {
    color: '#f8fafc'
  },
  commentTime: {
    marginLeft: 8,
    fontSize: 11,
    color: '#94a3b8'
  },
  commentTimeDark: {
    color: '#64748b'
  },
  commentContent: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155'
  },
  commentContentDark: {
    color: '#d1d5db'
  },
  commentActionRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentVoteGroup: {
    marginTop: 0,
    alignSelf: 'flex-start',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  commentReplyButton: {
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingLeft: 9,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentReplyButtonDark: {
    borderColor: '#4b5563'
  },
  commentReplyButtonText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  commentReplyButtonTextDark: {
    color: '#d1d5db'
  },
  replyComposer: {
    marginTop: 8,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingLeft: 10,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  replyComposerDark: {
    borderColor: '#36363B'
  },
  replyComposerFocused: {
    borderColor: '#475569'
  },
  replyComposerFocusedDark: {
    borderColor: '#e8eaed'
  },
  replyComposerInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0f172a',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none'
        } as any)
      : null)
  },
  replyComposerInputDark: {
    color: '#d1d5db'
  },
  replyComposerSubmitButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb'
  },
  replyComposerSubmitButtonDark: {
    backgroundColor: '#f3f4f6'
  },
  replyComposerSubmitButtonActive: {
    backgroundColor: '#2563eb'
  },
  replyComposerSubmitButtonActiveDark: {
    backgroundColor: '#3b82f6'
  },
  moreRepliesButton: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  moreRepliesButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  moreRepliesButtonTextDark: {
    color: '#d1d5db'
  },
  commentVoteLikeButton: {
    height: '100%',
    paddingLeft: 9,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentVoteLikeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  commentVoteLikeTextDark: {
    color: '#94a3b8'
  },
  commentVoteLikeTextSelected: {
    color: '#ffffff'
  },
  commentVoteDislikeButton: {
    width: 24,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyCommentText: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8'
  },
  emptyCommentTextDark: {
    color: '#64748b'
  }
});
