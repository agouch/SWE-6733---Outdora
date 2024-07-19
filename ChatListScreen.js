
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { red } from '@mui/material/colors';

//This is the screen that displays all the matches for a user to message
const ChatList = ({ currentUser }) => {
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
          setMatches(matches);
        } else {
          console.log('No Matches found');
        } 

      } catch (error) {
        console.error('Error fetching user matches:', error);
        setLoading(false);
      }
      finally {
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
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('Messages', { matchId: item.id })}
                style={styles.matchItem}
              >
                <Text style={styles.matchText}>
                  {`${item.first_name} ${item.last_name}` || 'Match has no name'}
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
    marginTop: 50
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
    color: 'white'
  },
  matchText: {
    color: '#fff', 
    fontSize: 18,
  },
});

export default ChatList;
