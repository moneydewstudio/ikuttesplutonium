import "../styles/global.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Component to handle background sync
function SyncManager() {
  const { currentUser } = useAuth();
  
  // Try to sync on app load and when online status changes
  useEffect(() => {
    // Only attempt sync when we have a logged in user
    if (!currentUser?.uid) return;
    
    const userId = currentUser.uid;
    
    // Function to attempt background sync
    const attemptSync = async () => {
      try {
        // Dynamically import to reduce initial bundle size
        const { syncLeaderboard } = await import('../utils/updateLeaderboard');
        const result = await syncLeaderboard(userId);
        if (result.syncedEntries > 0) {
          console.log(`Background sync completed: ${result.syncedEntries} entries synced, ${result.remainingEntries} entries pending`);
        }
      } catch (error) {
        console.log('Background sync failed:', error);
      }
    };
    
    // Initial sync attempt when component mounts
    attemptSync();
    
    // Set up listeners for online/offline events
    const handleOnline = () => {
      console.log('Network connection restored. Attempting sync...');
      attemptSync();
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    
    // Periodic sync every 5 minutes
    const syncInterval = setInterval(attemptSync, 5 * 60 * 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, [currentUser]);
  
  // This component doesn't render anything
  return null;
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class">
        <SyncManager />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
