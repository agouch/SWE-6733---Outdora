import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.first_name || '');
          setLastName(userData.last_name || '');
          setUsername(userData.username || '');
          setAge(userData.age || '');
          setBirthday(userData.birthday || '');
          setGender(userData.gender || '');
          setDisplayName(userData.displayName || '');
          setPreferences(userData.preferences || '');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        first_name: firstName,
        last_name: lastName,
        username,
        age,
        birthday,
        gender,
        displayName,
        preferences
      }, { merge: true });

      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an error updating your profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Update Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#aaa"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#aaa"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#aaa"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Birthday (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        value={birthday}
        onChangeText={setBirthday}
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        placeholderTextColor="#aaa"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        placeholderTextColor="#aaa"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferences"
        placeholderTextColor="#aaa"
        value={preferences}
        onChangeText={setPreferences}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#b28a68',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
