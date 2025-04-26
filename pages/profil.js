import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { db } from '../utils/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { NextSeo } from 'next-seo';

const Profil = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    byType: {}
  });

  useEffect(() => {
    // Redirect if not logged in and loading is finished
    if (!loading && !currentUser) {
      router.push('/login');
      return;
    }

    // Fetch quiz history from Firestore when user is loaded
    const fetchQuizHistory = async () => {
      if (!currentUser) return;
      
      setHistoryLoading(true);
      try {
        // Create a query against the quizResults collection
        const quizResultsRef = collection(db, 'quizResults');
        const q = query(
          quizResultsRef,
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = [];
        const typeStats = {};
        let totalScore = 0;
        let bestScore = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const result = {
            id: doc.id,
            type: data.quizType,
            score: data.score,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
          
          results.push(result);
          totalScore += data.score;
          bestScore = Math.max(bestScore, data.score);
          
          // Gather stats by quiz type
          if (!typeStats[data.quizType]) {
            typeStats[data.quizType] = {
              count: 0,
              totalScore: 0,
              bestScore: 0
            };
          }
          
          typeStats[data.quizType].count += 1;
          typeStats[data.quizType].totalScore += data.score;
          typeStats[data.quizType].bestScore = Math.max(
            typeStats[data.quizType].bestScore,
            data.score
          );
        });

        setQuizHistory(results);
        
        // Calculate overall stats
        setQuizStats({
          totalAttempts: results.length,
          averageScore: results.length > 0 ? (totalScore / results.length).toFixed(1) : 0,
          bestScore,
          byType: typeStats
        });
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (currentUser) {
      fetchQuizHistory();
    }
  }, [currentUser, loading, router]);

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render profile content if logged in
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <NextSeo
        title="Profil Pengguna - Ikuttes"
        description="Lihat profil dan riwayat kuis Anda di Ikuttes."
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Profil Pengguna</h1>
        {currentUser && (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {currentUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-medium">Email:</span> {currentUser.email}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Tujuan Utama:</span> CPNS (MVP)
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz Stats Card */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Statistik Kuis</h2>
              
              {quizStats.totalAttempts > 0 ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                      <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Total Kuis</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">{quizStats.totalAttempts}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                      <p className="text-sm text-green-600 dark:text-green-300 mb-1">Rata-rata Skor</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-200">{quizStats.averageScore}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
                      <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Skor Tertinggi</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">{quizStats.bestScore}</p>
                    </div>
                  </div>
                  
                  {/* Simple Score Visualization */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Performa per Tipe Kuis</h3>
                    <div className="space-y-4">
                      {Object.entries(quizStats.byType).map(([type, stats]) => (
                        <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Rata-rata: {(stats.totalScore / stats.count).toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${(stats.totalScore / stats.count / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Belum ada data statistik kuis.</p>
              )}
            </div>

            {/* Quiz History Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Riwayat Kuis</h2>
              
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : quizHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe Kuis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {quizHistory.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{result.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{result.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {result.timestamp.toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Belum ada riwayat kuis. Mulai kuis pertama Anda sekarang!</p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profil;