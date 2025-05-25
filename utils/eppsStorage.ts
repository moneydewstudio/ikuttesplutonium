import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { EPPSQuestion, EPPSAnswer, EPPSResult, EPPSDimension } from '../types/epps';
import { auth, db } from './firebase';

const STORAGE_KEY = 'ikuttes_epps_test';

// Define TestState interface for local storage
interface TestState {
  id: string;
  startedAt: string;
  questions: EPPSQuestion[];
  answers: Record<number, 'A' | 'B'>;
  completed: boolean;
  results: EPPSResult | null;
  currentBatch: number;
  timeRemaining: number; // in seconds
}

/**
 * Initialize a new EPPS test or retrieve an in-progress test
 */
const initTest = (questions: EPPSQuestion[]): TestState => {
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
    id: `epps_${Date.now()}`,
    startedAt: new Date().toISOString(),
    questions: questions,
    answers: {},
    completed: false,
    results: null,
    currentBatch: 1,
    timeRemaining: 45 * 60 // 45 minutes in seconds
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
 * Update the current batch
 */
const updateBatch = (testState: TestState, batchNumber: number): TestState => {
  const updatedState = {
    ...testState,
    currentBatch: batchNumber
  };
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  
  return updatedState;
};

/**
 * Update the remaining time
 */
const updateTimeRemaining = (testState: TestState, timeRemaining: number): TestState => {
  const updatedState = {
    ...testState,
    timeRemaining
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
  // Convert answers to EPPSAnswer[] format
  const eppsAnswers: EPPSAnswer[] = Object.entries(testState.answers).map(([id, label]) => ({
    questionId: parseInt(id),
    selectedLabel: label,
    timestamp: Date.now()
  }));
  
  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(testState.questions, testState.answers);
  
  // Calculate interpretations
  const interpretations = calculateInterpretations(dimensionScores);
  
  // Create results object
  const results: EPPSResult = {
    testId: testState.id,
    userId: auth.currentUser?.uid,
    startTime: new Date(testState.startedAt).getTime(),
    endTime: Date.now(),
    answers: eppsAnswers,
    dimensionScores,
    interpretations,
    batch: {
      current: testState.currentBatch,
      total: 5,
      questionsPerBatch: 45
    }
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
            [`eppsResults.${testState.id}`]: results,
            lastEppsTest: results
          });
        } else {
          await setDoc(userRef, {
            eppsResults: {
              [testState.id]: results
            },
            lastEppsTest: results
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
const getLatestResults = async (): Promise<EPPSResult | null> => {
  if (auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().lastEppsTest) {
        return userDoc.data().lastEppsTest as EPPSResult;
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
  questions: EPPSQuestion[], 
  answers: Record<number, 'A' | 'B'>
): Record<EPPSDimension, number> => {
  // Initialize scores for all dimensions to 0
  const dimensionScores: Record<EPPSDimension, number> = {
    Achievement: 0,
    Deference: 0,
    Order: 0,
    Exhibition: 0,
    Autonomy: 0,
    Affiliation: 0,
    Intraception: 0,
    Succorance: 0,
    Dominance: 0,
    Abasement: 0,
    Nurturance: 0,
    Change: 0,
    Endurance: 0,
    Heterosexuality: 0,
    Aggression: 0
  };
  
  // Count how many times each dimension was chosen
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = questions.find(q => q.id === parseInt(questionId));
    if (question) {
      const dimension = question.dimensions[answer];
      dimensionScores[dimension] = (dimensionScores[dimension] || 0) + 1;
    }
  });
  
  return dimensionScores;
};

/**
 * Calculate interpretations based on dimension scores
 * High: 11-15
 * Medium: 6-10
 * Low: 0-5
 */
const calculateInterpretations = (
  dimensionScores: Record<EPPSDimension, number>
): Record<EPPSDimension, 'high' | 'medium' | 'low'> => {
  const interpretations: Record<EPPSDimension, 'high' | 'medium' | 'low'> = {} as Record<EPPSDimension, 'high' | 'medium' | 'low'>;
  
  Object.entries(dimensionScores).forEach(([dimension, score]) => {
    if (score >= 11) {
      interpretations[dimension as EPPSDimension] = 'high';
    } else if (score >= 6) {
      interpretations[dimension as EPPSDimension] = 'medium';
    } else {
      interpretations[dimension as EPPSDimension] = 'low';
    }
  });
  
  return interpretations;
};

export { 
  initTest, 
  saveAnswer, 
  updateBatch, 
  updateTimeRemaining, 
  completeTest, 
  clearTest, 
  getLatestResults 
};
