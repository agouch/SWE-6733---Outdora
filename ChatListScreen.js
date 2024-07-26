import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserMatches = () => {
      const userRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const userMatches = userData.matches || [];

          // Remove duplicate matches
          const uniqueMatches = userMatches.filter(
            (match, index, self) =>
              index === self.findIndex((m) => m.id === match.id)
          );

          setMatches(uniqueMatches);
        } else {
          console.log('No Matches found');
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchUserMatches();
    return () => unsubscribe();
  }, [user.uid]);

  const renderMatchItem = ({ item }) => {
    if (!Array.isArray(item.users)) {
      console.error('item.users is undefined or not an array:', item);
      return null;
    }

    const matchedUserId = item.users.find((id) => id !== user.uid);
    const matchedUserName = item.username; // This should be the matched user's name

    if (!matchedUserId) {
      console.error('Matched user ID not found:', item);
      return null;
    }

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Messages', { matchId: item.id, recipientId: matchedUserId })
        }
        style={styles.matchItem}
      >
        <Text style={styles.matchText}>
          {matchedUserName || 'Unknown User'}
        </Text>
      </TouchableOpacity>
    );
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
      <Text style={styles.heading}>Matches</Text>
      {matches.length > 0 ? (
        <FlatList
          style={styles.matchList}
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
        />
      ) : (
        <Text style={styles.noMatchesText}>No matches found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    marginBottom: 16,
    marginTop: 50,
  },
  matchList: {
    width: '100%',
  },
  matchItem: {
    backgroundColor: '#b28a68',
    padding: 16,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  matchText: {
    color: '#fff',
    fontSize: 18,
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatListScreen;