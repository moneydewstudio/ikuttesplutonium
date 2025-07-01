import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initAdmin() {
  const apps = getApps();
  
  if (!apps.length) {
    try {
      // Use service account if provided
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Log the start of the key to check if it's being read properly (without revealing sensitive info)
        console.log('Service account key found, first 20 chars:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY.substring(0, 20));
        
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          console.log('Successfully parsed service account JSON');
        } catch (parseError) {
          console.error('Error parsing service account JSON:', parseError);
          console.log('Service account key format issue - attempting to clean and parse...');
          
          // Try to clean the string and parse again - sometimes .env variables have extra quotes or whitespace
          const cleanedKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            .replace(/^['"]+|['"]+$/g, '') // Remove wrapping quotes
            .replace(/\\n/g, '\n'); // Fix newline characters if doubled
            
          serviceAccount = JSON.parse(cleanedKey);
          console.log('Successfully parsed service account JSON after cleaning');
        }
        
        // Initialize with the service account
        initializeApp({
          credential: cert(serviceAccount)
        });
        
        console.log('Firebase Admin initialized with service account credential');
      } else {
        // Fall back to application default credentials
        console.log('No service account key found, using application default credentials');
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin initialized with application default credentials');
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error; // Re-throw to ensure we don't silently fail
    }
  } else {
    console.log('Firebase Admin SDK already initialized, reusing existing app');
  }
  
  return {
    auth: getAuth(),
    db: getFirestore()
  };
}

// Export initialized services
const { auth, db } = initAdmin();

export { auth, db };
