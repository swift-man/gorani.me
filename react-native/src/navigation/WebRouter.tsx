import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from 'react-router-dom';

import WebTopBar from '../components/WebTopBar';
import SectionDetailScreen from '../screens/SectionDetailScreen';
import SectionMainScreen from '../screens/SectionMainScreen';
import { sections } from '../screens/types';

function WebScreenContainer() {
  const navigate = useNavigate();

  return (
    <View style={styles.content}>
      <Routes>
        <Route path="/" element={<Navigate to="/prices" replace />} />
        {sections.map((section) => (
          <Route
            key={section.key}
            path={section.webPath}
            element={
              <SectionMainScreen
                section={section}
                onPressDetail={() => navigate(`${section.webPath}/detail`)}
              />
            }
          />
        ))}
        <Route path="/:section/detail" element={<WebDetailRoute />} />
      </Routes>
    </View>
  );
}

function WebDetailRoute() {
  const { section } = useParams<{ section: string }>();
  const matched = sections.find((item) => item.key === section);

  if (!matched) {
    return <Navigate to="/prices" replace />;
  }

  return <SectionDetailScreen section={matched} />;
}

export default function WebRouter() {
  return (
    <BrowserRouter>
      <View style={styles.root}>
        <WebTopBar />
        <WebScreenContainer />
      </View>
    </BrowserRouter>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  content: {
    flex: 1
  }
});
