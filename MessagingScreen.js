import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, StatusBar, Alert } from 'react-native';
import { doc, getDoc, addDoc, updateDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, firestore, storage } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        setRecipient(recipientDoc.data());
      } else {
        console.log('Recipient does not exist');
      }
    } catch (error) {
      console.error('Error fetching recipient details:', error);
    }
  };

  const sendMessage = async (text, imageUrl = null) => {
    if (text.trim() === '' && !imageUrl) return;

    try {
      await addDoc(collection(firestore, 'matches', matchId, 'messages'), {
        text,
        imageUrl,
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

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your photos to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      await sendImageMessage(uri);
    }
  };

  const sendImageMessage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `messages/${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      await sendMessage('', downloadUrl);
    } catch (error) {
      console.error('Error sending image message:', error);
    }
  };

  const renderMessageItem = ({ item }) => {
    if (item.imageUrl) {
      return (
        <View style={[styles.message, item.senderId === user.uid ? styles.myMessage : styles.theirMessage]}>
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
        </View>
      );
    } else {
      return (
        <View style={[styles.message, item.senderId === user.uid ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      );
    }
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
              <Text style={styles.headerText}>{recipient.firstname || 'Chat'}</Text>
              <TouchableOpacity style={styles.unmatchButton} onPress={handleUnmatch}>
                <Text style={styles.unmatchButtonText}>Unmatch</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              onScrollBeginDrag={Keyboard.dismiss}
            />
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                <Ionicons name="image" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message"
                placeholderTextColor="#888"
                onFocus={() => setKeyboardOffset(100)}
                onBlur={() => setKeyboardOffset(0)}
              />
              <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(messageText)}>
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  imagePickerButton: {
    marginRight: 10,
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
