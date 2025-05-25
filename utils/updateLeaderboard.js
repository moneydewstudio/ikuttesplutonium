// Function to update leaderboard with localStorage fallback and background sync
import { db } from '../utils/firebase';
import { collection, doc, getDoc, setDoc, where, query, getDocs } from 'firebase/firestore';

/**
 * Generates a unique key for a leaderboard entry
 * @param {string} userId - User ID
 * @param {string} testType - Type of test (e.g., 'skd', 'kraepelin')
 * @returns {string} - Unique key for leaderboard entry
 */
const leaderboardEntryKey = (userId, testType) => `${userId}_${testType}`;

/**
 * Get leaderboard entries from localStorage
 * @returns {Object} - All leaderboard entries stored locally
 */
const getLocalLeaderboard = () => {
  try {
    return JSON.parse(localStorage.getItem('leaderboard') || '{}');
  } catch (error) {
    console.error('Error reading leaderboard from localStorage:', error);
    return {};
  }
};

/**
 * Save leaderboard entries to localStorage
 * @param {Object} leaderboard - Leaderboard entries to save
 */
const saveLocalLeaderboard = (leaderboard) => {
  try {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Error saving leaderboard to localStorage:', error);
  }
};

/**
 * Get pending sync entries from localStorage
 * @returns {Array} - List of entry keys pending sync
 */
const getPendingSyncs = () => {
  try {
    return JSON.parse(localStorage.getItem('leaderboardPendingSyncs') || '[]');
  } catch (error) {
    console.error('Error reading pending syncs from localStorage:', error);
    return [];
  }
};

/**
 * Save pending sync entries to localStorage
 * @param {Array} pendingSyncs - List of entry keys pending sync
 */
const savePendingSyncs = (pendingSyncs) => {
  try {
    localStorage.setItem('leaderboardPendingSyncs', JSON.stringify(pendingSyncs));
  } catch (error) {
    console.error('Error saving pending syncs to localStorage:', error);
  }
};

/**
 * Update a leaderboard entry in Firestore
 * @param {string} userId - User ID
 * @param {string} testType - Type of test (e.g., 'skd', 'kraepelin')
 * @param {number|Object} score - Score or score object for the test
 * @returns {Promise<boolean>} - Whether the update was successful
 */
const updateFirestoreLeaderboard = async (userId, testType, score) => {
  try {
    const leaderboardCollection = collection(db, 'leaderboard');
    const entryKey = leaderboardEntryKey(userId, testType);
    const entryDocRef = doc(leaderboardCollection, entryKey);
    
    // Check if an entry already exists
    const docSnap = await getDoc(entryDocRef);
    
    // For SKD, score is a number
    // For Kraepelin, score is an object with properties like accuracy, totalCorrect, etc.
    const now = new Date();
    
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      
      // Only update if the new score is higher (for SKD) or better (for Kraepelin)
      let shouldUpdate = false;
      
      if (testType === 'skd' && typeof score === 'number') {
        shouldUpdate = score > (existingData.highestScore || 0);
      } else if (testType === 'kraepelin' && typeof score === 'object') {
        // For Kraepelin, using compositeScore which combines work accuracy, resilience, and capability
        const newCompositeScore = score.compositeScore || 0;
        const existingCompositeScore = existingData.compositeScore || 0;
        shouldUpdate = newCompositeScore > existingCompositeScore;
      }
      
      if (shouldUpdate) {
        // Update with new personal best
        if (testType === 'skd' && typeof score === 'number') {
          await setDoc(entryDocRef, {
            userId,
            testType,
            highestScore: score,
            updatedAt: now.toISOString()
          }, { merge: true });
        } else if (testType === 'kraepelin' && typeof score === 'object') {
          await setDoc(entryDocRef, {
            userId,
            testType,
            highestAccuracy: score.accuracy || 0,
            totalCorrect: score.totalCorrect || 0,
            totalOpsDone: score.totalOpsDone || 0,
            workAccuracyScore: score.workAccuracyScore || 0,
            workResilienceScore: score.workResilienceScore || 0,
            workCapabilityScore: score.workCapabilityScore || 0,
            compositeScore: score.compositeScore || 0,
            updatedAt: now.toISOString()
          }, { merge: true });
        }
        console.log(`New personal best for ${testType} updated in Firestore for user:`, userId);
      } else {
        console.log(`No new personal best for ${testType} for user:`, userId);
      }
    } else {
      // Create new entry
      if (testType === 'skd' && typeof score === 'number') {
        await setDoc(entryDocRef, {
          userId,
          testType,
          highestScore: score,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        });
      } else if (testType === 'kraepelin' && typeof score === 'object') {
        await setDoc(entryDocRef, {
          userId,
          testType,
          highestAccuracy: score.accuracy || 0,
          totalCorrect: score.totalCorrect || 0,
          totalOpsDone: score.totalOpsDone || 0,
          workAccuracyScore: score.workAccuracyScore || 0,
          workResilienceScore: score.workResilienceScore || 0,
          workCapabilityScore: score.workCapabilityScore || 0,
          compositeScore: score.compositeScore || 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        });
      }
      console.log(`New ${testType} leaderboard entry created in Firestore for user:`, userId);
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ${testType} leaderboard in Firestore:`, error);
    throw error;
  }
};

/**
 * Update a leaderboard entry in localStorage
 * @param {string} userId - User ID
 * @param {string} testType - Type of test (e.g., 'skd', 'kraepelin')
 * @param {number|Object} score - Score or score object for the test
 * @returns {boolean} - Whether the update was successful
 */
const updateLocalLeaderboardEntry = (userId, testType, score) => {
  try {
    const leaderboard = getLocalLeaderboard();
    const entryKey = leaderboardEntryKey(userId, testType);
    const now = new Date();
    
    // Check if an entry already exists
    if (leaderboard[entryKey]) {
      const existingEntry = leaderboard[entryKey];
      
      // Only update if the new score is higher (for SKD) or better (for Kraepelin)
      let shouldUpdate = false;
      
      if (testType === 'skd' && typeof score === 'number') {
        shouldUpdate = score > (existingEntry.highestScore || 0);
      } else if (testType === 'kraepelin' && typeof score === 'object') {
        // For Kraepelin, using compositeScore which combines work accuracy, resilience, and capability
        const newCompositeScore = score.compositeScore || 0;
        const existingCompositeScore = existingEntry.compositeScore || 0;
        shouldUpdate = newCompositeScore > existingCompositeScore;
      }
      
      if (shouldUpdate) {
        // Update with new personal best
        if (testType === 'skd' && typeof score === 'number') {
          leaderboard[entryKey] = {
            ...existingEntry,
            highestScore: score,
            updatedAt: now.toISOString(),
            pendingSync: true
          };
        } else if (testType === 'kraepelin' && typeof score === 'object') {
          leaderboard[entryKey] = {
            ...existingEntry,
            highestAccuracy: score.accuracy || 0,
            totalCorrect: score.totalCorrect || 0,
            totalOpsDone: score.totalOpsDone || 0,
            workAccuracyScore: score.workAccuracyScore || 0,
            workResilienceScore: score.workResilienceScore || 0,
            workCapabilityScore: score.workCapabilityScore || 0,
            compositeScore: score.compositeScore || 0,
            updatedAt: now.toISOString(),
            pendingSync: true
          };
        }
        console.log(`New personal best for ${testType} updated in localStorage for user:`, userId);
      } else {
        console.log(`No new personal best for ${testType} for user:`, userId);
      }
    } else {
      // Create new entry
      if (testType === 'skd' && typeof score === 'number') {
        leaderboard[entryKey] = {
          userId,
          testType,
          highestScore: score,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          pendingSync: true
        };
      } else if (testType === 'kraepelin' && typeof score === 'object') {
        leaderboard[entryKey] = {
          userId,
          testType,
          highestAccuracy: score.accuracy || 0,
          totalCorrect: score.totalCorrect || 0,
          totalOpsDone: score.totalOpsDone || 0,
          workAccuracyScore: score.workAccuracyScore || 0,
          workResilienceScore: score.workResilienceScore || 0,
          workCapabilityScore: score.workCapabilityScore || 0,
          compositeScore: score.compositeScore || 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          pendingSync: true
        };
      }
      console.log(`New ${testType} leaderboard entry created in localStorage for user:`, userId);
    }
    
    // Update pending syncs
    const pendingSyncs = getPendingSyncs();
    if (!pendingSyncs.includes(entryKey)) {
      pendingSyncs.push(entryKey);
      savePendingSyncs(pendingSyncs);
    }
    
    // Save back to localStorage
    saveLocalLeaderboard(leaderboard);
    return true;
  } catch (error) {
    console.error(`Error updating ${testType} leaderboard in localStorage:`, error);
    return false;
  }
};

/**
 * Update a leaderboard entry, first trying Firestore then falling back to localStorage
 * @param {string} userId - User ID
 * @param {string} testType - Type of test (e.g., 'skd', 'kraepelin')
 * @param {number|Object} score - Score or score object for the test
 * @returns {Promise<boolean>} - Whether the update was successful in either Firestore or localStorage
 */
export const updateLeaderboard = async (userId, testType, score) => {
  if (!userId || !testType || score === undefined) {
    console.error('Invalid parameters for updateLeaderboard');
    return false;
  }

  try {
    // First try to update in Firestore
    await updateFirestoreLeaderboard(userId, testType, score);
    return true;
  } catch (error) {
    console.error(`Error updating ${testType} leaderboard in Firestore:`, error);
    
    // Fall back to localStorage for any error
    return updateLocalLeaderboardEntry(userId, testType, score);
  }
};

/**
 * Sync pending leaderboard entries from localStorage to Firestore
 * @param {string} userId - Optional user ID to sync entries for a specific user
 * @returns {Promise<{success: boolean, syncedEntries: number, remainingEntries: number}>}
 */
export const syncLeaderboard = async (userId = null) => {
  try {
    // Get all pending syncs
    const pendingSyncs = getPendingSyncs();
    if (pendingSyncs.length === 0) {
      return { success: true, syncedEntries: 0, remainingEntries: 0 };
    }
    
    const leaderboard = getLocalLeaderboard();
    const syncedEntries = [];
    const remainingEntries = [];
    
    // Process each pending sync
    for (const entryKey of pendingSyncs) {
      // Skip if not for the specified user (if provided)
      if (userId && !entryKey.startsWith(`${userId}_`)) {
        remainingEntries.push(entryKey);
        continue;
      }
      
      const entry = leaderboard[entryKey];
      if (!entry) {
        // Entry no longer exists in localStorage
        continue;
      }
      
      try {
        const { userId, testType } = entry;
        
        if (testType === 'skd') {
          await updateFirestoreLeaderboard(userId, testType, entry.highestScore);
        } else if (testType === 'kraepelin') {
          await updateFirestoreLeaderboard(userId, testType, {
            accuracy: entry.highestAccuracy,
            totalCorrect: entry.totalCorrect,
            totalOpsDone: entry.totalOpsDone,
            workAccuracyScore: entry.workAccuracyScore,
            workResilienceScore: entry.workResilienceScore,
            workCapabilityScore: entry.workCapabilityScore,
            compositeScore: entry.compositeScore
          });
        }
        
        // Mark as synced in localStorage
        leaderboard[entryKey] = {
          ...entry,
          pendingSync: false
        };
        
        syncedEntries.push(entryKey);
      } catch (error) {
        console.error(`Error syncing leaderboard entry ${entryKey}:`, error);
        remainingEntries.push(entryKey);
      }
    }
    
    // Save updated leaderboard to localStorage
    saveLocalLeaderboard(leaderboard);
    
    // Update pending syncs
    savePendingSyncs(remainingEntries);
    
    return {
      success: true,
      syncedEntries: syncedEntries.length,
      remainingEntries: remainingEntries.length
    };
  } catch (error) {
    console.error('Error syncing leaderboard:', error);
    return { success: false, syncedEntries: 0, remainingEntries: getPendingSyncs().length };
  }
};

/**
 * Get leaderboard entries from Firestore with localStorage fallback
 * @param {string} testType - Type of test (e.g., 'skd', 'kraepelin')
 * @param {number} limit - Maximum number of entries to return
 * @returns {Promise<Array>} - Leaderboard entries sorted by highest score
 */
export const getLeaderboardEntries = async (testType, limit = 10) => {
  try {
    // Try to get from Firestore first
    const leaderboardCollection = collection(db, 'leaderboard');
    const q = query(leaderboardCollection, where('testType', '==', testType));
    const querySnapshot = await getDocs(q);
    
    let entries = [];
    querySnapshot.forEach((doc) => {
      entries.push(doc.data());
    });
    
    // Sort by appropriate score field
    if (testType === 'skd') {
      entries.sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0));
    } else if (testType === 'kraepelin') {
      // Sort by composite score as primary, fall back to accuracy if composite is equal
      entries.sort((a, b) => {
        const aComposite = a.compositeScore || 0;
        const bComposite = b.compositeScore || 0;
        if (aComposite !== bComposite) {
          return bComposite - aComposite;
        }
        return (b.highestAccuracy || 0) - (a.highestAccuracy || 0);
      });
    }
    
    // Limit results
    return entries.slice(0, limit);
  } catch (error) {
    console.error(`Error getting ${testType} leaderboard from Firestore:`, error);
    
    // Fall back to localStorage
    try {
      const leaderboard = getLocalLeaderboard();
      
      let entries = Object.values(leaderboard).filter(entry => entry.testType === testType);
      
      // Sort by appropriate score field
      if (testType === 'skd') {
        entries.sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0));
      } else if (testType === 'kraepelin') {
        // Sort by composite score as primary, fall back to accuracy if composite is equal
        entries.sort((a, b) => {
          const aComposite = a.compositeScore || 0;
          const bComposite = b.compositeScore || 0;
          if (aComposite !== bComposite) {
            return bComposite - aComposite;
          }
          return (b.highestAccuracy || 0) - (a.highestAccuracy || 0);
        });
      }
      
      // Limit results
      return entries.slice(0, limit);
    } catch (localError) {
      console.error(`Error getting ${testType} leaderboard from localStorage:`, localError);
      return [];
    }
  }
};
