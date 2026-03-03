import React from 'react';
import { router } from 'expo-router';

import SectionMainScreen from '../../src/screens/SectionMainScreen';
import { sectionByKey } from '../../src/screens/types';

export default function NewsMainRoute() {
  return (
    <SectionMainScreen
      section={sectionByKey.news}
      onPressDetail={() => router.push('/news/detail')}
    />
  );
}
