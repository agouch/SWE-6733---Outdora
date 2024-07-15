import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

const MatchingScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const currentUserRef = doc(firestore, 'users', user.uid);
        const currentUserDoc = await getDoc(currentUserRef);

        if (currentUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          if (currentUserData.matches && currentUserData.matches.length > 0) {
            // Use the stored matches if they exist
            setMatches(currentUserData.matches);
          } else {
            // Calculate matches if they don't exist
            const usersCollection = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersCollection);

            const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filteredMatches = allUsers.filter(otherUser => {
              if (otherUser.id === user.uid) return false;

              // Ensure all necessary fields are present
              const otherGender = otherUser.gender?.toLowerCase() || '';
              const otherSelectedGender = otherUser.selectedGender?.toLowerCase() || '';
              const otherActivity = otherUser.selectedActivity || '';
              const otherAge = otherUser.selectedAge || '';
              const otherRegion = otherUser.selectedRegion || '';

              const currentGender = currentUserData.gender?.toLowerCase() || '';
              const currentSelectedGender = currentUserData.selectedGender?.toLowerCase() || '';
              const currentActivity = currentUserData.selectedActivity || '';
              const currentAge = currentUserData.selectedAge || '';
              const currentRegion = currentUserData.selectedRegion || '';

              // Mutual matching criteria
              return (
                otherGender === currentSelectedGender &&
                currentGender === otherSelectedGender &&
                otherActivity === currentActivity &&
                otherAge === currentAge &&
                otherRegion === currentRegion
              );
            });

            // Store matches in Firestore
            await setDoc(currentUserRef, { matches: filteredMatches }, { merge: true });

            setMatches(filteredMatches);
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Matches</Text>
      {matches.length > 0 ? (
        matches.map(match => (
          <View key={match.id} style={styles.match}>
            <Text style={styles.matchText}>Display Name: {match.displayName || 'N/A'}</Text>
            <Text style={styles.matchText}>Username: {match.username || 'N/A'}</Text>
            <Text style={styles.matchText}>Age: {match.age || 'N/A'}</Text>
            <Text style={styles.matchText}>Gender: {match.gender || 'N/A'}</Text>
            <Text style={styles.matchText}>Activity: {match.selectedActivity || 'N/A'}</Text>
            <Text style={styles.matchText}>Region: {match.selectedRegion || 'N/A'}</Text>
          </View>
        ))
      ) : (
        <Text>No matches found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  match: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  matchText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MatchingScreen;
