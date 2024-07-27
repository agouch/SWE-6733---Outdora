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
        headerShown: false,
      })}
      tabBarOptions={{
        activeTintColor: '#f0a500',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="MatchingTab" component={MatchingScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="MatchesTab" component={ChatListScreen} options={{ title: 'Matches' }} />
      <Tab.Screen name="PreferencesTab" component={PreferencesScreen} options={{ title: 'Preferences' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // This disables the swipe gesture for all screens
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen 
          name="Home" 
          component={HomeTabs} 
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Messages" 
          component={MessagingScreen}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}