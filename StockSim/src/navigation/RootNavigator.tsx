import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { LoginScreen } from '../screens/LoginScreen';
import { MarketsScreen } from '../screens/MarketsScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen name="Markets" component={MarketsScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { state } = useApp();

  // Logged-out users only see the login screen.
  if (!state.username) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'StockSim' }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} options={{ title: 'Stock' }} />
    </Stack.Navigator>
  );
}
