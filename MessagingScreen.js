import React, {useState} from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import MessageInput from './components/MessageInput';
import MessageBubble from './components/MessageBubble';

const MessagingScreen = () => {
  const [messages, setMessages] = useState([]);

  const handleSend = (message) => {
    setMessages([...messages, { id: messages.length.toString(), text: message, ownMessage: true }]);
  };

  return (
    <View style={styles.container}>
        <FlatList
            data={messages} 
            renderItem={({item}) => <MessageBubble message={item.text} isOwnMessage={item.isOwnMessage} />}
            keyExtractor={(item) => item.id}
            />
            <MessageInput onSend={handleSend} />
            </View>
  );
};

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: #dfdcd4,

 },
});

export default MessagingScreen;
