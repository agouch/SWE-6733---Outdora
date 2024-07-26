import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { doc, getDoc, addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} // Fixed offset value
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            {recipient.imageUrl ? (
              <Image source={{ uri: recipient.imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>{recipient.first_name ? recipient.first_name[0] : 'U'}</Text>
              </View>
            )}
            <Text style={styles.headerText}>{recipient.first_name || 'Chat'}</Text>
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
            onScrollBeginDrag={Keyboard.dismiss} // Dismiss keyboard when scrolling starts
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message"
              onFocus={() => setKeyboardOffset(100)} // Ensure offset is set when focusing
              onBlur={() => setKeyboardOffset(0)} // Reset offset when blurring
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#DCF8C6',
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
