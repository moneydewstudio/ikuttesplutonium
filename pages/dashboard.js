import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';
import { getUserTestResults } from '../utils/testResults';
import { getUserActivities, formatActivityMessage } from '../utils/activities';
import BentoGrid from '../components/dashboard/BentoGrid';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import SKDAnalytics from '../components/dashboard/SKDAnalytics';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Dashboard = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Redirect if not logged in and loading is finished
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    // Fetch all test results and activities when user is logged in
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch both test results and activities in parallel
        const [results, userActivities] = await Promise.all([
          getUserTestResults(currentUser.uid),
          getUserActivities(currentUser.uid, 5)
        ]);
        
        setTestResults(results || {});
        setActivities(userActivities.map(activity => ({
          ...activity,
          ...formatActivityMessage(activity)
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Halo, {currentUser.displayName || 'Pengguna'} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pantau perkembangan dan lanjutkan pembelajaran Anda
            </p>
          </motion.div>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="self-start"
          >
            Keluar
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <BentoGrid testResults={testResults} loading={isLoading} />
        </motion.div>

        {/* SKD Analytics Section */}
        {testResults?.skd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8"
          >
            <SKDAnalytics skdResult={testResults.skd} isLoading={isLoading} />
          </motion.div>
        )}

        {/* Activity Feed Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Aktivitas Terkini
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/history')}
            >
              Lihat Semua
            </Button>
          </div>
          <ActivityFeed 
            activities={activities} 
            isLoading={isLoading} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;