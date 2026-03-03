import React from 'react';

import SectionDetailScreen from '../../src/screens/SectionDetailScreen';
import { sectionByKey } from '../../src/screens/types';

export default function ProfileDetailRoute() {
  return <SectionDetailScreen section={sectionByKey.profile} />;
}
