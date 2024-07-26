import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmKF5H6PbIf2ZwdyLK88-D8mLZ9VCN1gM",
  authDomain: "outdora.firebaseapp.com",
  projectId: "outdora",
  storageBucket: "outdora.appspot.com",  // This matches your provided storage bucket
  messagingSenderId: "850200962229",
  appId: "1:850200962229:web:8bf25d7fec50595a244afc",
  measurementId: "G-C079T6LTR9"
};

let firebaseApp;
let auth;
let firestore;
let storage;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  firebaseApp = getApps()[0];
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
}

export { firebaseApp, auth, firestore, storage };