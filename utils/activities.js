import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const getUserActivities = async (userId, limitCount = 5) => {
  if (!userId) return [];

  try {
    // We'll query all test result collections and combine them
    const collections = [
      { name: 'quizResults', type: 'SKD' },
      { name: 'kraepelinResults', type: 'Kraepelin' },
      { name: 'eppsResults', type: 'EPPS' }
    ];

    const activityPromises = collections.map(async (collectionInfo) => {
      try {
        const q = query(
          collection(db, collectionInfo.name),
          where('userId', '==', userId),
          orderBy('completedAt', 'desc'),
          limit(limitCount)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          type: collectionInfo.type,
          ...doc.data(),
          timestamp: doc.data().completedAt?.toDate() || new Date()
        }));
      } catch (error) {
        console.error(`Error fetching from ${collectionInfo.name}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(activityPromises);
    const allActivities = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    // Sort all activities by timestamp (newest first)
    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching activities:', error);
    // Fallback to localStorage if available
    try {
      const localActivities = JSON.parse(localStorage.getItem('userActivities') || '{}');
      return localActivities[userId]?.slice(0, limitCount) || [];
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return [];
    }
  }
};

// Helper function to format activity message
export const formatActivityMessage = (activity) => {
  if (!activity || !activity.timestamp) {
    return {
      message: 'Aktivitas tidak tersedia',
      icon: '❓',
      date: '-',
      link: '/dashboard'
    };
  }

  const date = activity.timestamp.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const time = activity.timestamp.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  switch (activity.type) {
    case 'SKD':
      return {
        message: `Menyelesaikan Tes SKD dengan skor ${activity.score || 0}`,
        icon: '📝',
        date: `${date} ${time}`,
        link: `/quiz/results/${activity.id}`
      };
    case 'Kraepelin':
      return {
        message: 'Menyelesaikan Tes Kraepelin',
        icon: '🧮',
        date: `${date} ${time}`,
        link: '/kraepelin/results'
      };
    case 'EPPS':
      return {
        message: 'Menyelesaikan Tes Kepribadian EPPS',
        icon: '🧠',
        date: `${date} ${time}`,
        link: '/epps/results'
      };
    default:
      return {
        message: 'Aktivitas terbaru',
        icon: '✨',
        date: `${date} ${time}`,
        link: '/dashboard'
      };
  }
};
