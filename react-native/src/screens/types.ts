export type SectionKey = 'prices' | 'prediction' | 'news' | 'profile';

export type SectionConfig = {
  key: SectionKey;
  title: string;
  webPath: string;
};

export const sections: SectionConfig[] = [
  { key: 'prices', title: '시세', webPath: '/prices' },
  { key: 'prediction', title: '예측', webPath: '/prediction' },
  { key: 'news', title: '뉴스', webPath: '/news' },
  { key: 'profile', title: '내 정보', webPath: '/profile' }
];

export const sectionByKey: Record<SectionKey, SectionConfig> = {
  prices: { key: 'prices', title: '시세', webPath: '/prices' },
  prediction: { key: 'prediction', title: '예측', webPath: '/prediction' },
  news: { key: 'news', title: '뉴스', webPath: '/news' },
  profile: { key: 'profile', title: '내 정보', webPath: '/profile' }
};
