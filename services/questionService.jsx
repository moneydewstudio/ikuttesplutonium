import { db } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';
import { localQuestions, sampleTryoutQuestions } from '../data/questions';

// Collection names
const QUESTIONS_COLLECTION = 'questions';

/**
 * Get questions by category, with hybrid approach
 * First tries to get questions from Firebase, falls back to local questions if needed
 */
export const getQuestionsByCategory = async (category, count = 10, useLocalOnly = false) => {
  // If local only mode is requested or we're in development without Firebase
  if (useLocalOnly || process.env.NODE_ENV === 'development') {
    return getLocalQuestionsByCategory(category, count);
  }

  try {
    // Try to get questions from Firebase first
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const q = query(
      questionsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(count * 3) // Get more than needed to allow for random selection
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Convert to array and shuffle
      const firebaseQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Randomly select the requested number of questions
      const shuffled = [...firebaseQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    
    // If no Firebase questions or not enough, fall back to local
    console.log('No Firebase questions found, falling back to local questions');
    return getLocalQuestionsByCategory(category, count);
  } catch (error) {
    console.error('Error fetching questions from Firebase:', error);
    // Fall back to local questions on error
    return getLocalQuestionsByCategory(category, count);
  }
};

/**
 * Get questions from local data store
 */
const getLocalQuestionsByCategory = (category, count) => {
  const categoryQuestions = localQuestions[category] || [];
  
  if (categoryQuestions.length === 0) {
    return [];
  }
  
  // Randomly select questions if we have more than requested
  if (categoryQuestions.length > count) {
    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  return categoryQuestions;
};

/**
 * Get a full tryout set of questions (mixed categories)
 */
export const getTryoutQuestions = async (count = 10, useLocalOnly = false) => {
  // If local only mode is requested or we're in development without Firebase
  if (useLocalOnly || process.env.NODE_ENV === 'development') {
    return sampleTryoutQuestions.slice(0, count);
  }

  try {
    // Try to get questions from Firebase
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const q = query(
      questionsRef,
      orderBy('createdAt', 'desc'),
      limit(count * 3) // Get more than needed to allow for random selection
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Convert to array and shuffle
      const firebaseQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Randomly select the requested number of questions
      const shuffled = [...firebaseQuestions].sort(() => 0.5 - Math.random());
      
      // Ensure we have a mix of categories (TWK, TIU, TKP)
      const categories = ['TWK', 'TIU', 'TKP'];
      let result = [];
      
      // Try to get an even distribution of categories
      for (const category of categories) {
        const categoryQuestions = shuffled.filter(q => q.category === category);
        const categoryCount = Math.floor(count / categories.length);
        result = [...result, ...categoryQuestions.slice(0, categoryCount)];
      }
      
      // If we don't have enough, add more random questions
      if (result.length < count) {
        const remaining = shuffled.filter(q => !result.includes(q));
        result = [...result, ...remaining.slice(0, count - result.length)];
      }
      
      return result.slice(0, count);
    }
    
    // Fall back to local tryout questions
    console.log('No Firebase tryout questions found, falling back to local questions');
    return sampleTryoutQuestions.slice(0, count);
  } catch (error) {
    console.error('Error fetching tryout questions from Firebase:', error);
    // Fall back to local questions on error
    return sampleTryoutQuestions.slice(0, count);
  }
};

/**
 * Admin functions for managing questions
 */

// Get all questions for admin dashboard with pagination
export const getQuestionsForAdmin = async (pageSize = 20, startAfter = null, filters = {}) => {
  try {
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Start building the query
    let q = query(questionsRef, orderBy('createdAt', 'desc'));
    
    // Apply filters if provided
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }
    
    // Apply pagination
    if (startAfter) {
      const startAfterDoc = await getDoc(doc(db, QUESTIONS_COLLECTION, startAfter));
      if (startAfterDoc.exists()) {
        q = query(q, startAfter(startAfterDoc), limit(pageSize));
      } else {
        q = query(q, limit(pageSize));
      }
    } else {
      q = query(q, limit(pageSize));
    }
    
    const querySnapshot = await getDocs(q);
    
    // Get the last visible document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    // Convert to array
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      questions,
      lastVisible: lastVisible ? lastVisible.id : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching questions for admin:', error);
    throw error;
  }
};

// Get a single question by ID
export const getQuestionById = async (questionId) => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    // Check local questions if not found in Firebase
    for (const category in localQuestions) {
      const found = localQuestions[category].find(q => q.id === questionId);
      if (found) return found;
    }
    
    // Check tryout questions
    const foundTryout = sampleTryoutQuestions.find(q => q.id === questionId);
    if (foundTryout) return foundTryout;
    
    return null;
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    
    // Try to find in local questions on error
    for (const category in localQuestions) {
      const found = localQuestions[category].find(q => q.id === questionId);
      if (found) return found;
    }
    
    // Check tryout questions
    const foundTryout = sampleTryoutQuestions.find(q => q.id === questionId);
    if (foundTryout) return foundTryout;
    
    throw error;
  }
};

// Create a new question
export const createQuestion = async (questionData) => {
  try {
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Add timestamps
    const dataWithTimestamps = {
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(questionsRef, dataWithTimestamps);
    
    return {
      id: docRef.id,
      ...questionData
    };
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Update an existing question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    
    // Add updated timestamp
    const dataWithTimestamp = {
      ...questionData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    
    return {
      id: questionId,
      ...questionData
    };
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (questionId) => {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Get question statistics
export const getQuestionStats = async () => {
  try {
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const querySnapshot = await getDocs(questionsRef);
    
    const stats = {
      total: querySnapshot.size,
      byCategory: {
        TWK: 0,
        TIU: 0,
        TKP: 0
      },
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    };
    
    // Count questions by category and difficulty
    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      // Count by category
      if (data.category && stats.byCategory[data.category] !== undefined) {
        stats.byCategory[data.category]++;
      }
      
      // Count by difficulty
      if (data.difficulty && stats.byDifficulty[data.difficulty] !== undefined) {
        stats.byDifficulty[data.difficulty]++;
      }
    });
    
    // Add local questions to stats
    for (const category in localQuestions) {
      stats.total += localQuestions[category].length;
      stats.byCategory[category] += localQuestions[category].length;
      
      // Count by difficulty
      localQuestions[category].forEach(q => {
        if (q.difficulty && stats.byDifficulty[q.difficulty] !== undefined) {
          stats.byDifficulty[q.difficulty]++;
        }
      });
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting question stats:', error);
    
    // Return stats for local questions only on error
    const stats = {
      total: 0,
      byCategory: {
        TWK: 0,
        TIU: 0,
        TKP: 0
      },
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    };
    
    for (const category in localQuestions) {
      stats.total += localQuestions[category].length;
      stats.byCategory[category] += localQuestions[category].length;
      
      // Count by difficulty
      localQuestions[category].forEach(q => {
        if (q.difficulty && stats.byDifficulty[q.difficulty] !== undefined) {
          stats.byDifficulty[q.difficulty]++;
        }
      });
    }
    
    return stats;
  }
};
