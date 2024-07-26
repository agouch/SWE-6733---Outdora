import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { auth, firestore, storage } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const ProfileScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setAge(userData.age ? userData.age.toString() : '');
        setGender(userData.gender || '');
        setImageUri(userData.imageUrl || null);
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
        age: parseInt(age),
        gender,
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
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
