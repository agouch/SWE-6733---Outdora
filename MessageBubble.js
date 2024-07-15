import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message, isOwnMessage }) => {
  return (
    <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#0d9fd9',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#bec3c4',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
});

export default MessageBubble;