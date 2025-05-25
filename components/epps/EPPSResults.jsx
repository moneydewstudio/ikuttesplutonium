import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const EPPSResults = ({ results }) => {
  const router = useRouter();

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
        <p>Memproses hasil tes Anda...</p>
      </div>
    );
  }

  // Sort dimensions by score for visualization
  const sortedDimensions = Object.entries(results.dimensionScores || {})
    .map(([dimension, score]) => ({
      dimension,
      score,
      interpretation: results.interpretations?.[dimension] || 'medium',
      description: getDimensionDescription(dimension),
      interpretationText: getInterpretationText(dimension, results.interpretations?.[dimension] || 'medium')
    }))
    .sort((a, b) => b.score - a.score);

  const completedDate = new Date(results.endTime).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-8 border-4 border-black">
      <h1 className="text-2xl font-bold text-center text-black mb-2 relative">
        <span className="bg-yellow-300 px-4 py-1 -rotate-1 inline-block">Hasil Tes EPPS Anda</span>
      </h1>
      
      <p className="text-center text-gray-600 mb-8">
        Diselesaikan pada {completedDate}
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b-2 border-black pb-2">Profil Kepribadian</h2>
        
        <p className="mb-6 text-gray-700">
          Tes EPPS mengukur 15 kebutuhan kepribadian (motives) berdasarkan teori Murray. 
          Berikut adalah hasil pengukuran untuk setiap dimensi kepribadian Anda:
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          {sortedDimensions.map(({ dimension, score, interpretation, description, interpretationText }) => (
            <div key={dimension} className="border-2 border-black rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{dimension}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interpretation === 'high' ? 'bg-green-100 text-green-800' :
                  interpretation === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {score}/15 - {interpretation === 'high' ? 'Tinggi' : interpretation === 'medium' ? 'Sedang' : 'Rendah'}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className={`h-2.5 rounded-full ${
                    interpretation === 'high' ? 'bg-green-600' :
                    interpretation === 'medium' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${(score / 15) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{description}</p>
              <p className="text-sm font-medium">
                Interpretasi: <span className="text-gray-800">{interpretationText}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b-2 border-black pb-2">Dimensi Dominan</h3>
        <div className="bg-yellow-50 border-2 border-black rounded-lg p-4">
          <p className="mb-2">
            <span className="font-medium">Tiga dimensi tertinggi Anda:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {sortedDimensions.slice(0, 3).map(({ dimension, score, interpretationText }) => (
              <li key={dimension}>
                <span className="font-medium">{dimension} ({score}/15):</span> {interpretationText}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4 border-b-2 border-black pb-2">Rekomendasi Pengembangan</h3>
        <div className="bg-blue-50 border-2 border-black rounded-lg p-4">
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
          className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md transform hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          Kembali ke Dashboard
        </button>
        
        <Link href="/epps" className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md inline-block transform hover:-translate-y-1 hover:shadow-lg transition-all">
          Ulangi Tes
        </Link>
      </div>
    </div>
  );
};

// Helper function to get dimension descriptions
const getDimensionDescription = (dimension) => {
  const descriptions = {
    'Achievement': 'Kebutuhan untuk mencapai prestasi dan kesuksesan melalui usaha sendiri',
    'Deference': 'Kecenderungan untuk patuh, mengikuti pendapat atau kepemimpinan orang lain',
    'Order': 'Kebutuhan akan keteraturan, struktur, dan organisasi dalam kehidupan',
    'Exhibition': 'Keinginan untuk menjadi pusat perhatian dan mengekspresikan diri',
    'Autonomy': 'Kebutuhan untuk mandiri dan bebas dari batasan atau aturan orang lain',
    'Affiliation': 'Keinginan untuk membangun dan mempertahankan hubungan dengan orang lain',
    'Intraception': 'Kecenderungan untuk menganalisis motif dan perasaan diri sendiri dan orang lain',
    'Succorance': 'Kebutuhan untuk menerima bantuan, dukungan, dan perhatian dari orang lain',
    'Dominance': 'Keinginan untuk memimpin, mempengaruhi, dan mengendalikan orang lain',
    'Abasement': 'Kecenderungan untuk menerima kritik dan menyalahkan diri sendiri',
    'Nurturance': 'Keinginan untuk membantu, merawat, dan mendukung orang lain',
    'Change': 'Kebutuhan akan variasi, pengalaman baru, dan perubahan dalam rutinitas',
    'Endurance': 'Kemampuan untuk bertahan, menyelesaikan tugas, dan mengatasi rintangan',
    'Heterosexuality': 'Minat dalam membangun hubungan dengan lawan jenis',
    'Aggression': 'Kecenderungan untuk mengekspresikan pendapat secara tegas atau konfrontatif'
  };
  
  return descriptions[dimension] || 'Dimensi kepribadian yang mempengaruhi perilaku dan motivasi Anda';
};

// Helper function to get interpretation text based on dimension and score level
const getInterpretationText = (dimension, level) => {
  const interpretations = {
    'Achievement': {
      'high': 'Anda memiliki dorongan kuat untuk berprestasi dan mencapai tujuan. Anda menikmati tantangan dan bekerja keras untuk mencapai kesuksesan.',
      'medium': 'Anda memiliki keseimbangan antara keinginan berprestasi dan menikmati proses. Anda menghargai pencapaian namun tidak terobsesi dengan kesuksesan.',
      'low': 'Anda cenderung lebih santai dalam mencapai tujuan dan mungkin lebih mementingkan aspek lain dalam hidup daripada pencapaian.'
    },
    'Deference': {
      'high': 'Anda cenderung menghormati otoritas dan mengikuti arahan orang lain. Anda nyaman dengan struktur dan hirarki yang jelas.',
      'medium': 'Anda menghargai pendapat orang lain namun tetap mempertahankan pandangan sendiri. Anda selektif dalam mengikuti arahan.',
      'low': 'Anda lebih suka menentukan arah sendiri dan mungkin kurang nyaman dengan otoritas atau arahan dari orang lain.'
    },
    'Order': {
      'high': 'Anda sangat menyukai keteraturan, struktur, dan organisasi. Anda merasa nyaman dengan rutinitas dan perencanaan yang jelas.',
      'medium': 'Anda menghargai keteraturan namun juga bisa beradaptasi dengan situasi yang kurang terstruktur jika diperlukan.',
      'low': 'Anda lebih fleksibel dan spontan, lebih nyaman dengan pendekatan yang kurang terstruktur.'
    },
    'Exhibition': {
      'high': 'Anda menikmati menjadi pusat perhatian dan mengekspresikan diri. Anda percaya diri dalam situasi sosial.',
      'medium': 'Anda nyaman mengekspresikan diri dalam situasi tertentu namun tidak selalu mencari perhatian.',
      'low': 'Anda cenderung lebih reservasi dan mungkin lebih nyaman berada di latar belakang daripada menjadi pusat perhatian.'
    },
    'Autonomy': {
      'high': 'Anda sangat menghargai kebebasan dan kemandirian. Anda lebih suka bekerja dengan cara Anda sendiri tanpa banyak pengawasan.',
      'medium': 'Anda menyeimbangkan kebutuhan akan kemandirian dengan kemampuan bekerja dalam struktur yang ada.',
      'low': 'Anda lebih nyaman bekerja dalam struktur yang jelas dan mungkin lebih suka bekerja sebagai bagian dari tim.'
    },
    'Affiliation': {
      'high': 'Anda sangat menghargai hubungan sosial dan menikmati bekerja dengan orang lain. Anda aktif membangun dan memelihara hubungan.',
      'medium': 'Anda menikmati interaksi sosial namun juga menghargai waktu sendiri. Anda selektif dalam membangun hubungan.',
      'low': 'Anda mungkin lebih mandiri secara sosial dan tidak terlalu mementingkan membangun banyak hubungan sosial.'
    },
    'Intraception': {
      'high': 'Anda sangat introspektif dan tertarik menganalisis motif dan perasaan. Anda memiliki kesadaran diri yang tinggi.',
      'medium': 'Anda memiliki keseimbangan antara refleksi diri dan tindakan. Anda cukup memahami motivasi diri dan orang lain.',
      'low': 'Anda mungkin lebih fokus pada tindakan daripada analisis mendalam tentang motivasi atau perasaan.'
    },
    'Succorance': {
      'high': 'Anda nyaman mencari dukungan dan bantuan dari orang lain. Anda menghargai bimbingan dan perhatian.',
      'medium': 'Anda seimbang antara kemandirian dan mencari dukungan. Anda mencari bantuan saat diperlukan.',
      'low': 'Anda sangat mandiri dan mungkin lebih suka menyelesaikan masalah sendiri daripada mencari bantuan.'
    },
    'Dominance': {
      'high': 'Anda memiliki kecenderungan kuat untuk memimpin dan mempengaruhi orang lain. Anda nyaman mengambil kendali situasi.',
      'medium': 'Anda dapat mengambil peran kepemimpinan bila diperlukan namun juga nyaman menjadi anggota tim.',
      'low': 'Anda mungkin lebih nyaman mengikuti daripada memimpin dan lebih suka membiarkan orang lain mengambil kendali.'
    },
    'Abasement': {
      'high': 'Anda cenderung kritis terhadap diri sendiri dan mudah menerima kesalahan. Anda mungkin terlalu keras pada diri sendiri.',
      'medium': 'Anda memiliki pandangan yang seimbang tentang kekuatan dan kelemahan diri. Anda dapat menerima kritik secara konstruktif.',
      'low': 'Anda cenderung percaya diri dan mungkin kurang menerima kritik atau menyalahkan diri sendiri.'
    },
    'Nurturance': {
      'high': 'Anda memiliki keinginan kuat untuk merawat dan membantu orang lain. Anda empati dan peduli pada kesejahteraan orang lain.',
      'medium': 'Anda peduli pada orang lain namun menyeimbangkannya dengan kebutuhan diri sendiri.',
      'low': 'Anda mungkin lebih fokus pada tujuan dan kebutuhan pribadi daripada merawat orang lain.'
    },
    'Change': {
      'high': 'Anda sangat menyukai variasi dan pengalaman baru. Anda mudah bosan dengan rutinitas dan selalu mencari perubahan.',
      'medium': 'Anda menikmati beberapa variasi namun juga menghargai stabilitas. Anda selektif terhadap perubahan.',
      'low': 'Anda lebih menyukai konsistensi dan stabilitas. Anda mungkin kurang nyaman dengan perubahan yang sering.'
    },
    'Endurance': {
      'high': 'Anda memiliki ketekunan dan ketahanan yang tinggi. Anda bertahan menghadapi tantangan dan menyelesaikan apa yang Anda mulai.',
      'medium': 'Anda cukup tekun namun juga tahu kapan harus beralih ke pendekatan baru jika diperlukan.',
      'low': 'Anda mungkin lebih fleksibel dalam mengejar tujuan dan lebih mudah beralih ke arah baru jika menghadapi hambatan.'
    },
    'Heterosexuality': {
      'high': 'Anda sangat tertarik pada interaksi sosial dan hubungan dengan lawan jenis.',
      'medium': 'Anda memiliki minat yang seimbang dalam hubungan dengan lawan jenis.',
      'low': 'Anda mungkin kurang fokus pada hubungan romantis atau interaksi dengan lawan jenis.'
    },
    'Aggression': {
      'high': 'Anda cenderung tegas dan langsung dalam mengekspresikan pendapat. Anda tidak takut konfrontasi jika diperlukan.',
      'medium': 'Anda dapat bersikap tegas bila diperlukan namun umumnya mencari pendekatan yang lebih diplomatis.',
      'low': 'Anda cenderung menghindari konfrontasi dan mungkin lebih suka pendekatan yang harmonis dan kooperatif.'
    }
  };
  
  return interpretations[dimension]?.[level] || 'Tidak ada interpretasi spesifik tersedia.';
};

// Helper function to generate recommendations based on dominant dimensions
const getRecommendation = (dimension) => {
  const recommendations = {
    'Achievement': 'Manfaatkan dorongan berprestasi Anda dengan menetapkan tujuan yang menantang namun realistis. Pastikan untuk merayakan pencapaian kecil dalam perjalanan menuju tujuan besar.',
    'Deference': 'Seimbangkan kecenderungan mengikuti arahan dengan mengembangkan pendapat dan keputusan mandiri. Cari kesempatan untuk memimpin dalam area yang Anda kuasai.',
    'Order': 'Manfaatkan kecintaan Anda pada keteraturan untuk menciptakan sistem yang efisien, namun juga kembangkan fleksibilitas untuk menghadapi situasi yang kurang terstruktur.',
    'Exhibition': 'Gunakan kemampuan Anda untuk menarik perhatian secara positif dalam presentasi atau komunikasi publik, namun juga kembangkan keterampilan mendengarkan aktif.',
    'Autonomy': 'Cari peran yang memberikan kebebasan dan kemandirian, namun juga kembangkan kemampuan bekerja dalam tim dan berkolaborasi saat diperlukan.',
    'Affiliation': 'Manfaatkan keterampilan sosial Anda untuk membangun jaringan profesional yang kuat, namun juga kembangkan kemampuan bekerja mandiri saat diperlukan.',
    'Intraception': 'Gunakan pemahaman mendalam Anda tentang motivasi dan perasaan untuk meningkatkan kecerdasan emosional dan kepemimpinan, namun hindari terlalu banyak analisis yang menghambat tindakan.',
    'Succorance': 'Seimbangkan kebutuhan akan dukungan dengan mengembangkan kemandirian. Cari mentor yang dapat membantu Anda tumbuh, namun juga bangun kepercayaan diri dalam kemampuan Anda sendiri.',
    'Dominance': 'Kembangkan gaya kepemimpinan yang lebih kolaboratif dan inklusif. Gunakan pengaruh Anda untuk memberdayakan orang lain, bukan hanya mengarahkan mereka.',
    'Abasement': 'Kembangkan pandangan yang lebih seimbang tentang diri sendiri dengan mengakui kekuatan dan pencapaian Anda. Terima kritik sebagai kesempatan untuk tumbuh, bukan sebagai konfirmasi kelemahan.',
    'Nurturance': 'Gunakan keinginan membantu orang lain secara strategis, namun juga pastikan untuk menjaga keseimbangan dan tidak mengabaikan kebutuhan diri sendiri.',
    'Change': 'Manfaatkan kecintaan Anda pada variasi dan hal baru untuk inovasi, namun juga kembangkan kemampuan untuk tetap fokus dan konsisten pada proyek jangka panjang.',
    'Endurance': 'Gunakan ketekunan Anda untuk mengatasi tantangan kompleks, namun juga kembangkan fleksibilitas untuk mengubah pendekatan saat diperlukan.',
    'Heterosexuality': 'Manfaatkan keterampilan interpersonal Anda dalam membangun hubungan profesional yang positif dengan berbagai orang, sambil menjaga batasan yang sehat dan profesional.',
    'Aggression': 'Kembangkan ketegasan yang konstruktif dan keterampilan negosiasi. Gunakan energi Anda untuk advokasi positif, bukan konfrontasi yang tidak perlu.'
  };
  
  return recommendations[dimension] || 'Terus kembangkan keterampilan dan pengetahuan Anda dalam bidang yang Anda minati.';
};

export default EPPSResults;
