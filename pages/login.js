import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getUserProfile } from '../utils/userProfile';
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Set the session cookie via API
      await createSessionCookie(idToken);
      
      // Check onboarding status and redirect
      await checkOnboardingAndRedirect(user.uid);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      // Sign in with Google
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Set the session cookie via API
      await createSessionCookie(idToken);
      
      // Check onboarding status and redirect
      await checkOnboardingAndRedirect(user.uid);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
    }
  };
  
  // Function to create a session cookie via the API
  const createSessionCookie = async (idToken) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const data = await response.json();
      
      // Set client-side cookies for middleware
      document.cookie = `auth=true; path=/; SameSite=Strict`;
      
      // If onboarding is completed, set that cookie too
      if (data.onboardingCompleted) {
        document.cookie = `onboardingCompleted=true; path=/; SameSite=Strict`;
        document.cookie = `onboardingCompletedStorage=true; path=/; SameSite=Strict`;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };
  
  // Function to check onboarding status and redirect accordingly
  const checkOnboardingAndRedirect = async (userId) => {
    try {
      // Get user profile from Firestore
      const userProfile = await getUserProfile(userId);
      
      // Determine redirect based on onboarding status
      if (userProfile && userProfile.onboardingCompleted) {
        console.log('User has completed onboarding, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('User needs to complete onboarding, redirecting to onboarding');
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding if there's an error
      router.push('/onboarding');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Masuk</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Masuk
          </button>
          <Link href="/register" className="inline-block align-baseline font-bold text-sm text-indigo-500 hover:text-indigo-800 dark:text-indigo-300">
            Daftar
          </Link>
        </div>
      </form>
       <button onClick={handleGoogleSignIn} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Sign In With Google</button>
    </div>
  );
};

export default Login;