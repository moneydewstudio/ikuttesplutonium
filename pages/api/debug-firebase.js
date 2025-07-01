// API route for testing Firebase connectivity from the server side
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
let app;
let db;
let auth;

if (!getApps().length) {
  try {
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    db = getFirestore();
    auth = getAuth();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
  db = getFirestore();
  auth = getAuth();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, userId, idToken, testData } = req.body;

  // Diagnostic output object
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    },
    tests: {},
    errors: []
  };

  try {
    // Test Firebase configuration
    diagnostics.tests.configCheck = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Test action: verify token
    if (action === 'verify-token' && idToken) {
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        diagnostics.tests.tokenVerification = {
          success: true,
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          authTime: new Date(decodedToken.auth_time * 1000).toISOString(),
          issueTime: new Date(decodedToken.iat * 1000).toISOString(),
          expiryTime: new Date(decodedToken.exp * 1000).toISOString(),
        };
      } catch (error) {
        diagnostics.tests.tokenVerification = {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        };
        diagnostics.errors.push({
          component: 'token-verification',
          error: error.message
        });
      }
    }

    // Test action: check user
    if (action === 'check-user' && userId) {
      try {
        const userRecord = await auth.getUser(userId);
        diagnostics.tests.userCheck = {
          success: true,
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          customClaims: userRecord.customClaims || {}
        };
      } catch (error) {
        diagnostics.tests.userCheck = {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        };
        diagnostics.errors.push({
          component: 'user-check',
          error: error.message
        });
      }
    }

    // Test action: test firestore
    if (action === 'test-firestore' && userId) {
      try {
        // First try to read
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        
        diagnostics.tests.firestoreRead = {
          success: true,
          exists: doc.exists,
          data: doc.exists ? doc.data() : null
        };
        
        // Then try to write
        const testData = {
          testTimestamp: new Date(),
          testField: 'Diagnostic test from API',
          serverCheck: true
        };
        
        await userRef.set(testData, { merge: true });
        
        // Read again to confirm
        const updatedDoc = await userRef.get();
        
        diagnostics.tests.firestoreWrite = {
          success: true,
          exists: updatedDoc.exists,
          data: updatedDoc.data()
        };
      } catch (error) {
        diagnostics.tests.firestore = {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        };
        diagnostics.errors.push({
          component: 'firestore-test',
          error: error.message
        });
      }
    }

    // Test action: check security rules
    if (action === 'check-rules') {
      try {
        // Try to access a collection that should be restricted
        const usersSnapshot = await db.collection('users').limit(1).get();
        
        diagnostics.tests.securityRules = {
          success: true,
          usersAccessible: !usersSnapshot.empty,
          usersCount: usersSnapshot.size
        };
      } catch (error) {
        diagnostics.tests.securityRules = {
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        };
        diagnostics.errors.push({
          component: 'security-rules',
          error: error.message
        });
      }
    }

    // Determine overall status
    diagnostics.success = diagnostics.errors.length === 0;
    diagnostics.summary = diagnostics.success 
      ? 'All Firebase diagnostics passed successfully' 
      : `Encountered ${diagnostics.errors.length} errors during diagnostics`;

    return res.status(200).json(diagnostics);
  } catch (error) {
    console.error('Error in Firebase diagnostics API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
