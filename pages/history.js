import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { getUserActivities, formatActivityMessage } from '../utils/activities';

const HistoryPage = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Get more activities for the history page
        const userActivities = await getUserActivities(currentUser.uid, 50);
        setActivities(userActivities.map(activity => ({
          ...activity,
          ...formatActivityMessage(activity)
        })));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [currentUser]);

  if (loading || !currentUser) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="shrink-0"
          >
            Kembali
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Riwayat Aktivitas
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <ActivityFeed activities={activities} isLoading={isLoading} />
          
          {!isLoading && activities.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Menampilkan {activities.length} aktivitas terbaru
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
