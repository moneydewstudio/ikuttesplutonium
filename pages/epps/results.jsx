import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getLatestResults } from '../../utils/eppsStorage';

// Use dynamic import with ssr: false to ensure client-side only rendering
const EPPSResults = dynamic(() => import('../../components/epps/EPPSResults'), { ssr: false });

export default function EPPSResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const latestResults = await getLatestResults();
        setResults(latestResults);
      } catch (error) {
        console.error('Error fetching EPPS results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-black text-center">
          <h1 className="text-2xl font-bold mb-4">Hasil Tidak Ditemukan</h1>
          <p className="mb-6">
            Anda belum menyelesaikan tes EPPS atau hasil tes tidak tersedia.
          </p>
          <button
            onClick={() => router.push('/epps')}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md transform hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            Mulai Tes EPPS
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Hasil EPPS | Ikuttes</title>
        <meta name="description" content="Hasil Edwards Personal Preference Schedule (EPPS) Test" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <EPPSResults results={results} />
      </div>
    </>
  );
}
