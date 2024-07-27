import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './LoginScreen';
import ProfileScreen from './ProfileScreen';
import RegisterScreen from './RegisterScreen';
import MessagingScreen from './MessagingScreen';
import ChatListScreen from './ChatListScreen';
import MatchingScreen from './MatchingScreen';
import PreferencesScreen from './PreferencesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'MatchingTab') {
            iconName = 'home-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person-outline';
          } else if (route.name === 'MatchesTab') {
            iconName = 'chatbubbles-outline';
          } else if (route.name === 'PreferencesTab') {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f0a500',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: 'flex',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="MatchingTab" component={MatchingScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MatchesTab" component={ChatListScreen} options={{ title: 'Matches' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="PreferencesTab" component={PreferencesScreen} options={{ title: 'Preferences' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeTabs} 
          options={{
            headerShown: false,
            gestureEnabled: false, // Disable gestures for Home screen
          }}
        />
        <Stack.Screen 
          name="Messages" 
          component={MessagingScreen}
          options={{
            headerShown: false,
            gestureEnabled: true, // Enable gestures for Messages screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
