import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Leaderboard = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Redirect if not logged in and loading is finished
    if (!loading && !currentUser) {
      router.push('/login');
      return;
    }

    // Fetch leaderboard data from Firestore
    const fetchLeaderboard = async () => {
      try {
        const leaderboardCollection = collection(db, 'leaderboard');
        const q = query(leaderboardCollection, orderBy('totalScore', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    if (!loading && currentUser) {
      fetchLeaderboard();
    }
  }, [currentUser, loading, router]);

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Papan Peringkat</h1>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peringkat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skor Total</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboardData.map((user, index) => (
                <tr key={index} className={user.userId === currentUser?.uid ? 'bg-indigo-100 dark:bg-indigo-900' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.userId === currentUser?.uid ? 'Anda' : user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;