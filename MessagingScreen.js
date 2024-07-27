import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, StatusBar, Alert } from 'react-native';
import { doc, getDoc, addDoc, updateDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this package if you haven't already

const MessagingScreen = ({ route, navigation }) => {
  const { matchId, recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [recipient, setRecipient] = useState({});
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const user = auth.currentUser;

  useEffect(() => {
    fetchRecipientDetails();
    const q = query(collection(firestore, 'matches', matchId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchRecipientDetails = async () => {
    try {
      const recipientRef = doc(firestore, 'users', recipientId);
      const recipientDoc = await getDoc(recipientRef);
      if (recipientDoc.exists()) {
        console.log('Recipient data:', recipientDoc.data());
        setRecipient(recipientDoc.data());
      } else {
        console.log('Recipient does not exist');
      }
    } catch (error) {
      console.error('Error fetching recipient details:', error);
    }
  };

  const sendMessage = async () => {
    if (messageText.trim() === '') return;

    try {
      await addDoc(collection(firestore, 'matches', matchId, 'messages'), {
        text: messageText,
        createdAt: new Date(),
        senderId: user.uid,
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUnmatch = async () => {
    Alert.alert(
      'Confirm Unmatch',
      'Are you sure you want to unmatch this person?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Unmatch cancelled'),
          style: 'cancel',
        },
        {
          text: 'Unmatch',
          onPress: async () => {
            try {
              const userRef = doc(firestore, 'users', user.uid);
              const recipientRef = doc(firestore, 'users', recipientId);

              const userDoc = await getDoc(userRef);
              const recipientDoc = await getDoc(recipientRef);

              if (userDoc.exists() && recipientDoc.exists()) {
                const userData = userDoc.data();
                const recipientData = recipientDoc.data();

                const updatedUserMatches = userData.matches.filter(match => match.id !== matchId);
                const updatedRecipientMatches = recipientData.matches.filter(match => match.id !== matchId);

                await updateDoc(userRef, { matches: updatedUserMatches });
                await updateDoc(recipientRef, { matches: updatedRecipientMatches });

                Alert.alert('Unmatched', 'You have successfully unmatched this person.');
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error unmatching:', error);
              Alert.alert('Error', `There was an error unmatching: ${error.message}`);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              {recipient.imageUrl ? (
                <Image source={{ uri: recipient.imageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>{recipient.first_name ? recipient.first_name[0] : 'U'}</Text>
                </View>
              )}
              <Text style={styles.headerText}>{recipient.first_name || 'Chat'}</Text>
              <TouchableOpacity style={styles.unmatchButton} onPress={handleUnmatch}>
                <Text style={styles.unmatchButtonText}>Unmatch</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <View style={[styles.message, item.senderId === user.uid ? styles.myMessage : styles.theirMessage]}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              onScrollBeginDrag={Keyboard.dismiss}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message"
                placeholderTextColor="#888"
                onFocus={() => setKeyboardOffset(100)}
                onBlur={() => setKeyboardOffset(0)}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 18,
    color: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unmatchButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  unmatchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#99CAFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MessagingScreen;