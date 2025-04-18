// Function to save quiz results to Firestore
import { db } from '../utils/firebase';
import { collection, doc, getDoc, setDoc, increment } from 'firebase/firestore';

export const updateLeaderboard = async (userId, score) => {
  try {
    const leaderboardCollection = collection(db, 'leaderboard');
    const userDocRef = doc(leaderboardCollection, userId);

    // Option 1: Use setDoc with merge: true to create or update the document
    await setDoc(userDocRef, {
      userId: userId, // Consider storing userId
      totalScore: increment(score)
    }, { merge: true });

    console.log('Leaderboard updated for user:', userId);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};
