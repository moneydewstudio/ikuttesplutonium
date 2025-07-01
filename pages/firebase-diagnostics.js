import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  runAllDiagnostics, 
  testOnboardingStorage 
} from '../utils/firebase-debug';

export default function FirebaseDiagnostics() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [apiResults, setApiResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testData, setTestData] = useState({
    displayName: 'Test User',
    education: {
      level: 'S1',
      major: 'Test Major',
      institution: 'Test University'
    },
    targetProvinces: ['Jakarta', 'Bandung'],
    targetScore: {
      twk: 85,
      tiu: 80,
      tkp: 155,
      total: 320
    },
    testTimestamp: new Date().toISOString()
  });

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Run client-side diagnostics
      await runAllDiagnostics();
      
      // Test onboarding storage if user is logged in
      if (currentUser) {
        const onboardingResult = await testOnboardingStorage(
          currentUser.uid,
          testData
        );
        setResults({ 
          timestamp: new Date().toISOString(),
          onboardingStorageSuccess: onboardingResult,
          user: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          }
        });
      } else {
        setResults({
          timestamp: new Date().toISOString(),
          error: 'No user logged in. Please log in to run complete diagnostics.'
        });
      }
    } catch (error) {
      setError(error.message);
      console.error('Diagnostics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runApiDiagnostics = async () => {
    if (!currentUser) {
      setError('You must be logged in to run API diagnostics');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get current user's ID token
      const idToken = await currentUser.getIdToken(true);
      
      // Call our debug API
      const response = await fetch('/api/debug-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-token',
          idToken: idToken,
          userId: currentUser.uid
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResults(data);
      
      // Also run Firestore tests
      const firestoreResponse = await fetch('/api/debug-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-firestore',
          userId: currentUser.uid,
          idToken: idToken,
          testData: {
            testField: 'API Diagnostic Test',
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      if (!firestoreResponse.ok) {
        throw new Error(`Firestore API test responded with status: ${firestoreResponse.status}`);
      }
      
      const firestoreData = await firestoreResponse.json();
      setApiResults(prev => ({ ...prev, firestore: firestoreData }));
      
    } catch (error) {
      setError(error.message);
      console.error('API diagnostics error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to test specifically onboarding data storage
  const testOnboardingDataStorage = async () => {
    if (!currentUser) {
      setError('You must be logged in to test onboarding storage');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get current auth token
      const token = await currentUser.getIdToken(true);
      console.log('Token refreshed');
      
      // Try to store onboarding data directly
      const result = await testOnboardingStorage(currentUser.uid, testData);
      setResults(prev => ({
        ...prev,
        onboardingTestResult: result,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      setError(`Onboarding storage test failed: ${error.message}`);
      console.error('Onboarding test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Diagnostics</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold">User Status</h2>
        {currentUser ? (
          <div>
            <p>✅ Logged in as: {currentUser.email}</p>
            <p>User ID: {currentUser.uid}</p>
            <p>Display Name: {currentUser.displayName || 'Not set'}</p>
          </div>
        ) : (
          <p>❌ Not logged in. Please login to run complete diagnostics.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Client-Side Diagnostics'}
        </button>
        
        <button
          onClick={runApiDiagnostics}
          disabled={loading || !currentUser}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Server-Side Diagnostics'}
        </button>
        
        <button
          onClick={testOnboardingDataStorage}
          disabled={loading || !currentUser}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Onboarding Data Storage'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {results && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Client-Side Diagnostic Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      {apiResults && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Server-Side Diagnostic Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(apiResults, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold">Firebase Rules Reference</h2>
        <p className="mb-2">Common 401 (Unauthorized) causes:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Missing or invalid Firebase API key</li>
          <li>Firebase project doesn't have Authentication enabled</li>
          <li>Firestore security rules are too restrictive</li>
          <li>Auth token expired or invalid</li>
          <li>Trying to access data that belongs to another user</li>
        </ul>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
}
