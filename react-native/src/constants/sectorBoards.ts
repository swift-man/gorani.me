export type SectorBoardItem = {
  id: string;
  name: string;
  industries: string;
  description: string;
  popularity: number;
};

const BASE_SECTOR_BOARD_ITEMS: SectorBoardItem[] = [
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

const MOBILE_SECTOR_IDS = new Set([
  'sector-battery',
  'sector-semiconductor',
  'sector-it',
  'sector-crypto',
  'sector-bio-ai',
  'sector-ethereum',
  'sector-healthcare',
  'sector-financial'
]);

export const createInitialSectorBoardItems = (): SectorBoardItem[] =>
  BASE_SECTOR_BOARD_ITEMS.map((item) => ({ ...item }));

export const getMobileSectorBoardItems = (): SectorBoardItem[] =>
  BASE_SECTOR_BOARD_ITEMS.filter((item) => MOBILE_SECTOR_IDS.has(item.id)).map((item) => ({
    ...item
  }));

export const sortSectorBoardItemsByPopularity = <T extends SectorBoardItem>(
  items: readonly T[]
): T[] =>
  [...items].sort((a, b) => {
    if (b.popularity !== a.popularity) return b.popularity - a.popularity;
    return a.name.localeCompare(b.name);
  });
