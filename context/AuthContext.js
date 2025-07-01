import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, getIdToken, signOut } from 'firebase/auth';
import { getUserProfile, updateUserProfile } from '../utils/userProfile';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to create session cookie on the server and update auth status cookie
  const createSessionCookie = async (user) => {
    try {
      if (!user) return false;
      
      const idToken = await getIdToken(user, true);
      
      // Set client-side cookie for middleware to read auth status
      // This doesn't contain sensitive info, just authentication state
      document.cookie = `auth_status=${encodeURIComponent(JSON.stringify({
        authenticated: true,
        onboardingCompleted: false, // Default to false, will be updated when profile loaded
        timestamp: Date.now()
      }))}; path=/; max-age=86400; SameSite=Strict`;
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error creating session cookie:', error);
      return false;
    }
  };
  
  // Custom logout function that clears session cookie
  const logout = async () => {
    try {
      // Clear the auth status cookie
      document.cookie = 'auth_status=; path=/; max-age=0; SameSite=Strict';
      
      // Clear the session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
      
      // Sign out from Firebase
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };
  
  // Function to handle onboarding completion
  const completeOnboarding = async (profileData) => {
    if (!currentUser) return false;
    
    try {
      console.log('Completing onboarding with profile:', profileData);
      
      // If no profileData is provided, use a minimal default
      const dataToUpdate = profileData || { onboardingCompleted: true };
      
      // Update user profile in Firestore
      await updateUserProfile(currentUser.uid, {
        ...dataToUpdate,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      });

      // Set client-side cookies for middleware
      document.cookie = `onboardingCompleted=true; path=/; SameSite=Strict`;
      document.cookie = `onboardingCompletedStorage=true; path=/; SameSite=Strict`;
      
      // Try to update custom claims via API
      let apiSuccess = false;
      try {
        const response = await fetch('/api/auth/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          console.error('Failed to update onboarding status in Auth, but proceeding anyway');
        } else {
          console.log('Successfully updated onboarding status in Auth');
          apiSuccess = true;
        }
      } catch (apiError) {
        console.error('API error during onboarding completion:', apiError);
        // Continue despite API error - we've already set the cookies and updated Firestore
      }

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...(profileData || {}),
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      }));
      
      console.log('Onboarding completed successfully');
      
      // Return true to indicate success even if the API part failed
      // The critical parts (Firestore update and cookie setting) succeeded
      return true;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      return false; // Return false instead of throwing to make it easier for callers
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Create session cookie for middleware authentication
        await createSessionCookie(user);
        
        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Update auth status cookie with onboarding status
          if (profile) {
            document.cookie = `auth_status=${encodeURIComponent(JSON.stringify({
              authenticated: true,
              onboardingCompleted: !!profile.onboardingCompleted,
              timestamp: Date.now()
            }))}; path=/; max-age=86400; SameSite=Strict`;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          
          // Try to get from localStorage if Firestore fails
          try {
            const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
            if (userProfiles[user.uid]) {
              setUserProfile(userProfiles[user.uid]);
            }
          } catch (localError) {
            console.error('Error retrieving from localStorage:', localError);
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    needsOnboarding: !!(currentUser && (!userProfile || !userProfile.onboardingCompleted)),
    logout,
    completeOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
