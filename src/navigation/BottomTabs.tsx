import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SearchScreen from '../screens/SearchScreen';
import FavouriteScreen from '../screens/FavouriteScreen';
import SubscribeScreen from '../screens/SubscribeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grayLight,
        tabBarStyle: { backgroundColor: Colors.white },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Favourite') iconName = 'heart';
          else if (route.name === 'Subscribe') iconName = 'ribbon';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favourite" component={FavouriteScreen} />
      <Tab.Screen name="Subscribe" component={SubscribeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
