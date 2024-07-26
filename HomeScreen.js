import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig';

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.replace('Login');
    }).catch(error => {
      console.error('Error signing out:', error);
    });
  };
}

const styles = StyleSheet.create({

});


