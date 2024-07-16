import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import PreferencesScreen, {Preferences} from './PreferencesScreen';
import RegisterScreen from './RegisterScreen';
import MessagingScreen from './MessagingScreen';
import ChatListScreen from './ChatListScreen';
import MatchingScreen from './MatchingScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Messages" component={MessagingScreen} />
        <Stack.Screen name="Matching" component={MatchingScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
