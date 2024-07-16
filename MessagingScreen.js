import React, { useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';

const MessagingScreen = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = (message) => {
    setMessages([...messages, { id: messages.length.toString(), text: message, ownMessage: true }]);
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
