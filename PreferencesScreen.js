import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';

const stateGrid = [
  { name: 'Alabama', lat: [30.2, 35.0], lon: [-88.5, -84.9] },
  { name: 'Alaska', lat: [51.2, 71.5], lon: [-179.1, -129.9] },
  { name: 'Arizona', lat: [31.3, 37.0], lon: [-114.8, -109.0] },
  { name: 'Arkansas', lat: [33.0, 36.5], lon: [-94.6, -89.6] },
  { name: 'California', lat: [32.5, 42.0], lon: [-124.5, -114.1] },
  { name: 'Colorado', lat: [36.9, 41.0], lon: [-109.1, -102.0] },
  { name: 'Connecticut', lat: [40.9, 42.1], lon: [-73.7, -71.7] },
  { name: 'Delaware', lat: [38.4, 39.8], lon: [-75.8, -75.0] },
  { name: 'Florida', lat: [24.5, 31.0], lon: [-87.6, -79.8] },
  { name: 'Georgia', lat: [30.4, 35.0], lon: [-85.6, -80.8] },
  { name: 'Hawaii', lat: [18.9, 20.9], lon: [-155.9, -154.8] },
  { name: 'Idaho', lat: [42.0, 49.0], lon: [-117.2, -111.0] },
  { name: 'Illinois', lat: [36.9, 42.5], lon: [-91.5, -87.0] },
  { name: 'Indiana', lat: [37.8, 41.8], lon: [-88.1, -84.8] },
  { name: 'Iowa', lat: [40.4, 43.5], lon: [-96.7, -90.1] },
  { name: 'Kansas', lat: [36.9, 40.1], lon: [-102.1, -94.6] },
  { name: 'Kentucky', lat: [36.5, 39.1], lon: [-89.6, -81.9] },
  { name: 'Louisiana', lat: [28.9, 33.0], lon: [-94.0, -88.7] },
  { name: 'Maine', lat: [43.1, 47.5], lon: [-71.1, -66.9] },
  { name: 'Maryland', lat: [37.9, 39.7], lon: [-79.5, -75.0] },
  { name: 'Massachusetts', lat: [41.2, 42.9], lon: [-73.5, -69.9] },
  { name: 'Michigan', lat: [41.7, 48.3], lon: [-90.5, -82.4] },
  { name: 'Minnesota', lat: [43.5, 49.4], lon: [-97.2, -89.5] },
  { name: 'Mississippi', lat: [30.2, 35.0], lon: [-91.7, -88.1] },
  { name: 'Missouri', lat: [35.9, 40.6], lon: [-95.8, -89.1] },
  { name: 'Montana', lat: [44.4, 49.0], lon: [-116.1, -104.0] },
  { name: 'Nebraska', lat: [39.9, 43.0], lon: [-104.1, -95.3] },
  { name: 'Nevada', lat: [35.0, 42.0], lon: [-120.0, -114.0] },
  { name: 'New Hampshire', lat: [42.7, 45.3], lon: [-72.6, -70.7] },
  { name: 'New Jersey', lat: [38.9, 41.4], lon: [-75.6, -73.9] },
  { name: 'New Mexico', lat: [31.3, 37.0], lon: [-109.1, -103.0] },
  { name: 'New York', lat: [40.5, 45.0], lon: [-79.8, -71.9] },
  { name: 'North Carolina', lat: [33.8, 36.6], lon: [-84.3, -75.5] },
  { name: 'North Dakota', lat: [45.9, 49.0], lon: [-104.0, -96.6] },
  { name: 'Ohio', lat: [38.4, 41.9], lon: [-84.8, -80.5] },
  { name: 'Oklahoma', lat: [33.6, 37.0], lon: [-103.0, -94.4] },
  { name: 'Oregon', lat: [41.9, 46.3], lon: [-124.6, -116.5] },
  { name: 'Pennsylvania', lat: [39.7, 42.3], lon: [-80.5, -74.7] },
  { name: 'Rhode Island', lat: [41.1, 42.0], lon: [-71.9, -71.1] },
  { name: 'South Carolina', lat: [32.0, 35.2], lon: [-83.3, -78.5] },
  { name: 'South Dakota', lat: [42.5, 45.9], lon: [-104.1, -96.4] },
  { name: 'Tennessee', lat: [34.9, 36.7], lon: [-90.3, -81.6] },
  { name: 'Texas', lat: [25.8, 36.5], lon: [-106.6, -93.5] },
  { name: 'Utah', lat: [36.9, 42.0], lon: [-114.1, -109.0] },
  { name: 'Vermont', lat: [42.7, 45.0], lon: [-73.4, -71.5] },
  { name: 'Virginia', lat: [36.5, 39.5], lon: [-83.7, -75.2] },
  { name: 'Washington', lat: [45.5, 49.0], lon: [-124.8, -116.9] },
  { name: 'West Virginia', lat: [37.2, 40.7], lon: [-82.6, -77.7] },
  { name: 'Wisconsin', lat: [42.5, 47.3], lon: [-92.9, -86.8] },
  { name: 'Wyoming', lat: [40.9, 45.1], lon: [-111.1, -104.0] },
];



const getStateFromCoordinates = (latitude, longitude) => {
  for (const state of stateGrid) {
    if (
      latitude >= state.lat[0] &&
      latitude <= state.lat[1] &&
      longitude >= state.lon[0] &&
      longitude <= state.lon[1]
    ) {
      return state.name;
    }
  }
  return 'Unknown';
};

const PreferencesScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [climbingSkill, setClimbingSkill] = useState(0);
  const [hikingSkill, setHikingSkill] = useState(0);
  const [bikingSkill, setBikingSkill] = useState(0);
  const [runningSkill, setRunningSkill] = useState(0);
  const [approximateLocation, setApproximateLocation] = useState(null);
  const [state, setState] = useState('');
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
          setState(userData.state || '');
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

      const state = getStateFromCoordinates(approximateLatitude, approximateLongitude);
      setState(state);
    } catch (error) {
      console.error('Error getting location or state:', error);
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
          approximateLocation,
          state
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
      <Text style={styles.question}>State: {state}</Text>
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
    paddingTop: 70,
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
