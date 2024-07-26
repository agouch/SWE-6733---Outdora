import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, InteractionManager, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { auth, firestore } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const MatchingScreen = () => {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const swiperRef = React.useRef(null);

  const user = auth.currentUser;

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      console.log('Fetching potential matches...');
      const currentUserRef = doc(firestore, 'users', user.uid);
      const currentUserDoc = await getDoc(currentUserRef);
      const currentUserData = currentUserDoc.data();
      console.log('Current user data:', currentUserData);

      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      console.log('Total users found:', usersSnapshot.size);

      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('All users:', allUsers);

      const filteredMatches = allUsers.filter(otherUser => {
        console.log('Checking user:', otherUser.id);

        if (otherUser.id === user.uid) {
          console.log('Skipping current user');
          return false;
        }

        if (currentUserData.rejectedUsers && currentUserData.rejectedUsers.includes(otherUser.id)) {
          console.log('User already rejected');
          return false;
        }

        if (currentUserData.matches && currentUserData.matches.some(match => match.users.includes(otherUser.id))) {
          console.log('User already matched');
          return false;
        }

        console.log('User passed all filters');
        return true;
      });

      console.log('Filtered matches:', filteredMatches);

      const matchesWithUsersAndChats = filteredMatches.map(match => ({
        id: uuidv4(),
        username: match.username || 'Unknown',
        firstname: match.firstname || match.first_name || 'Unknown',
        lastname: match.lastname || match.last_name || 'Unknown',
        age: match.age || 'Unknown',
        gender: match.gender || 'Unknown',
        users: [user.uid, match.id],
        chats: []
      }));

      console.log('Matches with users and chats:', matchesWithUsersAndChats);

      InteractionManager.runAfterInteractions(() => {
        setPotentialMatches(matchesWithUsersAndChats);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching potential matches:', error);
      Alert.alert('Error', `Error fetching potential matches: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSwipeRight = async (cardIndex) => {
    if (cardIndex >= potentialMatches.length) {
      Alert.alert('No more matches', 'You have viewed all potential matches.');
      return;
    }

    const match = potentialMatches[cardIndex];

    try {
      const currentUserRef = doc(firestore, 'users', user.uid);
      const matchUserRef = doc(firestore, 'users', match.users[1]);

      // Check if the other user has already swiped right
      const matchUserDoc = await getDoc(matchUserRef);
      const matchUserData = matchUserDoc.data();

      if (matchUserData.rightSwipes && matchUserData.rightSwipes.includes(user.uid)) {
        // It's a match! Create the match for both users
        const matchId = uuidv4();
        const matchData = {
          id: matchId,
          username: match.username || 'Unknown',
          firstname: match.firstname || 'Unknown',
          lastname: match.lastname || 'Unknown',
          age: match.age || 'Unknown',
          gender: match.gender || 'Unknown',
          users: [user.uid, match.users[1]],
          chats: []
        };

        await updateDoc(currentUserRef, {
          matches: arrayUnion(matchData),
          rightSwipes: arrayRemove(match.users[1])
        });

        const currentUserDoc = await getDoc(currentUserRef);
        const currentUserData = currentUserDoc.data();
        const reciprocalMatchData = {
          id: matchId,
          username: currentUserData.username || 'Unknown',
          firstname: currentUserData.firstname || currentUserData.first_name || 'Unknown',
          lastname: currentUserData.lastname || currentUserData.last_name || 'Unknown',
          age: currentUserData.age || 'Unknown',
          gender: currentUserData.gender || 'Unknown',
          users: [match.users[1], user.uid],
          chats: []
        };

        await updateDoc(matchUserRef, {
          matches: arrayUnion(reciprocalMatchData),
          rightSwipes: arrayRemove(user.uid)
        });

        console.log('Match created:', matchData);
        console.log('Reciprocal match created:', reciprocalMatchData);

        Alert.alert(
          'Match!',
          `You matched with ${matchData.firstname} ${matchData.lastname}!`,
          [
            {
              text: 'Chat',
              onPress: () => navigation.navigate('Messages', { matchId: matchId, recipientId: match.users[1] })
            },
            {
              text: 'OK',
              onPress: () => console.log('OK Pressed'),
              style: 'cancel'
            },
          ],
          { cancelable: false }
        );
      } else {
        // Add this user to the other user's rightSwipes
        await updateDoc(currentUserRef, {
          rightSwipes: arrayUnion(match.users[1])
        });
      }
    } catch (error) {
      console.error('Error handling right swipe:', error);
      Alert.alert('Error', `Error handling right swipe: ${error.message}`);
    }
  };

  const handleSwipeLeft = async (cardIndex) => {
    if (cardIndex >= potentialMatches.length) return;

    const rejectedUser = potentialMatches[cardIndex];
    const currentUserRef = doc(firestore, 'users', user.uid);

    try {
      await updateDoc(currentUserRef, {
        rejectedUsers: arrayUnion(rejectedUser.users[1])
      });
    } catch (error) {
      console.error('Error updating rejected users:', error);
    }
  };

  const renderCard = (item) => {
    if (!item) {
      return (
        <View style={styles.card}>
          <Text style={styles.noMoreMatchesText}>No more potential matches</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.nameText}>{item.firstname} {item.lastname}, {item.age}</Text>
          <Text style={styles.usernameText}>@{item.username}</Text>
          <Text style={styles.genderText}>{item.gender}</Text>
        </View>
      </View>
    );
  };

  const handleSwipe = (direction) => {
    if (potentialMatches.length === 0) {
      Alert.alert('No more matches', 'You have viewed all potential matches.');
      return;
    }

    if (direction === 'right') {
      swiperRef.current.swipeRight();
    } else {
      swiperRef.current.swipeLeft();
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
      {potentialMatches.length > 0 ? (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={potentialMatches}
            renderCard={renderCard}
            onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
            onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
            cardIndex={0}
            backgroundColor={'#f9f9f9'}
            stackSize={3}
            cardVerticalMargin={80}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: 'red',
                    color: 'white',
                    fontSize: 24
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                    marginLeft: -20
                  }
                }
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: '#4CCC93',
                    color: 'white',
                    fontSize: 24
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                    marginLeft: 20
                  }
                }
              }
            }}
          />
        </View>
      ) : (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesText}>No potential matches found</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchPotentialMatches}
          >
            <Text style={styles.refreshButtonText}>Refresh Matches</Text>
          </TouchableOpacity>
        </View>
      )}
      {potentialMatches.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.dislikeButton]} 
            onPress={() => handleSwipe('left')}
          >
            <Icon name="times" size={30} color="#F06795" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.likeButton]} 
            onPress={() => handleSwipe('right')}
          >
            <Icon name="heart" size={30} color="#4CCC93" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  cardContent: {
    padding: 20,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#363636',
  },
  usernameText: {
    fontSize: 24,
    color: '#757575',
    marginTop: 5,
  },
  genderText: {
    fontSize: 20,
    color: '#757575',
    marginTop: 10,
  },
  noMoreMatchesText: {
    fontSize: 24,
    color: '#757575',
    textAlign: 'center',
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#757575',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: 'white',
  },
  likeButton: {
    backgroundColor: 'white',
  },
  refreshButton: {
    backgroundColor: '#b28a68',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  refreshButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MatchingScreen;
