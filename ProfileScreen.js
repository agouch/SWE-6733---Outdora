import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { auth, firestore, storage } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferences, setPreferences] = useState('');
  const [imageUri, setImageUri] = useState('');
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
          setBirthday(new Date(userData.birthday || new Date()));
          setGender(userData.gender || '');
          setDisplayName(userData.displayName || '');
          setPreferences(userData.preferences || '');
          setImageUri(userData.imageUri || '');
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
        birthday: birthday.toISOString().split('T')[0],  // Format date as YYYY-MM-DD
        gender,
        displayName,
        preferences,
        imageUri
      }, { merge: true });

      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an error updating your profile. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(false);
    setBirthday(currentDate);
  };

  const renderDatePicker = () => {
    return (
      showDatePicker && (
        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )
    );
  };

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setImageUri(selectedImage.uri);
      }
    });
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
      <TouchableOpacity onPress={handleSelectImage} style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Select Image</Text>
        )}
      </TouchableOpacity>
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
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>Birthday: {birthday.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {renderDatePicker()}
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'male' && styles.selectedGender]}
          onPress={() => setGender('male')}
        >
          <Text style={styles.genderButtonText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'female' && styles.selectedGender]}
          onPress={() => setGender('female')}
        >
          <Text style={styles.genderButtonText}>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'other' && styles.selectedGender]}
          onPress={() => setGender('other')}
        >
          <Text style={styles.genderButtonText}>Other</Text>
        </TouchableOpacity>
      </View>
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
  inputText: {
    color: '#000',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedGender: {
    backgroundColor: '#b28a68',
  },
  genderButtonText: {
    color: '#000',
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  imagePlaceholder: {
    color: '#aaa',
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

