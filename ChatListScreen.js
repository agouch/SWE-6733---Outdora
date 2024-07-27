import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './firebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserMatches = () => {
      const userRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const userMatches = userData.matches || [];

          // Remove duplicate matches
          const uniqueMatches = userMatches.filter(
            (match, index, self) =>
              index === self.findIndex((m) => m.id === match.id)
          );

          // Fetch profile images for each match
          const matchesWithImages = await Promise.all(uniqueMatches.map(async (match) => {
            try {
              const matchedUserId = match.users.find((id) => id !== user.uid);
              const matchedUserRef = doc(firestore, 'users', matchedUserId);
              const matchedUserDoc = await getDoc(matchedUserRef);

              if (matchedUserDoc.exists()) {
                const matchedUserData = matchedUserDoc.data();
                return {
                  ...match,
                  profilePicture: matchedUserData.imageUrl || null,
                  username: matchedUserData.firstname || 'Unknown User'
                };
              }
            } catch (error) {
              console.error('Error fetching matched user data:', error);
            }
            return match;
          }));

          setMatches(matchesWithImages);
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
        {item.profilePicture ? (
          <Image 
            source={{ uri: item.profilePicture }} 
            style={styles.profileImage}
            onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
          />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {item.username ? item.username[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.matchText}>
            {item.username || 'Unknown User'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#b28a68" />
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
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 50,
    color: '#333',
    textAlign: 'center',
  },
  matchList: {
    width: '100%',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#b28a68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  matchText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default ChatListScreen;