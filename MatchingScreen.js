import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, InteractionManager } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

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
          if (currentUserData.matches && Array.isArray(currentUserData.matches) && currentUserData.matches.length > 0) {
            InteractionManager.runAfterInteractions(() => {
              setMatches(currentUserData.matches);
              setLoading(false);
            });
          } else {
            const usersCollection = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersCollection);

            const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const filteredMatches = allUsers.filter(otherUser => {
              if (otherUser.id === user.uid) return false;

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

              return (
                otherGender === currentSelectedGender &&
                currentGender === otherSelectedGender &&
                otherActivity === currentActivity &&
                otherAge === currentAge &&
                otherRegion === currentRegion
              );
            });

            const matchesWithUsersAndChats = filteredMatches.map(match => ({
              id: uuidv4(),
              username: match.username,
              users: [user.uid, match.id],
              chats: []
            }));

            // Update current user's matches
            await updateDoc(currentUserRef, { matches: matchesWithUsersAndChats }, { merge: true });

            // Update matches for other users
            for (const match of matchesWithUsersAndChats) {
              await updateMatchForOtherUser(match.users[1], {
                id: match.id,
                username: currentUserData.username || user.email,
                users: [match.users[1], user.uid],
                chats: []
              });
            }

            InteractionManager.runAfterInteractions(() => {
              setMatches(matchesWithUsersAndChats);
              setLoading(false);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        Alert.alert('Error', `Error fetching matches: ${error.message}`);
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user.uid]);

  const updateMatchForOtherUser = async (otherUserId, matchData) => {
    try {
      const otherUserRef = doc(firestore, 'users', otherUserId);
      const otherUserDoc = await getDoc(otherUserRef);

      if (otherUserDoc.exists()) {
        const otherUserData = otherUserDoc.data();
        const existingMatches = otherUserData.matches || [];

        // Check if the match already exists
        const matchExists = existingMatches.some(match => match.id === matchData.id);

        if (!matchExists) {
          await updateDoc(otherUserRef, {
            matches: arrayUnion(matchData)
          });
        }
      }
    } catch (error) {
      console.error(`Error updating match for user ${otherUserId}:`, error);
    }
  };

  const handleMatchClick = async (match) => {
    const currentUserRef = doc(firestore, 'users', user.uid);
    const matchUserRef = doc(firestore, 'users', match.id);

    try {
      const currentUserDoc = await getDoc(currentUserRef);
      const matchUserDoc = await getDoc(matchUserRef);

      if (!currentUserDoc.exists()) {
        console.error(`Current user document does not exist: ${user.uid}`);
        Alert.alert('Error', `Current user document does not exist: ${user.uid}`);
        return;
      }

      if (!matchUserDoc.exists()) {
        console.error(`Match user document does not exist: ${match.id}`);
        Alert.alert('Error', `Match user document does not exist: ${match.id}`);
        return;
      }

      const currentUserData = currentUserDoc.data();
      const matchUserData = matchUserDoc.data();

      // Initialize matches array if it doesn't exist
      currentUserData.matches = currentUserData.matches || [];
      matchUserData.matches = matchUserData.matches || [];

      // Check if the match already exists for the current user
      const matchExistsForCurrentUser = currentUserData.matches.some(
        (m) => m.id === match.id
      );

      // Check if the match already exists for the matched user
      const matchExistsForMatchUser = matchUserData.matches.some(
        (m) => m.id === user.uid
      );

      if (matchExistsForCurrentUser && matchExistsForMatchUser) {
        console.log('Match already exists for both users');
        const existingMatch = currentUserData.matches.find(m => m.id === match.id);
        navigation.navigate('Messages', { matchId: existingMatch.id, recipientId: match.id });
        return;
      }

      const matchId = uuidv4();

      const matchData = {
        id: matchId,
        username: match.username,
        users: [user.uid, match.id],
        chats: []
      };

      const reciprocalMatchData = {
        id: matchId,
        username: user.displayName || user.email,
        users: [match.id, user.uid],
        chats: []
      };

      console.log('Current User Ref:', currentUserRef);
      console.log('Match User Ref:', matchUserRef);
      console.log('Match Data:', matchData);
      console.log('Reciprocal Match Data:', reciprocalMatchData);

      // Update current user's matches if not already present
      if (!matchExistsForCurrentUser) {
        await updateDoc(currentUserRef, {
          matches: arrayUnion(matchData)
        });
        console.log('Match added to current user:', user.uid);
      }

      // Update matched user's matches if not already present
      if (!matchExistsForMatchUser) {
        await updateDoc(matchUserRef, {
          matches: arrayUnion(reciprocalMatchData)
        });
        console.log('Match added to matched user:', match.id);
      }

      navigation.navigate('Messages', { matchId, recipientId: match.id });
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', `Error creating match: ${error.message}`);
    }
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity style={styles.match} onPress={() => handleMatchClick(item)}>
      <Text style={styles.matchText}>Username: {item.username || 'N/A'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No matches found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  match: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  matchText: {
    fontSize: 16,
  },
});

export default MatchingScreen;