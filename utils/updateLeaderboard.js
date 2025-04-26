// Function to update leaderboard with localStorage fallback
import { db } from '../utils/firebase';
import { collection, doc, getDoc, setDoc, increment } from 'firebase/firestore';

// Helper function to update leaderboard in localStorage
const updateLocalLeaderboard = (userId, score) => {
  try {
    // Get existing leaderboard or initialize empty object
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '{}');
    
    // Update user's score
    if (!leaderboard[userId]) {
      leaderboard[userId] = {
        userId: userId,
        totalScore: score
      };
    } else {
      leaderboard[userId].totalScore += score;
    }
    
    // Save back to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    console.log('Leaderboard updated in localStorage for user:', userId);
    return true;
  } catch (localError) {
    console.error('Error updating leaderboard in localStorage:', localError);
    return false;
  }
};

export const updateLeaderboard = async (userId, score) => {
  try {
    // First try to update in Firestore
    const leaderboardCollection = collection(db, 'leaderboard');
    const userDocRef = doc(leaderboardCollection, userId);

    await setDoc(userDocRef, {
      userId: userId,
      totalScore: increment(score)
    }, { merge: true });

    console.log('Leaderboard updated in Firestore for user:', userId);
    return true;
  } catch (error) {
    console.error('Error updating leaderboard in Firestore:', error);
    
    // If Firestore fails, fall back to localStorage
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.log('Falling back to localStorage for leaderboard due to permission issues');
      return updateLocalLeaderboard(userId, score);
    }
    
    // For other errors, still try localStorage
    return updateLocalLeaderboard(userId, score);
  }
};
