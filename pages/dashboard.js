import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import Header from '../components/Header'; // Import Header
import Footer from '../components/Footer'; // Import Footer

const Dashboard = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth(); // Use the hook

  useEffect(() => {
    // Redirect if not logged in and loading is finished
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Display loading state
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Render dashboard content if logged in
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header /> 
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Dashboard</h1>
        {currentUser && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">Selamat Datang di Dashboard, {currentUser.email}!</p>
        )}
         {/* Add Dashboard content here based on PRD */}
         <div className="space-x-4 mb-8">
            <button onClick={() => router.push('/kuis/pendek')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Kuis Pendek</button>
            <button onClick={() => router.push('/kuis/tryout')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Tryout Lengkap</button>
            {/* Add buttons for other test types here */}
         </div>

        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;