import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';

// Ensure Firebase auth token is fresh before operations
const ensureAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('No authenticated user found');
    return false;
  }
  
  try {
    // Force token refresh to ensure we have the latest token
    await getIdToken(user, true);
    console.log('Auth token refreshed before Firestore operation');
    return true;
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    return false;
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    console.error('getUserProfile called with null/empty userId');
    return null;
  }
  
  try {
    // Ensure fresh auth token before Firestore operations
    await ensureAuthToken();
    
    const userRef = doc(db, 'users', userId);
    console.log('Fetching user profile for userId:', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('User profile from Firestore:', userData);
      return userData;
    } else {
      console.log('User profile not found, creating new profile');
      // Create a new user profile if it doesn't exist
      const newUserProfile = {
        createdAt: serverTimestamp(), // Use server timestamp for consistency
        onboardingCompleted: false,
        displayName: auth.currentUser?.displayName || '',
        email: auth.currentUser?.email || '',
        education: { level: '', major: '', institution: '' },
        targetProvinces: [],
        targetScore: { twk: 85, tiu: 80, tkp: 155, total: 320 }
      };
      
      await setDoc(userRef, newUserProfile);
      console.log('Created new user profile:', newUserProfile);
      return {
        ...newUserProfile,
        createdAt: new Date() // Convert server timestamp to Date for client use
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Try to get from localStorage as fallback
    try {
      const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      if (userProfiles[userId]) {
        console.log('User profile from localStorage:', userProfiles[userId]);
        return userProfiles[userId];
      }
    } catch (localError) {
      console.error('Error retrieving from localStorage:', localError);
    }
    
    return {
      createdAt: new Date(),
      onboardingCompleted: false,
      displayName: '',
      education: { level: '', major: '', institution: '' },
      targetProvinces: [],
      targetScore: { twk: 85, tiu: 80, tkp: 155, total: 320 }
    };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  if (!userId) {
    console.error('updateUserProfile called with null/empty userId');
    return false;
  }
  
  console.log('Updating user profile with data:', profileData);
  
  // Ensure fresh auth token before Firestore operations
  const tokenRefreshed = await ensureAuthToken();
  if (!tokenRefreshed) {
    console.error('Failed to refresh auth token, may encounter permission issues');
    // Continue anyway, but log the warning
  }
  
  // Ensure onboardingCompleted is explicitly set if provided
  const dataToUpdate = {
    ...profileData,
    updatedAt: serverTimestamp() // Use server timestamp for consistency
  };
  
  // Make sure onboardingCompleted is a boolean if present
  if ('onboardingCompleted' in dataToUpdate) {
    dataToUpdate.onboardingCompleted = !!dataToUpdate.onboardingCompleted;
  }
  
  try {
    // First try to update an existing document
    const userRef = doc(db, 'users', userId);
    
    // Check current user matches the userId (security check)
    if (auth.currentUser?.uid !== userId) {
      console.error('Security violation: Attempting to update another user\'s profile');
      return false;
    }
    
    await updateDoc(userRef, dataToUpdate);
    console.log('Successfully updated user profile in Firestore');
    
    // Also update localStorage as a backup
    try {
      const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      userProfiles[userId] = {
        ...userProfiles[userId],
        ...dataToUpdate,
        updatedAt: new Date() // Convert server timestamp to Date for client use
      };
      localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
      console.log('Successfully updated user profile in localStorage');
    } catch (localError) {
      console.error('Error updating localStorage:', localError);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Might be a new document that needs to be created
    try {
      const userRef = doc(db, 'users', userId);
      const dataToCreate = {
        ...dataToUpdate,
        createdAt: new Date()
      };
      
      await setDoc(userRef, dataToCreate);
      console.log('Successfully created new user profile in Firestore');
      
      // Also update localStorage as a backup
      try {
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        userProfiles[userId] = {
          ...userProfiles[userId],
          ...dataToCreate
        };
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
        console.log('Successfully created user profile in localStorage');
      } catch (localError) {
        console.error('Error updating localStorage:', localError);
      }
      
      return true;
    } catch (innerError) {
      console.error('Error creating user profile:', innerError);
      
      // Last resort: just save to localStorage
      try {
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        userProfiles[userId] = {
          ...userProfiles[userId],
          ...dataToUpdate,
          createdAt: userProfiles[userId]?.createdAt || new Date()
        };
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
        console.log('Saved profile to localStorage only');
        return true;
      } catch (finalError) {
        console.error('Could not save to localStorage either:', finalError);
        return false;
      }
    }
  }
};
