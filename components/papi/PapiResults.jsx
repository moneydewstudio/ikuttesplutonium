import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const PapiResults = ({ results }) => {
  const router = useRouter();

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Memproses hasil tes Anda...</p>
      </div>
    );
  }

  // Sort dimensions by score for visualization
  const sortedDimensions = Object.entries(results.dimensionScores || {})
    .map(([dimension, score]) => ({
      dimension,
      score,
      normalizedScore: results.normalizedScores?.[dimension] || 0,
      // These fields might not be available in the new structure
      description: dimension === 'Dominance' ? 'Kecenderungan untuk mempengaruhi atau mengontrol orang lain' :
                 dimension === 'Conformity' ? 'Kecenderungan untuk mengikuti aturan dan prosedur' :
                 dimension === 'Empathy' ? 'Kemampuan memahami perasaan dan kebutuhan orang lain' :
                 dimension === 'Vigor' ? 'Tingkat energi dan antusiasme dalam bekerja' :
                 dimension === 'Stability' ? 'Kemampuan menjaga kestabilan emosi dalam tekanan' :
                 dimension === 'Responsibility' ? 'Tingkat tanggung jawab dan komitmen' :
                 dimension === 'Sociability' ? 'Kecenderungan untuk berinteraksi dengan orang lain' :
                 dimension === 'Self-Control' ? 'Kemampuan mengendalikan diri dan emosi' :
                 dimension === 'Leadership' ? 'Kemampuan memimpin dan mengarahkan orang lain' :
                 dimension === 'Initiative' ? 'Kecenderungan untuk memulai tindakan dan ide baru' :
                 dimension === 'Independence' ? 'Kecenderungan untuk bekerja mandiri' : '',
      interpretation: score > 5 
        ? (dimension === 'Dominance' ? 'Memiliki jiwa kepemimpinan yang kuat, suka mengambil kendali' :
           dimension === 'Conformity' ? 'Sangat patuh pada aturan, disiplin dalam prosedur' :
           dimension === 'Empathy' ? 'Sangat peka terhadap perasaan orang lain, empatik' :
           dimension === 'Vigor' ? 'Penuh semangat dan energi dalam bekerja' :
           dimension === 'Stability' ? 'Sangat tenang dan stabil dalam situasi penuh tekanan' :
           dimension === 'Responsibility' ? 'Sangat bertanggung jawab dan dapat diandalkan' :
           dimension === 'Sociability' ? 'Sangat suka bersosialisasi dan bekerja dengan orang lain' :
           dimension === 'Self-Control' ? 'Sangat baik dalam mengendalikan emosi dan impuls' :
           dimension === 'Leadership' ? 'Memiliki kemampuan kepemimpinan yang kuat' :
           dimension === 'Initiative' ? 'Sangat proaktif dan penuh inisiatif' :
           dimension === 'Independence' ? 'Sangat mandiri dan otonom dalam bekerja' : '')
        : (dimension === 'Dominance' ? 'Lebih suka mengikuti arahan, menghindari konflik' :
           dimension === 'Conformity' ? 'Fleksibel terhadap aturan, lebih menyukai kebebasan' :
           dimension === 'Empathy' ? 'Lebih fokus pada tugas daripada perasaan orang lain' :
           dimension === 'Vigor' ? 'Lebih tenang dan terukur dalam bekerja' :
           dimension === 'Stability' ? 'Dapat terpengaruh oleh tekanan dan perubahan' :
           dimension === 'Responsibility' ? 'Lebih fleksibel dalam tanggung jawab' :
           dimension === 'Sociability' ? 'Lebih suka bekerja sendiri atau dalam kelompok kecil' :
           dimension === 'Self-Control' ? 'Lebih ekspresif dan spontan' :
           dimension === 'Leadership' ? 'Lebih suka berperan sebagai anggota tim' :
           dimension === 'Initiative' ? 'Lebih suka mengikuti arahan yang sudah ada' :
           dimension === 'Independence' ? 'Lebih suka bekerja dalam tim dengan arahan' : '')
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
        Hasil Tes PAPI Kostick Anda
      </h1>
      
      <p className="text-center text-gray-600 mb-8">
        Tes diselesaikan pada {new Date(results.completedAt).toLocaleString('id-ID')}
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profil Kepribadian</h2>
        <p className="mb-4">
          Berikut adalah profil kepribadian Anda berdasarkan 11 dimensi PAPI Kostick.
          Dimensi dengan skor lebih tinggi menunjukkan kecenderungan yang lebih kuat pada aspek tersebut.
        </p>
      </div>
      
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Dimensi Kepribadian</h3>
        
        <div className="space-y-6">
          {sortedDimensions.map(({ dimension, score, description, interpretation }) => (
            <div key={dimension} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800">{dimension}</h4>
                <span className="font-semibold text-blue-600">{score}/10</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${score * 10}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{description}</p>
              <p className="text-sm font-medium">
                Interpretasi: <span className="text-gray-800">{interpretation}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Dimensi Dominan</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="mb-2">
            <span className="font-medium">Tiga dimensi tertinggi Anda:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {sortedDimensions.slice(0, 3).map(({ dimension, score, interpretation }) => (
              <li key={dimension}>
                <span className="font-medium">{dimension} ({score}/10):</span> {interpretation}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Rekomendasi Pengembangan</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="mb-3">
            Berdasarkan profil kepribadian Anda, berikut adalah beberapa rekomendasi untuk pengembangan diri:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {sortedDimensions.slice(0, 3).map(({ dimension }) => (
              <li key={`rec-${dimension}`}>
                {getRecommendation(dimension)}
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
  );
};

// Helper function to generate recommendations based on dominant dimensions
const getRecommendation = (dimension) => {
  const recommendations = {
    'Dominance': 'Kembangkan kemampuan untuk mendelegasikan tugas dan mendengarkan pendapat orang lain dengan lebih baik.',
    'Conformity': 'Pertimbangkan untuk lebih fleksibel dalam situasi tertentu, sambil tetap menjaga kepatuhan pada aturan penting.',
    'Initiative': 'Gunakan kreativitas Anda untuk mengembangkan solusi inovatif, namun pastikan untuk menyelesaikan proyek yang sudah dimulai.',
    'Sociability': 'Manfaatkan keterampilan sosial Anda untuk membangun jaringan profesional yang lebih luas.',
    'Empathy': 'Gunakan kemampuan empati Anda untuk meningkatkan kerja tim dan resolusi konflik dalam lingkungan kerja.',
    'Leadership': 'Kembangkan gaya kepemimpinan yang lebih inklusif dengan melibatkan anggota tim dalam pengambilan keputusan.',
    'Responsibility': 'Teruskan komitmen Anda terhadap tanggung jawab, namun jaga keseimbangan untuk menghindari kelelahan.',
    'Vigor': 'Gunakan energi dan antusiasme Anda untuk memotivasi rekan kerja dan mencapai tujuan tim.',
    'Self-Control': 'Manfaatkan kemampuan pengendalian diri Anda dalam situasi penuh tekanan untuk menjadi contoh bagi rekan kerja.',
    'Stability': 'Gunakan ketahanan Anda terhadap stres untuk membantu tim tetap tenang dalam situasi sulit.',
    'Independence': 'Seimbangkan kemandirian Anda dengan kolaborasi tim untuk hasil yang optimal.'
  };
  
  return recommendations[dimension] || 'Terus kembangkan keterampilan dan pengetahuan Anda dalam bidang yang Anda minati.';
};

export default PapiResults;
