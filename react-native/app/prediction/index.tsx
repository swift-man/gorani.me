import React from 'react';
import { router } from 'expo-router';

import SectionMainScreen from '../../src/screens/SectionMainScreen';
import { sectionByKey } from '../../src/screens/types';

export default function PredictionMainRoute() {
  return (
    <SectionMainScreen
      section={sectionByKey.prediction}
      onPressDetail={() => router.push('/prediction/detail')}
    />
  );
}
