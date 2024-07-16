import React, {useEffect, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { firestore } from './firebaseConfig';
import firebase from 'firebase/app'; 

//this is the screen that the user is routed to after clicking on a match. it's essentially a chat with the matched user
const MessagingScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    const unsubscribe = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

    return () => unsubscribe();
  }, [chatId]);
  
  const handleSend = (message) => {
    firestore.collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        text: message,
        senderId: 'currentUserUID', 
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
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
