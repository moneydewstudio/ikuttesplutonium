import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Quiz from '../../components/Quiz';
import { NextSeo } from 'next-seo';

// Sample questions for the tryout
const sampleQuestions = [
  {
    question: 'Siapakah presiden pertama Republik Indonesia?',
    options: ['Soekarno', 'Soeharto', 'BJ Habibie', 'Megawati'],
    correctAnswer: 0,
    explanation: 'Ir. Soekarno adalah presiden pertama Republik Indonesia yang menjabat dari tahun 1945 hingga 1967.'
  },
  {
    question: 'Kapan Indonesia merdeka?',
    options: ['17 Agustus 1945', '17 Agustus 1949', '17 Agustus 1950', '17 Agustus 1955'],
    correctAnswer: 0,
    explanation: 'Indonesia memproklamasikan kemerdekaannya pada tanggal 17 Agustus 1945.'
  },
  {
    question: 'Apa kepanjangan dari CPNS?',
    options: ['Calon Pegawai Negeri Sipil', 'Calon Pekerja Negara Sipil', 'Calon Pegawai Nasional Sipil', 'Calon Pekerja Negeri Sipil'],
    correctAnswer: 0,
    explanation: 'CPNS adalah singkatan dari Calon Pegawai Negeri Sipil.'
  },
  {
    question: 'Apa dasar negara Indonesia?',
    options: ['Pancasila', 'UUD 1945', 'Bhinneka Tunggal Ika', 'Tri Dharma'],
    correctAnswer: 0,
    explanation: 'Pancasila adalah dasar negara Indonesia yang terdiri dari 5 sila.'
  },
  {
    question: 'Siapakah yang menggantikan Soekarno sebagai presiden Indonesia?',
    options: ['Soeharto', 'BJ Habibie', 'Abdurrahman Wahid', 'Megawati'],
    correctAnswer: 0,
    explanation: 'Soeharto adalah presiden kedua Indonesia yang menggantikan Soekarno dan menjabat dari tahun 1967 hingga 1998.'
  },
  {
    question: 'Berapa jumlah provinsi di Indonesia saat ini?',
    options: ['34', '33', '35', '36'],
    correctAnswer: 0,
    explanation: 'Indonesia saat ini memiliki 34 provinsi, dengan provinsi terbaru adalah Kalimantan Utara yang dibentuk pada tahun 2012.'
  },
  {
    question: 'Apa ibukota Indonesia?',
    options: ['Jakarta', 'Bandung', 'Surabaya', 'Nusantara'],
    correctAnswer: 0,
    explanation: 'Jakarta adalah ibukota Indonesia saat ini, meskipun ada rencana pemindahan ibukota ke Nusantara di Kalimantan Timur.'
  },
  {
    question: 'Siapakah tokoh yang dijuluki sebagai Bapak Koperasi Indonesia?',
    options: ['Mohammad Hatta', 'Soekarno', 'Ki Hajar Dewantara', 'Tan Malaka'],
    correctAnswer: 0,
    explanation: 'Mohammad Hatta (Bung Hatta) dikenal sebagai Bapak Koperasi Indonesia karena jasanya dalam mengembangkan koperasi di Indonesia.'
  },
  {
    question: 'Apa nama lembaga yang menyelenggarakan seleksi CPNS?',
    options: ['BKN', 'KPK', 'BPKP', 'ANRI'],
    correctAnswer: 0,
    explanation: 'BKN (Badan Kepegawaian Negara) adalah lembaga yang bertanggung jawab dalam penyelenggaraan seleksi CPNS.'
  },
  {
    question: 'Apa singkatan dari SKD dalam konteks ujian CPNS?',
    options: ['Seleksi Kompetensi Dasar', 'Sistem Kelulusan Dasar', 'Standar Kompetensi Dasar', 'Seleksi Kandidat Dasar'],
    correctAnswer: 0,
    explanation: 'SKD adalah singkatan dari Seleksi Kompetensi Dasar, yang merupakan tahapan pertama dalam seleksi CPNS.'
  }
];

const TryoutPage = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    // Timer countdown logic
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up logic
      alert('Waktu habis! Kuis akan diselesaikan secara otomatis.');
      // Handle quiz completion due to timeout
      // This would typically submit whatever answers the user has provided
    }

    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimerActive(true);
  };

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <NextSeo
        title="Tryout CPNS - Ikuttes"
        description="Latihan ujian CPNS lengkap dengan simulasi waktu dan soal-soal yang mirip dengan ujian sebenarnya."
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Tryout CPNS Lengkap</h1>
        
        {!quizStarted ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Petunjuk Tryout</h2>
            <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300">
              <li className="mb-2">Tryout ini terdiri dari {sampleQuestions.length} soal.</li>
              <li className="mb-2">Waktu pengerjaan adalah 30 menit.</li>
              <li className="mb-2">Setiap soal memiliki 4 pilihan jawaban.</li>
              <li className="mb-2">Setelah selesai, Anda akan melihat skor dan penjelasan jawaban.</li>
              <li className="mb-2">Hasil akan disimpan dan muncul di profil Anda.</li>
            </ul>
            <button 
              onClick={handleStartQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Mulai Tryout
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tryout CPNS</h2>
              <div className="text-lg font-medium text-red-600 dark:text-red-400">
                Waktu: {formatTime(timeLeft)}
              </div>
            </div>
            <Quiz 
              questions={sampleQuestions} 
              quizType="tryout" 
              showExplanations={true}
              timeLeft={timeLeft}
              setTimerActive={setTimerActive}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TryoutPage;
