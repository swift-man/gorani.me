export type MainHeroItem = {
  id: string;
  image: any;
  title: string;
  description: string;
  symbol: string;
  symbolInfo: string;
};

export type FeedCardItem = {
  id: string;
  symbol: string;
  stockName: string;
  timeAgo: string;
  title: string;
  description: string;
  previewImage?: any;
  previewAspectRatio?: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
};

export const MAX_FEED_PAGE_COUNT = 8;

export const hasFeedPage = (pageNumber: number): boolean =>
  Number.isFinite(pageNumber) && pageNumber >= 0 && pageNumber < MAX_FEED_PAGE_COUNT;

export const MAIN_HERO_ITEMS: MainHeroItem[] = [
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
    previewAspectRatio: 250 / 250,
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
    previewAspectRatio: 1954 / 1578,
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
  },
  {
    id: 'feed-5',
    symbol: 'KRW-COIN5',
    stockName: '코인 5',
    timeAgo: '4시간 전',
    title: '세로 비율 이미지 첨부 게시글 테스트',
    description:
      '세로 이미지가 들어왔을 때 가로 100% 프레임 안에서 중앙 정렬되고, 좌우 빈 공간이 블러 배경으로 처리되는지 확인하는 더미 게시글입니다.',
    previewImage: require('../../assets/main_dummy/dongjak.jpg'),
    previewAspectRatio: 420 / 610,
    likes: 96,
    dislikes: 5,
    comments: 18,
    shares: 3
  }
];

export const createFeedPageItems = (pageNumber: number): FeedCardItem[] =>
  !hasFeedPage(pageNumber)
    ? []
    : MAIN_FEED_ITEMS.map((item, index) => {
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
