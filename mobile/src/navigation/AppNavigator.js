import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

import StockListScreen from '../screens/StockListScreen';
import PredictionsScreen from '../screens/PredictionsScreen';
import MumbaiTransitScreen from '../screens/MumbaiTransitScreen';
import NewsScreen from '../screens/NewsScreen';
import StockDetailScreen from '../screens/StockDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StocksStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.bgSecondary },
        headerTintColor: COLORS.accentGold,
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      }}
    >
      <Stack.Screen name="StockList" component={StockListScreen} options={{ title: 'NSE Stocks' }} />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} options={({ route }) => ({ title: route.params?.symbol || 'Stock' })} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Stocks') iconName = focused ? 'trending-up' : 'trending-up-outline';
          else if (route.name === 'Predictions') iconName = focused ? 'planet' : 'planet-outline';
          else if (route.name === 'Transit') iconName = focused ? 'globe' : 'globe-outline';
          else if (route.name === 'News') iconName = focused ? 'newspaper' : 'newspaper-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accentGold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.bgSecondary,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: COLORS.bgSecondary },
        headerTintColor: COLORS.accentGold,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Stocks" component={StocksStack} options={{ headerShown: false }} />
      <Tab.Screen name="Predictions" component={PredictionsScreen} options={{ title: 'KP Predictions' }} />
      <Tab.Screen name="Transit" component={MumbaiTransitScreen} options={{ title: 'Mumbai Transit' }} />
      <Tab.Screen name="News" component={NewsScreen} options={{ title: 'Market News' }} />
    </Tab.Navigator>
  );
}
