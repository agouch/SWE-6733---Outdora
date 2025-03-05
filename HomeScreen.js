import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { auth } from './firebaseConfig';

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.replace('Login');
    }).catch(error => {
      console.error('Error signing out:', error);
    });
  };

  const profiles = [
    {
      id: '1',
      name: 'Jessica',
      photo: 'https://randomuser.me/api/portraits/women/1.jpg',
      status: 'Excited for the hiking trip this weekend!'
    },
    {
      id: '2',
      name: 'Patrick',
      photo: 'https://randomuser.me/api/portraits/men/2.jpg',
      status: 'Just finished a 5k run, feeling great!'
    },
    {
      id: '3',
      name: 'Julie',
      photo: 'https://randomuser.me/api/portraits/women/3.jpg',
      status: 'Planning a camping trip soon, any suggestions?'
    },
    {
      id: '4',
      name: 'Heather',
      photo: 'https://randomuser.me/api/portraits/women/4.jpg',
      status: 'Loving the new yoga class I joined!'
    },
  ];

  const renderProfile = ({ item }) => (
    <View style={styles.profileContainer}>
      <Text style={styles.profileName}>{item.name}</Text>
      <Image source={{ uri: item.photo }} style={styles.profilePhoto} />
      <Text style={styles.profileStatus}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoutButton: {
    color: '#fff',
    fontSize: 16,
  },
  profileContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  profilePhoto: {
    width: '100%',
    height: 300,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileStatus: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
