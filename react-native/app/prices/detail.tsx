import React from 'react';

import SectionDetailScreen from '../../src/screens/SectionDetailScreen';
import { sectionByKey } from '../../src/screens/types';

export default function PricesDetailRoute() {
  return <SectionDetailScreen section={sectionByKey.prices} />;
}
