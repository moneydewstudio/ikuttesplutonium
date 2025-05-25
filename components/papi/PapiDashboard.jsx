import React, { useEffect, useState } from 'react';
import { getLatestResults } from '../../utils/papiStorage';
import Link from 'next/link';

const PapiDashboard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const latestResults = await getLatestResults();
        setResults(latestResults);
      } catch (error) {
        console.error('Error fetching PAPI results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Hasil Tes PAPI Kostick</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Hasil Tes PAPI Kostick</h2>
        <p className="text-gray-600 mb-6">
          Anda belum menyelesaikan tes PAPI Kostick. Tes ini akan membantu Anda memahami
          preferensi kepribadian Anda dalam konteks pekerjaan.
        </p>
        <Link href="/papi" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md inline-block">
          Mulai Tes PAPI
        </Link>
      </div>
    );
  }

  // Sort dimensions by score for visualization
  const sortedDimensions = Object.entries(results.dimensionScores || {})
    .map(([dimension, score]) => ({
      dimension,
      score,
      normalizedScore: results.normalizedScores?.[dimension] || 0
    }))
    .sort((a, b) => b.score - a.score);

  const topDimensions = sortedDimensions.slice(0, 3);
  const completedDate = new Date(results.endTime).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Hasil Tes PAPI Kostick</h2>
        <span className="text-sm text-gray-500">
          Diselesaikan pada {completedDate}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Dimensi Dominan</h3>
        <div className="space-y-4">
          {topDimensions.map(({ dimension, score }) => (
            <div key={dimension} className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{dimension}</span>
                <span className="text-blue-700">{score}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${score * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3">Semua Dimensi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedDimensions.slice(3).map(({ dimension, score }) => (
            <div key={dimension} className="flex justify-between items-center">
              <span className="text-gray-700">{dimension}</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${score * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{score}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Link href="/papi/results" className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block">
          Lihat Hasil Lengkap
        </Link>
        <Link href="/papi" className="text-sm text-gray-600 hover:text-gray-800 font-medium inline-block">
          Ulangi Tes
        </Link>
      </div>
    </div>
  );
};

export default PapiDashboard;
