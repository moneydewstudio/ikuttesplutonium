// Function to save quiz results to Firestore with localStorage fallback
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to save to localStorage
const saveToLocalStorage = (userId, quizType, score) => {
  try {
    // Get existing results or initialize empty array
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    // Add new result
    existingResults.push({
      id: `local_${Date.now()}`,
      userId,
      quizType,
      score,
      timestamp: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
    console.log('Quiz result saved to localStorage!');
    return true;
  } catch (localError) {
    console.error('Error saving to localStorage:', localError);
    return false;
  }
};

export const saveQuizResult = async (userId, quizType, score) => {
  try {
    // First try to save to Firestore
    const quizResultsCollection = collection(db, 'quizResults');
    await addDoc(quizResultsCollection, {
      userId,
      quizType,
      score,
      timestamp: serverTimestamp()
    });
    console.log('Quiz result saved to Firestore!');
    return true;
  } catch (error) {
    console.error('Error saving quiz result to Firestore:', error);
    
    // If Firestore fails (e.g., permission issues), fall back to localStorage
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.log('Falling back to localStorage due to permission issues');
      return saveToLocalStorage(userId, quizType, score);
    }
    
    // For other errors, still try localStorage as a fallback
    return saveToLocalStorage(userId, quizType, score);
  }
};
