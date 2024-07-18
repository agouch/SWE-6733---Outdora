import React, {useEffect, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import {auth, firestore} from './firebaseConfig'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

//this is the screen that the user is routed to after clicking on a match. it's a chat with the matched user
const MessagingScreen = ({ route }) => {
  const { matchId } = route.params;
  
  const [messages, setMessages] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!matchId) {
      console.error('matchId is undefined');
      return;
    }
    const q = query(
      collection(firestore, 'chats', matchId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [matchId]);
  
  const handleSend = async (message) => {
    try {
      await addDoc(collection(firestore, 'chats', matchId, 'messages'), {
        text: message,
        senderId: user.uid, 
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FlatList
            data={messages} 
            renderItem={({ item }) => <MessageBubble message={item.text} isOwnMessage={item.ownMessage} />}
            keyExtractor={(item) => item.id}
          />
          <MessageInput onSend={handleSend} autoFocus={true} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfdcd4',
  },
});

export default MessagingScreen;
