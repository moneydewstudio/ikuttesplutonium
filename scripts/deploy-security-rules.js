/**
 * Script to deploy Firestore security rules
 * 
 * This script uses the Firebase Admin SDK to deploy security rules to your Firebase project.
 * You'll need to have a service account key file to use this script.
 * 
 * Usage:
 * 1. Make sure you have a service account key file (serviceAccountKey.json)
 * 2. Run: node scripts/deploy-security-rules.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account key file exists
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: Service account key file not found at:', serviceAccountPath);
  console.log('Please download your service account key from the Firebase console:');
  console.log('1. Go to https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
  console.log('2. Select your project');
  console.log('3. Click "Generate new private key"');
  console.log('4. Save the file as "serviceAccountKey.json" in the root of your project');
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Read security rules from file
const rulesPath = path.join(__dirname, '../firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('Error: Firestore rules file not found at:', rulesPath);
  process.exit(1);
}

const rules = fs.readFileSync(rulesPath, 'utf8');

// Deploy security rules
async function deployRules() {
  try {
    await admin.securityRules().releaseFirestoreRulesetFromSource(rules);
    console.log('✅ Successfully deployed Firestore security rules!');
  } catch (error) {
    console.error('❌ Error deploying Firestore security rules:', error);
  }
}

deployRules();
