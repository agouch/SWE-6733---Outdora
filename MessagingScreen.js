import React, { useEffect, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

const MessagingScreen = ({ route }) => {
  const { matchId, recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!matchId || !user || !recipientId) {
      console.error('Required parameters are undefined');
      return;
    }

    console.log("Current User:", user);
    console.log("Recipient ID:", recipientId);

    const userRef = doc(firestore, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const match = userData.matches ? userData.matches.find(match => match.id === matchId) : null;
        if (match && match.chats) {
          setMessages(match.chats);
        }
      }
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [matchId, user.uid, recipientId]);

  const handleSend = async (message) => {
    if (!message.trim()) return;

    if (!recipientId) {
      console.error('Recipient ID is undefined');
      Alert.alert('Error', 'Recipient ID is undefined');
      return;
    }

    const newMessage = {
      id: uuidv4(),
      senderId: user.uid,
      text: message,
      timestamp: new Date().toISOString()
    };

    try {
      const userRef = doc(firestore, 'users', user.uid);
      const recipientRef = doc(firestore, 'users', recipientId);

      const userDoc = await getDoc(userRef);
      const recipientDoc = await getDoc(recipientRef);

      if (userDoc.exists() && recipientDoc.exists()) {
        const userData = userDoc.data();
        const recipientData = recipientDoc.data();

        const updateMatchMessages = (matches, matchId, newMessage) => {
          if (!Array.isArray(matches)) matches = [];
          return matches.map(match => {
            if (match.id === matchId) {
              return {
                ...match,
                chats: [...match.chats, newMessage]
              };
            }
            return match;
          });
        };

        const updatedUserMatches = updateMatchMessages(userData.matches, matchId, newMessage);
        const updatedRecipientMatches = updateMatchMessages(recipientData.matches, matchId, newMessage);

        await updateDoc(userRef, {
          matches: updatedUserMatches
        });

        await updateDoc(recipientRef, {
          matches: updatedRecipientMatches
        });

        // We don't need to manually update the messages state here
        // as the onSnapshot listener will handle this for us
      }
    } catch (error) {
      console.error("Error adding message: ", error);
      Alert.alert("Error", `Error adding message: ${error.message}`);
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
            renderItem={({ item }) => <MessageBubble message={item.text} isOwnMessage={item.senderId === user.uid} />}
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