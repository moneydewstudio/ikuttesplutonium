import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import AdminLayout from '../../components/AdminLayout.jsx';
import { getQuestionStats } from '../../services/questionService.jsx';
import useAdminStatus from '../../hooks/useAdminStatus.jsx';
import AccessDeniedModal from '../../components/AccessDeniedModal.jsx';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdminStatus();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) setShowModal(true);
    else setShowModal(false);
  }, [isAdmin, loading]);

  const [stats, setStats] = useState({
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
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const questionStats = await getQuestionStats();
        setStats(questionStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <NextSeo
        title="Admin Dashboard - Ikuttes"
        description="Admin dashboard for managing Ikuttes CPNS app"
        noindex={true}
      />
      <AccessDeniedModal open={showModal} />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !isAdmin ? null : (
        <>
          {statsLoading ? (
            <div className="text-center py-8">Loading statistik...</div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Admin</h1>
                <p className="text-gray-600 dark:text-gray-400">Selamat datang di panel admin Ikuttes</p>
              </div>

              {/* Stats Summary Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Pertanyaan</h2>
                    <p className="text-3xl font-semibold text-gray-800 dark:text-white">{stats.total}</p>
                  </div>
                </div>
              </div>

              {/* Questions by Category */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-4">Pertanyaan per Kategori</h2>
                <div className="space-y-4">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300 w-12">{category}</span>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              category === 'TWK' ? 'bg-blue-500' : 
                              category === 'TIU' ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions by Difficulty */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-4">Pertanyaan per Tingkat Kesulitan</h2>
                <div className="space-y-4">
                  {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300 w-16 capitalize">{difficulty}</span>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              difficulty === 'easy' ? 'bg-green-500' : 
                              difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a 
                    href="/admin/questions/new" 
                    className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg hover:bg-blue-100 dark:hover:bg-opacity-30 transition-colors"
                  >
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Tambah Pertanyaan Baru</span>
                  </a>
                  
                  <a 
                    href="/admin/questions" 
                    className="flex items-center p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg hover:bg-green-100 dark:hover:bg-opacity-30 transition-colors"
                  >
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Kelola Pertanyaan</span>
                  </a>
                  
                  <a 
                    href="/admin/users" 
                    className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg hover:bg-purple-100 dark:hover:bg-opacity-30 transition-colors"
                  >
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Kelola Pengguna</span>
                  </a>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Informasi Sistem</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Versi Aplikasi</span>
                    <span className="text-gray-800 dark:text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mode Penyimpanan Pertanyaan</span>
                    <span className="text-gray-800 dark:text-white">Hybrid (Lokal + Firebase)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Terakhir Diperbarui</span>
                    <span className="text-gray-800 dark:text-white">{new Date().toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;