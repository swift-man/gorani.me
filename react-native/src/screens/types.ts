export type SectionKey = 'prices' | 'community' | 'news' | 'profile';

export type SectionConfig = {
  key: SectionKey;
  title: string;
  webPath: string;
};

export const sections: SectionConfig[] = [
  { key: 'prices', title: '시세', webPath: '/prices' },
  { key: 'community', title: '커뮤니티', webPath: '/community' },
  { key: 'news', title: '뉴스', webPath: '/news' },
  { key: 'profile', title: '내 정보', webPath: '/profile' }
];
