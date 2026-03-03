import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type MainCommunityHomeProps = {
  isDarkMode: boolean;
  isMobileWeb?: boolean;
};

const MAIN_CATEGORIES = [
  { title: '인기 토론', description: '지금 가장 많이 본 커뮤니티 스레드', stat: '128개' },
  { title: '급등 이슈', description: '가격 급변 종목 이슈 모아보기', stat: '42개' },
  { title: '실시간 뉴스', description: '시장 반응이 빠른 최신 뉴스', stat: '76개' },
  { title: '공지', description: '운영/서비스 관련 업데이트', stat: '11개' }
];

export default function MainCommunityHome({ isDarkMode, isMobileWeb = false }: MainCommunityHomeProps) {
  return (
    <View style={[styles.container, isMobileWeb && styles.containerMobile]}>
      <View style={[styles.heroCard, isDarkMode && styles.heroCardDark]}>
        <Text style={[styles.heroTitle, isDarkMode && styles.heroTitleDark]}>메인 커뮤니티</Text>
        <Text style={[styles.heroDescription, isDarkMode && styles.heroDescriptionDark]}>
          종목을 선택하기 전, 전체 시장 대화를 먼저 살펴보세요.
        </Text>
      </View>

      <View style={styles.grid}>
        {MAIN_CATEGORIES.map((category) => (
          <View key={category.title} style={styles.categoryCard}>
            <Text style={[styles.categoryTitle, isDarkMode && styles.categoryTitleDark]}>
              {category.title}
            </Text>
            <Text style={[styles.categoryDescription, isDarkMode && styles.categoryDescriptionDark]}>
              {category.description}
            </Text>
            <Text style={[styles.categoryStat, isDarkMode && styles.categoryStatDark]}>
              {category.stat}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  containerMobile: {
    paddingHorizontal: 0
  },
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16
  },
  heroCardDark: {
    borderColor: '#36363B',
    backgroundColor: '#1f232a'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6
  },
  heroTitleDark: {
    color: '#f8fafc'
  },
  heroDescription: {
    fontSize: 13,
    color: '#64748b'
  },
  heroDescriptionDark: {
    color: '#cbd5e1'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  categoryCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5
  },
  categoryTitleDark: {
    color: '#e2e8f0'
  },
  categoryDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 8
  },
  categoryDescriptionDark: {
    color: '#9aa4b2'
  },
  categoryStat: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  categoryStatDark: {
    color: '#cbd5e1'
  }
});
