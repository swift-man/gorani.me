import React from 'react';

import SectionDetailScreen from '../../src/screens/SectionDetailScreen';
import { sectionByKey } from '../../src/screens/types';

export default function PredictionDetailRoute() {
  return <SectionDetailScreen section={sectionByKey.prediction} />;
}
