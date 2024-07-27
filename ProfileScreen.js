import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Platform } from 'react-native';
import { auth, firestore, storage } from './firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

const ProfileScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(null);

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
      }
      if (!userDoc.data().location) {
        getAndSetLocation();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const getAndSetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;
    
    // Round to 2 decimal places for less precision (approx. 1.1km accuracy)
    const approximateLatitude = Math.round(latitude * 100) / 100;
    const approximateLongitude = Math.round(longitude * 100) / 100;

    const newLocation = { latitude: approximateLatitude, longitude: approximateLongitude };
    setLocation(newLocation);
  };

  const handleUpdateLocation = () => {
    Alert.alert(
      "Update Location",
      "Do you want to update your location?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: () => getAndSetLocation()
        }
      ]
    );
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
      [{ resize: { width: 800 } }], // Adjust the width as needed
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
      console.log('Starting image upload process...');
      console.log('Image URI:', uri);

      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('Blob created');

      const filename = `profile_images/${user.uid}_${Date.now()}.jpg`;
      console.log('Filename:', filename);

      console.log('Storage object:', storage);
      const storageRef = ref(storage, filename);
      console.log('Storage reference created');

      console.log('Uploading image to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, blob);
      console.log('Upload completed successfully');

      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('File available at', downloadUrl);

      return downloadUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);

      let imageUrl = imageUri;
      if (imageUri && !imageUri.startsWith('http')) {
        console.log('Attempting to upload new image...');
        try {
          imageUrl = await uploadImage(imageUri);
          console.log('Image upload result:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', `There was an error uploading the image: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      const updateData = {
        firstname: firstName,
        lastname: lastName,
        birthdate: birthdate.toISOString(),
        age: calculateAge(birthdate),
        gender,
        location,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      console.log('Updating user document with:', updateData);
      await updateDoc(userRef, updateData);

      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error stack:', error.stack);
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
    const birthDate = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }

    return age;
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthdate(selectedDate);
      setAge(calculateAge(selectedDate));
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
        <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
          <Text style={styles.dateText}>{birthdate ? birthdate.toDateString() : 'Select Birthdate'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
            style={styles.dateTimePicker}
          />
        )}
      </View>
      <Text style={styles.ageText}>Age: {age}</Text>
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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
  dateText: {
    fontSize: 17,
    color: '#888',
  },
  dateTimePicker: {
    flex: 1,
    marginLeft: 10,
  },
  ageText: {
    fontSize: 17,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 17,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ProfileScreen;