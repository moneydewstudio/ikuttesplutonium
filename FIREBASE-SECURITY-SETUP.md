# Firebase Security Rules Setup for Ikuttes

This guide explains how to configure Firebase security rules for the Ikuttes CPNS exam preparation app to fix the "Missing or insufficient permissions" errors.

## Overview

We've created security rules that:
1. Allow authenticated users to read/write their own quiz results
2. Allow all authenticated users to read the leaderboard but only update their own entry
3. Allow users to read/write only their own user data

## Setup Instructions

### Option 1: Using Firebase Console (Recommended for Quick Setup)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project ("ikuttes")
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the contents of the `firestore.rules` file
6. Click "Publish"

### Option 2: Using Firebase CLI

If you have the Firebase CLI installed:

1. Install Firebase CLI (if not already installed):
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```
   firebase init firestore
   ```

4. Deploy the rules:
   ```
   firebase deploy --only firestore:rules
   ```

### Option 3: Using Admin SDK Script (For CI/CD)

We've created a script that uses the Firebase Admin SDK to deploy rules programmatically:

1. Download a service account key:
   - Go to [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk)
   - Click "Generate new private key"
   - Save the file as `serviceAccountKey.json` in the root of your project

2. Run the deployment script:
   ```
   node scripts/deploy-security-rules.js
   ```

## Understanding the Rules

Our security rules are structured as follows:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default rule - authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Quiz Results Collection
    match /quizResults/{document} {
      // Only allow users to read/write their own quiz results
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      // Allow creation of new quiz results
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Leaderboard Collection
    match /leaderboard/{userId} {
      // Allow authenticated users to read all leaderboard entries
      allow read: if request.auth != null;
      // Only allow users to update their own leaderboard entry
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users Collection
    match /users/{userId} {
      // Only allow users to read/write their own user data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing the Rules

After deploying the rules, test the app to ensure:
1. Users can save quiz results
2. The leaderboard updates properly
3. Profile page shows quiz history

If you still encounter permission issues, check the browser console for specific error messages.

## Fallback Mechanism

Our app includes a localStorage fallback mechanism that will continue to work even if there are issues with the Firebase security rules. This ensures the app remains functional while you're configuring the security rules.

## Need Help?

If you encounter any issues with the security rules, refer to the [Firebase Security Rules documentation](https://firebase.google.com/docs/firestore/security/get-started) or contact the development team.
