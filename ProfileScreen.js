import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Platform, Modal } from 'react-native';
import { auth, firestore, storage } from './firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [instagramUsername, setInstagramUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [location, setLocation] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFirstName(userData.firstname || '');
        setLastName(userData.lastname || '');
        setBirthdate(userData.birthdate ? new Date(userData.birthdate) : new Date());
        setAge(userData.age ? userData.age.toString() : '');
        setGender(userData.gender || '');
        setImageUri(userData.imageUrl || null);
        setLocation(userData.location || null);
        setInstagramUsername(userData.instagramUsername || '');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your photos to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await compressImage(result.assets[0].uri);
      setImageUri(compressedImage.uri);
    }
  };

  const compressImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult;
  };

  const uploadImage = async (uri) => {
    if (!uri) {
      console.log('No image URI provided');
      return null;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_images/${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);

      let imageUrl = imageUri;
      if (imageUri && !imageUri.startsWith('http')) {
        imageUrl = await uploadImage(imageUri);
      }

      const updateData = {
        firstname: firstName,
        lastname: lastName,
        birthdate: birthdate.toISOString(),
        age: calculateAge(birthdate),
        gender,
        location,
        instagramUsername,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await updateDoc(userRef, updateData);

      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', `There was an error updating your profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Profile deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const userRef = doc(firestore, 'users', user.uid);
              await deleteDoc(userRef);
              await user.delete();
              Alert.alert('Profile Deleted', 'Your profile has been deleted successfully.');
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', `There was an error deleting your profile: ${error.message}`);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };

  const handleUpdateLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }
    Alert.alert('Location Updated', 'Your location has been successfully updated.');
    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;
    
    const approximateLatitude = Math.round(latitude * 100) / 100;
    const approximateLongitude = Math.round(longitude * 100) / 100;

    const newLocation = { latitude: approximateLatitude, longitude: approximateLongitude };
    setLocation(newLocation);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Unmatch cancelled'),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.replace('Login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const genderOptions = ['Male', 'Female', 'Other'];

  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.modalOption}
              onPress={() => {
                setGender(option);
                setShowGenderModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.modalOption, styles.cancelOption]}
            onPress={() => setShowGenderModal(false)}
          >
            <Text style={styles.cancelOptionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Select Image</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor="#888"
      />
      <View style={styles.datePickerContainer}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
          <Text style={birthdate ? styles.inputText : styles.placeholderText}>
            {birthdate ? birthdate.toDateString() : 'Select Birthdate'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setBirthdate(selectedDate);
                setAge(calculateAge(selectedDate).toString());
              }
            }}
            style={styles.dateTimePicker}
            maximumDate={new Date()}
          />
        )}
      </View>
      <Text style={styles.ageText}>Age: {age}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowGenderModal(true)}
      >
        <Text style={gender ? styles.inputText : styles.placeholderText}>
          {gender || 'Select Gender'}
        </Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Instagram Username"
        value={instagramUsername}
        onChangeText={setInstagramUsername}
        placeholderTextColor="#888"
      />
      {location && (
        <Text style={styles.locationText}>Location: {location.latitude}, {location.longitude}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleUpdateLocation}>
        <Text style={styles.buttonText}>Update Location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
        <Text style={styles.buttonText}>Delete Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      {renderGenderModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: '#888',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  dateTimePicker: {
    flex: 1,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  ageText: {
    fontSize: 16,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#c3924f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#6b93d6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#4f4cb0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelOptionText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ProfileScreen;
