import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';

const PreferencesScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [climbingSkill, setClimbingSkill] = useState(0);
  const [hikingSkill, setHikingSkill] = useState(0);
  const [bikingSkill, setBikingSkill] = useState(0);
  const [runningSkill, setRunningSkill] = useState(0);
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
          setClimbingSkill(userData.climbingSkill || 0);
          setHikingSkill(userData.hikingSkill || 0);
          setBikingSkill(userData.bikingSkill || 0);
          setRunningSkill(userData.runningSkill || 0);
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
          climbingSkill,
          hikingSkill,
          bikingSkill,
          runningSkill,
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

  const renderSlider = (label, value, setValue, min, max, step, markers) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>{label}: {value}</Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={setValue}
        minimumTrackTintColor="#b28a68"
        maximumTrackTintColor="#000000"
      />
      <View style={styles.markerContainer}>
        {markers.map(marker => (
          <Text key={marker} style={styles.marker}>{marker}</Text>
        ))}
      </View>
    </View>
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
      <Text style={styles.title}>Update Preferences</Text>

      {/* Gender Preference */}
      <Text style={styles.question}>Preferred Gender:</Text>
      <View style={styles.optionContainer}>
        {['Male', 'Female', 'Other'].map(gender => (
          <TouchableOpacity
            key={gender}
            style={[styles.radioOption, selectedGender === gender && styles.selectedOption]}
            onPress={() => handleSelectGender(gender)}
          >
            <Text style={{ color: selectedGender === gender ? '#fff' : '#000' }}>{gender}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity Preference */}
      <Text style={styles.question}>Preferred Activity:</Text>
      <View style={styles.optionContainer}>
        {['Hiking', 'Biking', 'Climbing', 'Running'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[styles.radioOption, selectedActivity === activity && styles.selectedOption]}
            onPress={() => handleSelectActivity(activity)}
          >
            <Text style={{ color: selectedActivity === activity ? '#fff' : '#000' }}>{activity}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Age Preference */}
      <Text style={styles.question}>Preferred Age Group:</Text>
      <View style={styles.optionContainer}>
        {['18-25', '26-35', '36-45', '46+'].map(age => (
          <TouchableOpacity
            key={age}
            style={[styles.radioOption, selectedAge === age && styles.selectedOption]}
            onPress={() => handleSelectAgeGroup(age)}
          >
            <Text style={{ color: selectedAge === age ? '#fff' : '#000' }}>{age}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skill Level Sliders */}
      {renderSlider('Climbing Skill (V-scale)', climbingSkill, setClimbingSkill, 0, 10, 1, ['V0', 'V2', 'V4', 'V6', 'V8', 'V10'])}
      {renderSlider('Hiking Skill (Beginner-Expert)', hikingSkill, setHikingSkill, 0, 10, 1, ['Beginner', 'Intermediate', 'Expert'])}
      {renderSlider('Biking Skill (Beginner-Expert)', bikingSkill, setBikingSkill, 0, 10, 1, ['Beginner', 'Intermediate', 'Expert'])}
      {renderSlider('Running Skill (Beginner-Expert)', runningSkill, setRunningSkill, 0, 10, 1, ['Beginner', 'Intermediate', 'Expert'])}

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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radioOption: {
    flex: 1,
    maxWidth: 120,
    alignItems: 'center',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#b28a68',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
  },
  markerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  marker: {
    fontSize: 12,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#b28a68',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
