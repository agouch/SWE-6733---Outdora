import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { auth, firestore } from './firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '850200962229-jmhrjc2gpe1vo77r9fa0tosmm96qpd21.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    redirectUri: 'https://auth.expo.io/@parkerg16/outdora',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(userCredential => {
          createUserProfile(userCredential.user);
        })
        .catch(error => {
          console.error(error);
          setError('Google Sign-In failed');
        });
    }
  }, [response]);

  const createUserProfile = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
        });
      }

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('Error creating user profile');
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      createUserProfile(userCredential.user);
    } catch (error) {
      console.error(error);
      handleError(error);
    }
  };

  const handleError = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/user-disabled':
        setError('User account is disabled');
        break;
      case 'auth/user-not-found':
        setError('No user found with this email');
        break;
      case 'auth/wrong-password':
        setError('Invalid email or password');
        break;
      default:
        setError('An error occurred. Please try again');
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Image source={require('./assets/Outdora.png')} style={styles.logo} />
            <Text style={styles.title}>Discover Possibilities with Outdora</Text>
            <Text style={styles.subtitle}>
              Where Creativity Meets Innovation: Embark on a Journey of Limitless Exploration with Outdora
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                style={styles.viewPasswordButton}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Continue with Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dfdcd4',
    padding: 16,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0D0D',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#0D0D0D',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    width: '80%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  viewPasswordButton: {
    padding: 10,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#b28a68',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
