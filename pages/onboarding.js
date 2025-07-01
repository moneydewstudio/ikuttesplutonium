import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { motion } from 'framer-motion';

const OnboardingPage = () => {
  const router = useRouter();
  const { currentUser, loading, userProfile } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectAttemptedRef = useRef(false);

  useEffect(() => {
    // Skip effect during loading state
    if (loading || isRedirecting) return;
    
    console.log('Onboarding page - Auth state:', { 
      userExists: !!currentUser, 
      profileExists: !!userProfile,
      onboardingCompleted: userProfile?.onboardingCompleted 
    });
    
    // Redirect if not logged in
    if (!currentUser) {
      console.log('User not logged in, redirecting to login');
      setIsRedirecting(true);
      router.push('/login');
      return;
    }
    
    // Prevent duplicate redirects - this stops the redirect loop
    if (redirectAttemptedRef.current) {
      console.log('Redirect already attempted, staying on page');
      return;
    }
    
    // Redirect to dashboard if onboarding already completed
    if (userProfile?.onboardingCompleted === true) {
      console.log('Onboarding already completed, redirecting to dashboard');
      redirectAttemptedRef.current = true;
      setIsRedirecting(true);
      
      // Use a timeout to avoid a redirect loop
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
    
    console.log('User needs to complete onboarding, staying on page');
  }, [currentUser, loading, router, userProfile, isRedirecting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Selamat Datang di Ikuttes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ayo selesaikan pengaturan akun Anda untuk memulai persiapan CPNS
            </p>
          </motion.div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <OnboardingFlow />
        </motion.div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Ikuttes - Aplikasi Persiapan CPNS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingPage;
