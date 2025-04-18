// Function to save quiz results to Firestore
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const saveQuizResult = async (userId, quizType, score) => {
  try {
    const quizResultsCollection = collection(db, 'quizResults');
    await addDoc(quizResultsCollection, {
      userId,
      quizType,
      score,
      timestamp: serverTimestamp()
    });
    console.log('Quiz result saved to Firestore!');
  } catch (error) {
    console.error('Error saving quiz result to Firestore:', error);
  }
};
