// Specialized debugging utility for Firebase issues
import { auth, db } from './firebase';
import { 
  signInAnonymously, 
  signOut, 
  getIdToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  query,
  limit
} from 'firebase/firestore';

// Check Firebase configuration
export const checkFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  console.log('Firebase Configuration Check:');
  const missingKeys = Object.keys(config).filter(key => !config[key]);
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase configuration keys:', missingKeys);
    return false;
  }
  
  console.log('✅ Firebase configuration keys present');
  return true;
};

// Test anonymous auth to verify Firebase project settings
export const testAnonymousAuth = async () => {
  try {
    console.log('Testing anonymous authentication...');
    // First sign out if already signed in
    await signOut(auth);
    
    // Try anonymous auth
    const result = await signInAnonymously(auth);
    console.log('✅ Anonymous auth successful:', result.user.uid);
    
    // Get token
    const token = await getIdToken(result.user);
    console.log('✅ ID token retrieved successfully (first 10 chars):', token.substring(0, 10) + '...');
    
    // Sign out
    await signOut(auth);
    console.log('✅ Sign out successful');
    return true;
  } catch (error) {
    console.error('❌ Anonymous auth test failed:', error.code, error.message);
    return false;
  }
};

// Test Firestore rules by writing to a test document
export const testFirestoreRules = async () => {
  try {
    console.log('Testing Firestore rules...');
    
    // Ensure we're authenticated
    let currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in, using anonymous auth for test');
      const result = await signInAnonymously(auth);
      currentUser = result.user;
    }
    
    console.log('Testing with user:', currentUser.uid);
    
    // Try to read a non-existent document (should be allowed)
    const testDocRef = doc(db, 'test', 'test-doc');
    console.log('Attempting to read test document...');
    const docSnap = await getDoc(testDocRef);
    
    if (!docSnap.exists()) {
      console.log('✅ Successfully verified document does not exist (expected)');
    } else {
      console.log('Document exists:', docSnap.data());
    }
    
    // Try to write to a test document
    console.log('Attempting to write test document...');
    await setDoc(testDocRef, {
      testField: 'test-value',
      timestamp: new Date(),
      userId: currentUser.uid
    });
    console.log('✅ Successfully wrote to test document');
    
    // Try to read it back
    console.log('Attempting to read test document again...');
    const updatedDocSnap = await getDoc(testDocRef);
    if (updatedDocSnap.exists()) {
      console.log('✅ Successfully read test document:', updatedDocSnap.data());
    } else {
      console.error('❌ Document does not exist after writing!');
    }
    
    // List collections (test permissions)
    console.log('Attempting to list collections...');
    try {
      const collectionsQuery = collection(db, 'users');
      const querySnapshot = await getDocs(query(collectionsQuery, limit(1)));
      console.log(`✅ Successfully queried users collection, found ${querySnapshot.size} documents`);
    } catch (error) {
      console.error('❌ Failed to query users collection:', error.code, error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firestore rules test failed:', error.code, error.message);
    return false;
  }
};

// Test user profile operations
export const testUserProfileOperations = async (userId) => {
  if (!userId && !auth.currentUser) {
    console.error('❌ No user ID provided and no user is logged in');
    return false;
  }
  
  const uid = userId || auth.currentUser.uid;
  console.log('Testing user profile operations for user:', uid);
  
  try {
    // Test reading user profile
    console.log('Attempting to read user profile...');
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      console.log('✅ Successfully read user profile:', docSnap.data());
    } else {
      console.log('User profile does not exist, will create one');
    }
    
    // Test writing to user profile
    console.log('Attempting to write to user profile...');
    await setDoc(userRef, {
      displayName: auth.currentUser?.displayName || 'Test User',
      email: auth.currentUser?.email || 'test@example.com',
      onboardingCompleted: true,
      updatedAt: new Date(),
      testField: 'debugging-value-' + Date.now()
    }, { merge: true });
    console.log('✅ Successfully wrote to user profile');
    
    // Test reading it back
    console.log('Attempting to read user profile again...');
    const updatedDocSnap = await getDoc(userRef);
    if (updatedDocSnap.exists()) {
      console.log('✅ Successfully read updated user profile:', updatedDocSnap.data());
    } else {
      console.error('❌ User profile does not exist after writing!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ User profile operations test failed:', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.error('This is a Firebase Security Rules issue. Check your rules for the users collection.');
    }
    return false;
  }
};

// Run all diagnostic tests
export const runAllDiagnostics = async () => {
  console.log('---------- FIREBASE DIAGNOSTICS START ----------');
  console.log('Time:', new Date().toISOString());
  
  // Check configuration
  const configValid = checkFirebaseConfig();
  if (!configValid) {
    console.error('❌ Firebase configuration is incomplete. Check your .env.local file.');
    return false;
  }
  
  // Check authentication
  const authWorking = await testAnonymousAuth();
  if (!authWorking) {
    console.error('❌ Firebase authentication is not working. Check your project settings in Firebase Console.');
    return false;
  }
  
  // Check Firestore rules
  const rulesWorking = await testFirestoreRules();
  if (!rulesWorking) {
    console.error('❌ Firestore rules test failed. Check your Firestore security rules.');
    return false;
  }
  
  // Check current auth state
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('Current user:', currentUser.uid);
    const profileTest = await testUserProfileOperations(currentUser.uid);
    if (!profileTest) {
      console.error('❌ User profile operations failed. This is likely a security rules issue.');
    }
  } else {
    console.log('No user currently logged in. Try running this test while logged in.');
  }
  
  console.log('---------- FIREBASE DIAGNOSTICS END ----------');
  return true;
};

// Export a standalone function for testing onboarding flow
export const testOnboardingStorage = async (userId, onboardingData) => {
  try {
    // Ensure we're authenticated
    let currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user logged in for onboarding test');
      return false;
    }
    
    console.log('Testing onboarding data storage for user:', currentUser.uid);
    console.log('Onboarding data to store:', onboardingData);
    
    // Try to write to the user profile
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      ...onboardingData,
      onboardingCompleted: true,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Successfully stored onboarding data');
    
    // Read it back
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log('✅ Retrieved stored onboarding data:', docSnap.data());
      return true;
    } else {
      console.error('❌ Failed to retrieve onboarding data after storing');
      return false;
    }
  } catch (error) {
    console.error('❌ Onboarding storage test failed:', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.error('This is a Firebase Security Rules issue. The current user does not have permission to write to their profile.');
    }
    return false;
  }
};
