import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getLocalStorage } from '../utils/storage'; // Import localStorage utility

const Profil = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  // State to hold quiz history (replace with actual data fetching)
  const [quizHistory, setQuizHistory] = useState([]);

  useEffect(() => {
    // Redirect if not logged in and loading is finished
    if (!loading && !currentUser) {
      router.push('/login');
    }

    // Load quiz history from localStorage when user is loaded
    if (currentUser) {
        // Example: Assuming quiz results are stored under a key like 'quizResults'
        const history = getLocalStorage('quizResults'); 
        if (history) {
            setQuizHistory(history);
        }
    }

  }, [currentUser, loading, router]);

  // Display loading state
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Render profile content if logged in
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Profil Pengguna</h1>
        {currentUser && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {currentUser.email}</p>
            </div>
            {/* Add more profile details here if needed */}
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300"><strong>Tujuan Utama:</strong> CPNS (MVP)</p> 
            </div>
            {/* Quiz History Table */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-4">Riwayat Kuis</h2>
             {quizHistory.length > 0 ? (
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe Kuis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {quizHistory.map((result, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{result.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{result.score}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(result.date).toLocaleDateString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Belum ada riwayat kuis.</p>
            )}
            {/* TODO: Add Test performance graphs across all test types */}

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profil;