import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SectionDetailScreen from '../screens/SectionDetailScreen';
import SectionMainScreen from '../screens/SectionMainScreen';
import { sections, type SectionConfig } from '../screens/types';

type RootTabParamList = {
  prices: undefined;
  community: undefined;
  news: undefined;
  profile: undefined;
};

type SectionStackParamList = {
  Main: undefined;
  Detail: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<SectionStackParamList>();

function SectionStack({ section }: { section: SectionConfig }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ title: section.title }}>
        {({ navigation }) => (
          <SectionMainScreen
            section={section}
            onPressDetail={() => navigation.navigate('Detail')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Detail" options={{ title: `${section.title} 상세` }}>
        {() => <SectionDetailScreen section={section} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function NativeNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        {sections.map((section) => (
          <Tab.Screen
            key={section.key}
            name={section.key as keyof RootTabParamList}
            options={{ title: section.title }}
          >
            {() => <SectionStack section={section} />}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
