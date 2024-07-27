import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

const PreferencesScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [approximateLocation, setApproximateLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
  };

  const handleSelectAgeGroup = (ageGroup) => {
    setSelectedAge(ageGroup);
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
  };

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSelectedGender(userData.selectedGender || '');
          setSelectedActivity(userData.selectedActivity || '');
          setSelectedAge(userData.selectedAge || '');
          setSelectedRegion(userData.selectedRegion || '');
          setApproximateLocation(userData.approximateLocation || null);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }

    getApproximateLocation();
  };

  const getApproximateLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Round to 2 decimal places for less precision (approx. 1.1km accuracy)
      const approximateLatitude = Math.round(latitude * 100) / 100;
      const approximateLongitude = Math.round(longitude * 100) / 100;

      setApproximateLocation({ latitude: approximateLatitude, longitude: approximateLongitude });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          selectedGender,
          selectedActivity,
          selectedAge,
          selectedRegion,
          approximateLocation
        }, { merge: true });

        Alert.alert('Preferences Updated', 'Your preferences and approximate location have been updated successfully.');
        navigation.navigate('Home');
      } catch (error) {
        console.error('Error updating preferences:', error);
        Alert.alert('Error', 'There was an error updating your preferences. Please try again.');
      }
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
      <Text style={styles.title}>Update Preferences</Text>
      {/* Existing preference options... */}
      
      {/* Approximate Location */}
      <Text style={styles.question}>Approximate Location:</Text>
      {approximateLocation ? (
        <Text>
          Lat: {approximateLocation.latitude}, Long: {approximateLocation.longitude}
        </Text>
      ) : (
        <Text>Location not available</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={getApproximateLocation}>
        <Text style={styles.buttonText}>Update Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save All Preferences</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flex: 1,
    maxWidth: 100,
    alignItems: 'center',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
    marginRight: 2,
    marginLeft: 2,
    padding: 3,
  },
  selectedOption: {
    backgroundColor: '#b28a68',
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

export default PreferencesScreen;
