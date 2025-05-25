import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import questions from '../data/papi/questions.json';
import { PapiQuestion, PapiAnswer, PapiResult, PapiDimension } from '../types/papi';
import { auth, db } from './firebase';

const STORAGE_KEY = 'ikuttes_papi_test';

// Define TestState interface for local storage
interface TestState {
  id: string;
  startedAt: string;
  questions: PapiQuestion[];
  answers: Record<number, 'A' | 'B'>;
  completed: boolean;
  results: PapiResult | null;
}

/**
 * Initialize a new PAPI test or retrieve an in-progress test
 */
const initTest = (): TestState => {
  // Check localStorage for in-progress test
  const savedTest = localStorage.getItem(STORAGE_KEY);
  
  if (savedTest) {
    try {
      const parsedTest = JSON.parse(savedTest) as TestState;
      // Ensure the test structure is valid
      if (parsedTest && parsedTest.questions && parsedTest.answers) {
        return parsedTest;
      }
    } catch (error) {
      console.error('Error parsing saved test:', error);
    }
  }
  
  // Initialize new test
  const newTest: TestState = {
    id: `papi_${Date.now()}`,
    startedAt: new Date().toISOString(),
    questions: questions.questions as unknown as PapiQuestion[],
    answers: {},
    completed: false,
    results: null
  };
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTest));
  
  return newTest;
};

/**
 * Save an answer for a specific question
 */
const saveAnswer = (testState: TestState, questionId: number, selectedLabel: 'A' | 'B'): TestState => {
  const updatedAnswers = {
    ...testState.answers,
    [questionId]: selectedLabel
  };
  
  const updatedState = {
    ...testState,
    answers: updatedAnswers
  };
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  
  return updatedState;
};

/**
 * Complete the test, calculate results, save to localStorage immediately, and sync to Firestore in the background.
 * @param testState Current test state
 * @param onSync Optional callback to notify UI of sync status: 'syncing', 'success', 'error'
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
const completeTest = async (
  testState: TestState,
  onSync?: (status: SyncStatus) => void
): Promise<TestState> => {
  // Convert answers to PapiAnswer[] format
  const papiAnswers: PapiAnswer[] = Object.entries(testState.answers).map(([id, label]) => ({
    questionId: parseInt(id),
    selectedLabel: label,
    timestamp: Date.now()
  }));
  
  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(testState.questions, testState.answers);
  
  // Create results object
  const results: PapiResult = {
    testId: testState.id,
    userId: auth.currentUser?.uid,
    startTime: new Date(testState.startedAt).getTime(),
    endTime: Date.now(),
    answers: papiAnswers,
    dimensionScores,
    normalizedScores: normalizeScores(dimensionScores)
  };
  
  // Update test state
  const updatedState = {
    ...testState,
    completed: true,
    results
  };
  
  // Save to localStorage immediately
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

  // Notify UI that sync is starting
  if (onSync) onSync('syncing');

  // Sync to Firestore in background (do not block UI)
  (async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            [`papiResults.${testState.id}`]: results,
            lastPapiTest: results
          });
        } else {
          await setDoc(userRef, {
            papiResults: {
              [testState.id]: results
            },
            lastPapiTest: results
          });
        }
        if (onSync) onSync('success');
      } catch (error) {
        console.error('Error saving to Firestore, using localStorage fallback:', error);
        if (onSync) onSync('error');
      }
    } else {
      // Not logged in, skip Firestore
      if (onSync) onSync('idle');
    }
  })();

  return updatedState;
};

/**
 * Clear the current test from localStorage
 */
const clearTest = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get the latest test results for the current user
 */
const getLatestResults = async (): Promise<PapiResult | null> => {
  if (auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().lastPapiTest) {
        return userDoc.data().lastPapiTest as PapiResult;
      }
    } catch (error) {
      console.error('Error getting results from Firestore:', error);
      // Fall back to localStorage
    }
  }
  
  // Try to get from localStorage
  const savedTest = localStorage.getItem(STORAGE_KEY);
  if (savedTest) {
    try {
      const parsedTest = JSON.parse(savedTest) as TestState;
      if (parsedTest && parsedTest.completed && parsedTest.results) {
        return parsedTest.results;
      }
    } catch (error) {
      console.error('Error parsing saved test:', error);
    }
  }
  
  return null;
};

/**
 * Calculate dimension scores based on answers
 */
const calculateDimensionScores = (
  questions: PapiQuestion[], 
  answers: Record<number, 'A' | 'B'>
): Record<PapiDimension, number> => {
  const dimensionCounts: Record<string, number> = {};
  const dimensionScores: Record<PapiDimension, number> = {} as Record<PapiDimension, number>;
  
  // Count how many times each dimension was chosen
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = questions.find(q => q.id === parseInt(questionId));
    if (question) {
      const dimension = question.dimensions[answer];
      dimensionCounts[dimension] = (dimensionCounts[dimension] || 0) + 1;
    }
  });
  
  // Calculate scores on a scale of 1-10
  // The formula is simplified for demonstration purposes
  Object.entries(dimensionCounts).forEach(([dimension, count]) => {
    // Normalize to 1-10 scale
    // Assuming each dimension appears in approximately 15-20 questions
    const maxPossible = 20; // Approximate max possible selections per dimension
    const score = Math.round((count / maxPossible) * 10);
    dimensionScores[dimension as PapiDimension] = Math.max(1, Math.min(10, score)); // Ensure between 1-10
  });
  
  return dimensionScores;
};

/**
 * Normalize scores to ensure they sum to 100%
 */
const normalizeScores = (scores: Record<PapiDimension, number>): Record<PapiDimension, number> => {
  const normalized: Record<PapiDimension, number> = {} as Record<PapiDimension, number>;
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  if (total === 0) return scores; // Avoid division by zero
  
  Object.entries(scores).forEach(([dimension, score]) => {
    normalized[dimension as PapiDimension] = Math.round((score / total) * 100) / 10;
  });
  
  return normalized;
};

export { initTest, saveAnswer, completeTest, clearTest, getLatestResults };

