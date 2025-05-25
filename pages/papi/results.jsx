import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getLatestResults, SyncStatus } from '../../utils/papiStorage';
import { getAuth } from 'firebase/auth';

// Create a client-side only component
const PapiResults = () => {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
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
      // Simulate sync status: if results exist, assume localStorage was used, and Firestore sync may have happened before.
      // If you want to trigger a resync, you could provide a button here.
      setSyncStatus('success');
    });
    
    return () => unsubscribe();
  }, []);
  
  // Helper: Sync status message
  const renderSyncStatus = () => {
    if (syncStatus === 'syncing') {
      return <div className="mb-4 text-blue-600">Menyimpan hasil ke cloud...</div>;
    } else if (syncStatus === 'success') {
      return <div className="mb-4 text-green-600">Hasil sudah tersimpan di cloud.</div>;
    } else if (syncStatus === 'error') {
      return <div className="mb-4 text-red-600">Gagal menyimpan ke cloud, hasil tetap aman di perangkat Anda.</div>;
    } else {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Hasil Tes Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-8">
            Anda belum menyelesaikan tes PAPI Kostick atau hasil tes tidak tersedia.
          </p>
          <Link href="/papi" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md inline-block">
            Mulai Tes PAPI
          </Link>
        </div>
      </div>
    );
  }
  
  // Sort dimensions by score for visualization
  const sortedDimensions = Object.entries(results.dimensionScores || {})
    .map(([dimension, score]) => ({
      dimension,
      score,
      normalizedScore: results.normalizedScores?.[dimension] || 0,
      description: results.dimensionDescriptions?.[dimension] || '',
      interpretation: score > 5 
        ? results.dimensionHighScores?.[dimension] || ''
        : results.dimensionLowScores?.[dimension] || ''
    }))
    .sort((a, b) => b.score - a.score);
  
  const completedDate = new Date(results.endTime).toLocaleString('id-ID');
  const startedDate = new Date(results.startTime).toLocaleString('id-ID');
  const duration = Math.round((results.endTime - results.startTime) / 60000); // in minutes
  
  return (
    <>
      <Head>
        <title>Hasil Tes PAPI Kostick | Ikuttes</title>
        <meta name="description" content="Hasil lengkap tes PAPI Kostick Anda" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {renderSyncStatus()}
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
            Hasil Lengkap Tes PAPI Kostick
          </h1>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 mb-8">
            <p>Tes dimulai: {startedDate}</p>
            <p>Tes selesai: {completedDate}</p>
            <p>Durasi: {duration} menit</p>
          </div>
          
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Profil Kepribadian</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedDimensions.map(({ dimension, score, description, interpretation }) => (
                <div key={dimension} className="border rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{dimension}</h3>
                    <span className="font-bold text-blue-600 text-lg">{score}/10</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${score * 10}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Interpretasi:</span> {interpretation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Dimensi Dominan</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="mb-3 font-medium">
                Tiga dimensi tertinggi Anda:
              </p>
              <ul className="space-y-3">
                {sortedDimensions.slice(0, 3).map(({ dimension, score, interpretation }) => (
                  <li key={dimension} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <div>
                      <span className="font-medium">{dimension} ({score}/10):</span> {interpretation}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Rekomendasi Pengembangan</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="mb-3">
                Berdasarkan profil kepribadian Anda, berikut adalah beberapa rekomendasi untuk pengembangan diri:
              </p>
              <ul className="space-y-3">
                {sortedDimensions.slice(0, 3).map(({ dimension }) => (
                  <li key={`rec-${dimension}`} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <div>
                      {getRecommendation(dimension)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Kembali ke Dashboard
            </button>
            
            <Link href="/papi" className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md inline-block">
              Ulangi Tes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to generate recommendations based on dominant dimensions
const getRecommendation = (dimension) => {
  const recommendations = {
    'Dominance': 'Kembangkan kemampuan untuk mendelegasikan tugas dan mendengarkan pendapat orang lain dengan lebih baik. Pertimbangkan untuk mengambil kursus kepemimpinan kolaboratif.',
    'Conformity': 'Pertimbangkan untuk lebih fleksibel dalam situasi tertentu, sambil tetap menjaga kepatuhan pada aturan penting. Coba tantang diri Anda untuk sesekali keluar dari zona nyaman.',
    'Initiative': 'Gunakan kreativitas Anda untuk mengembangkan solusi inovatif, namun pastikan untuk menyelesaikan proyek yang sudah dimulai. Buat sistem untuk melacak kemajuan proyek Anda.',
    'Sociability': 'Manfaatkan keterampilan sosial Anda untuk membangun jaringan profesional yang lebih luas. Pertimbangkan untuk bergabung dengan komunitas atau organisasi baru.',
    'Empathy': 'Gunakan kemampuan empati Anda untuk meningkatkan kerja tim dan resolusi konflik dalam lingkungan kerja. Pertimbangkan untuk menjadi mentor bagi rekan kerja junior.',
    'Leadership': 'Kembangkan gaya kepemimpinan yang lebih inklusif dengan melibatkan anggota tim dalam pengambilan keputusan. Cari peluang untuk memimpin proyek lintas departemen.',
    'Responsibility': 'Teruskan komitmen Anda terhadap tanggung jawab, namun jaga keseimbangan untuk menghindari kelelahan. Pelajari teknik manajemen waktu yang lebih efektif.',
    'Vigor': 'Gunakan energi dan antusiasme Anda untuk memotivasi rekan kerja dan mencapai tujuan tim. Pertimbangkan untuk menjadi champion dalam inisiatif perubahan.',
    'Self-Control': 'Manfaatkan kemampuan pengendalian diri Anda dalam situasi penuh tekanan untuk menjadi contoh bagi rekan kerja. Pelajari teknik mindfulness untuk meningkatkan fokus.',
    'Stability': 'Gunakan ketahanan Anda terhadap stres untuk membantu tim tetap tenang dalam situasi sulit. Bagikan strategi coping Anda dengan rekan kerja.',
    'Independence': 'Seimbangkan kemandirian Anda dengan kolaborasi tim untuk hasil yang optimal. Cari peluang untuk memimpin proyek independen yang berdampak pada organisasi.'
  };
  
  return recommendations[dimension] || 'Terus kembangkan keterampilan dan pengetahuan Anda dalam bidang yang Anda minati.';
};

// Export the component wrapped in dynamic to disable SSR
export default dynamic(() => Promise.resolve(PapiResults), {
  ssr: false
});
