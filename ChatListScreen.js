import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserMatches = async () => {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const matches = userData.matches;

          // Remove duplicate matches
          const uniqueMatches = matches.filter(
            (match, index, self) =>
              index === self.findIndex((m) => m.id === match.id)
          );

          setMatches(uniqueMatches);
        } else {
          console.log('No Matches found');
        }
      } catch (error) {
        console.error('Error fetching user matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMatches();
  }, [user.uid]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Matches</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          style={styles.matchList}
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {

            if (!Array.isArray(item.users)) {
              console.error('item.users is undefined or not an array:', item);
              return null;
            }

            const recipientId = item.users.find((id) => id !== user.uid);

            if (!recipientId) {
              console.error('Recipient ID not found:', item);
              return null;
            }


            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Messages', { matchId: item.id, recipientId })
                }
                style={styles.matchItem}
              >
                <Text style={styles.matchText}>
                  {item.username || 'Match has no username'}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
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
});

export default ChatListScreen;
