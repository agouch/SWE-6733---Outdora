import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';



const PreferencesScreen = ({ navigation }) => {

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
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
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        setLoading(false);
      }
      finally {
      setLoading(false);
    }
    };

    fetchUserPreferences();
  }, []);
  const handleSave = async () => {
    if (user){
      try {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          selectedGender,
          selectedActivity,
          selectedAge,
          selectedRegion
        }, { merge: true });

        Alert.alert('Preferences Updated', 'Your preferences have been updated successfully.');
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
    <View style={styles.container}>
   <Text style={styles.title}>Update Preferences</Text>
{/* Gender */}
      <Text style={styles.question}>What is your preferred gender?</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[styles.radioOption, selectedGender === 'female' && styles.selectedOption]}
          onPress={() => handleSelectGender('female')}
        >
          <Text>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedGender === 'male' && styles.selectedOption]}
          onPress={() => handleSelectGender('male')}
        >
          <Text>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedGender === 'other' && styles.selectedOption]}
          onPress={() => handleSelectGender('other')}
        >
          <Text>Other</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedText}>Selected Gender: {selectedGender}</Text>
{/* Age group */}
      <Text style={styles.question}>What is your preferred age group?</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[styles.radioOption, selectedAge === '18-25' && styles.selectedOption]}
          onPress={() => handleSelectAgeGroup('18-25')}
        >
          <Text>18-25</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedAge === '26-30' && styles.selectedOption]}
          onPress={() => handleSelectAgeGroup('26-30')}
        >
          <Text>26-30</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedAge === '30+' && styles.selectedOption]}
          onPress={() => handleSelectAgeGroup('30+')}
        >
          <Text>30+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedText}>Selected Age: {selectedAge}</Text>
{/* Activity */}
      <Text style={styles.question}>What is your favorite activity?</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[styles.radioOption, selectedActivity === 'camping' && styles.selectedOption]}
          onPress={() => handleSelectActivity('camping')}
        >
          <Text>Camping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedActivity === 'fishing' && styles.selectedOption]}
          onPress={() => handleSelectActivity('fishing')}
        >
          <Text>Fishing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedActivity === 'hiking' && styles.selectedOption]}
          onPress={() => handleSelectActivity('hiking')}
        >
          <Text>Hiking</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedText}>Selected Activity: {selectedActivity}</Text>
{/* Region */}
      <Text style={styles.question}>Where do you live?</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[styles.radioOption, selectedRegion === 'northeast' && styles.selectedOption]}
          onPress={() => handleSelectRegion('northeast')}
        >
          <Text>northeast</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedRegion === 'southeast' && styles.selectedOption]}
          onPress={() => handleSelectRegion('southeast')}
        >
          <Text>southeast</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedRegion === 'northwest' && styles.selectedOption]}
          onPress={() => handleSelectRegion('northwest')}
        >
          <Text>northwest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, selectedRegion === 'southwest' && styles.selectedOption]}
          onPress={() => handleSelectRegion('southwest')}
        >
          <Text>southwest</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedText}>Selected Region: {selectedRegion}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
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
