import React from 'react';
import { router } from 'expo-router';

import SectionMainScreen from '../../src/screens/SectionMainScreen';
import { sectionByKey } from '../../src/screens/types';

export default function ProfileMainRoute() {
  return (
    <SectionMainScreen
      section={sectionByKey.profile}
      onPressDetail={() => router.push('/profile/detail')}
    />
  );
}
