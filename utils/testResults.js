import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const getUserTestResults = async (userId) => {
  if (!userId) return null;

  try {
    // Fetch SKD results (most recent)
    const skdQuery = query(
      collection(db, 'quizResults'),
      where('userId', '==', userId),
      where('quizType', '==', 'SKD'),
      orderBy('completedAt', 'desc'),
      limit(1)
    );
    
    // Fetch Kraepelin results (most recent)
    const kraepelinQuery = query(
      collection(db, 'kraepelinResults'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(1)
    );

    // Fetch EPPS results (most recent)
    const eppsQuery = query(
      collection(db, 'eppsResults'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(1)
    );

    const [skdSnapshot, kraepelinSnapshot, eppsSnapshot] = await Promise.all([
      getDocs(skdQuery),
      getDocs(kraepelinQuery),
      getDocs(eppsQuery)
    ]);

    const results = {};

    // Process SKD results
    if (!skdSnapshot.empty) {
      const doc = skdSnapshot.docs[0].data();
      results.skd = {
        score: doc.score || 0,
        lastAttempt: doc.completedAt?.toDate() || new Date(),
        totalQuestions: doc.totalQuestions || 0,
        correctAnswers: doc.correctAnswers || 0
      };
    }

    // Process Kraepelin results
    if (!kraepelinSnapshot.empty) {
      const doc = kraepelinSnapshot.docs[0].data();
      results.kraepelin = {
        compositeScore: doc.compositeScore || 0,
        lastAttempt: doc.completedAt?.toDate() || new Date(),
        workAccuracy: doc.workAccuracy?.score || 0,
        workResilience: doc.workResilience?.score || 0,
        workCapability: doc.workCapability?.score || 0
      };
    }

    // Process EPPS results
    if (!eppsSnapshot.empty) {
      const doc = eppsSnapshot.docs[0].data();
      results.epps = {
        primaryTrait: doc.primaryTrait || 'Belum ada hasil',
        lastAttempt: doc.completedAt?.toDate() || new Date(),
        traits: doc.traits || {}
      };
    }

    return results;
  } catch (error) {
    console.error('Error fetching test results:', error);
    return null;
  }
};
