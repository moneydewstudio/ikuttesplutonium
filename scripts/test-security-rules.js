/**
 * Script to test Firebase security rules
 * 
 * This script tests if the security rules are working correctly by:
 * 1. Attempting to save a quiz result
 * 2. Attempting to update the leaderboard
 * 3. Attempting to read another user's data (should fail)
 * 
 * Usage: node scripts/test-security-rules.js
 */

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase.js';

// Test user credentials - replace with valid test credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Test functions
async function testSaveQuizResult(userId) {
  console.log('Testing saveQuizResult...');
  try {
    const quizResultsCollection = collection(db, 'quizResults');
    const result = await addDoc(quizResultsCollection, {
      userId,
      quizType: 'test',
      score: 8,
      timestamp: serverTimestamp()
    });
    console.log('✅ Successfully saved quiz result:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Error saving quiz result:', error.message);
    return null;
  }
}

async function testUpdateLeaderboard(userId) {
  console.log('Testing updateLeaderboard...');
  try {
    const leaderboardCollection = collection(db, 'leaderboard');
    const userDocRef = doc(leaderboardCollection, userId);
    
    await setDoc(userDocRef, {
      userId,
      totalScore: 8
    }, { merge: true });
    
    console.log('✅ Successfully updated leaderboard');
    return true;
  } catch (error) {
    console.error('❌ Error updating leaderboard:', error.message);
    return false;
  }
}

async function testAccessOtherUserData(userId) {
  console.log('Testing access to other user data (should fail)...');
  try {
    // Create a fake user ID that doesn't match the current user
    const fakeUserId = userId + '_fake';
    
    // Try to create a quiz result with a different userId
    const quizResultsCollection = collection(db, 'quizResults');
    await addDoc(quizResultsCollection, {
      userId: fakeUserId, // This should fail with our security rules
      quizType: 'test',
      score: 5,
      timestamp: serverTimestamp()
    });
    
    console.log('❌ Security rules failed: Was able to create data for another user');
    return false;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log('✅ Security rules working: Correctly denied access to other user data');
      return true;
    } else {
      console.error('❓ Unexpected error:', error.message);
      return false;
    }
  }
}

// Main test function
async function runTests() {
  console.log('Starting Firebase security rules tests...');
  
  try {
    // Sign in with test user
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const userId = userCredential.user.uid;
    console.log('Signed in as user:', userId);
    
    // Run tests
    await testSaveQuizResult(userId);
    await testUpdateLeaderboard(userId);
    await testAccessOtherUserData(userId);
    
    console.log('Tests completed!');
  } catch (error) {
    console.error('Error running tests:', error.message);
  }
}

// Run the tests
runTests();
