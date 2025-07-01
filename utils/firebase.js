// utils/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase - use singleton pattern to prevent duplicate initialization
let firebaseApp;

// Check if Firebase app is already initialized
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0]; // Use the existing app if already initialized
}

// Initialize services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Set persistence to LOCAL to ensure token persistence
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Firebase Auth persistence set to LOCAL'))
    .catch(error => console.error('Error setting auth persistence:', error));
    
  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db)
    .then(() => console.log('Firestore persistence enabled'))
    .catch(error => {
      if (error.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firestore persistence unavailable - multiple tabs open');
      } else if (error.code === 'unimplemented') {
        // The current browser does not support persistence
        console.warn('Firestore persistence unavailable - unsupported browser');
      }
    });
} catch (error) {
  console.error('Error initializing Firebase persistence:', error);
}

// Check if user is authenticated and log status
onAuthStateChanged(auth, user => {
  if (user) {
    // User is signed in
    console.log('User is authenticated:', user.uid);
    user.getIdToken(true)
      .then(token => console.log('Auth token refreshed'))
      .catch(error => console.error('Error refreshing token:', error));
  } else {
    // User is signed out
    console.log('No user authenticated');
  }
});