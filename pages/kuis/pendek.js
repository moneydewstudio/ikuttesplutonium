import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Quiz from '../../components/Quiz';
import { NextSeo } from 'next-seo';

// Sample questions by topic
const questionsByTopic = {
  'TWK': [
    {
      question: 'Pancasila sebagai dasar negara Indonesia disahkan pada tanggal?',
      options: ['18 Agustus 1945', '17 Agustus 1945', '1 Juni 1945', '22 Juni 1945'],
      correctAnswer: 0,
      explanation: 'Pancasila sebagai dasar negara disahkan pada tanggal 18 Agustus 1945 bersamaan dengan pengesahan UUD 1945.'
    },
    {
      question: 'Siapakah yang menggagas nama Pancasila?',
      options: ['Soekarno', 'Mohammad Yamin', 'Mohammad Hatta', 'Soepomo'],
      correctAnswer: 0,
      explanation: 'Soekarno adalah tokoh yang menggagas nama Pancasila dalam pidatonya pada tanggal 1 Juni 1945.'
    },
    {
      question: 'Apa lambang sila ke-3 Pancasila?',
      options: ['Pohon Beringin', 'Bintang', 'Kepala Banteng', 'Rantai'],
      correctAnswer: 2,
      explanation: 'Lambang sila ke-3 Pancasila (Persatuan Indonesia) adalah Kepala Banteng.'
    },
  ],
  'TIU': [
    {
      question: 'Jika 3x + 5 = 20, maka nilai x adalah...',
      options: ['5', '7', '8', '15'],
      correctAnswer: 0,
      explanation: '3x + 5 = 20 → 3x = 15 → x = 5'
    },
    {
      question: 'Antonim dari kata "Proliferasi" adalah...',
      options: ['Pengurangan', 'Penyebaran', 'Pembiakan', 'Penambahan'],
      correctAnswer: 0,
      explanation: 'Proliferasi berarti perkembangbiakan/penambahan dengan cepat. Antonimnya adalah pengurangan.'
    },
    {
      question: 'Jika semua manusia adalah makhluk hidup, dan beberapa makhluk hidup adalah hewan, maka...',
      options: ['Belum tentu semua manusia adalah hewan', 'Semua manusia adalah hewan', 'Tidak ada manusia yang hewan', 'Semua hewan adalah manusia'],
      correctAnswer: 0,
      explanation: 'Dari premis tersebut, kita hanya bisa menyimpulkan bahwa belum tentu semua manusia adalah hewan.'
    },
  ],
  'TKP': [
    {
      question: 'Apa yang Anda lakukan jika rekan kerja melakukan kesalahan yang berdampak pada pekerjaan Anda?',
      options: [
        'Memberitahu dengan baik dan membantu memperbaiki kesalahan', 
        'Melaporkan ke atasan', 
        'Menegur dengan keras di depan rekan lain', 
        'Membiarkan saja'
      ],
      correctAnswer: 0,
      explanation: 'Memberitahu dengan baik dan membantu memperbaiki kesalahan adalah sikap yang paling tepat dalam situasi ini.'
    },
    {
      question: 'Bagaimana sikap Anda jika mendapat tugas mendadak dari atasan saat Anda sudah memiliki banyak pekerjaan?',
      options: [
        'Menerima dan mengatur ulang prioritas pekerjaan', 
        'Menolak dengan alasan sudah banyak pekerjaan', 
        'Menerima tapi mengeluh kepada rekan kerja', 
        'Menerima tapi tidak mengerjakannya'
      ],
      correctAnswer: 0,
      explanation: 'Menerima dan mengatur ulang prioritas pekerjaan menunjukkan sikap profesional dan kemampuan adaptasi yang baik.'
    },
    {
      question: 'Apa yang Anda lakukan jika menemukan rekan kerja melakukan korupsi kecil-kecilan?',
      options: [
        'Mengingatkan bahwa tindakan tersebut melanggar aturan dan etika', 
        'Ikut melakukan hal yang sama', 
        'Diam saja karena bukan urusan Anda', 
        'Membicarakannya dengan rekan kerja lain'
      ],
      correctAnswer: 0,
      explanation: 'Mengingatkan bahwa tindakan tersebut melanggar aturan dan etika adalah sikap yang paling tepat untuk menjaga integritas.'
    },
  ]
};

const PendekPage = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    
    // Get all questions from the selected topic
    const allQuestionsForTopic = questionsByTopic[topic];
    
    // Randomly select 3 questions
    const randomQuestions = getRandomQuestions(allQuestionsForTopic, 3);
    
    setQuizQuestions(randomQuestions);
  };

  const getRandomQuestions = (questions, count) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <NextSeo
        title="Kuis Pendek CPNS - Ikuttes"
        description="Latihan cepat dengan 3 pertanyaan acak sesuai topik pilihan Anda."
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Kuis Pendek CPNS</h1>
        
        {!selectedTopic ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Pilih Topik</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Kuis pendek terdiri dari 3 pertanyaan acak sesuai topik yang Anda pilih.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button 
                onClick={() => handleTopicSelect('TWK')} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Tes Wawasan Kebangsaan (TWK)
              </button>
              <button 
                onClick={() => handleTopicSelect('TIU')} 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Tes Intelegensi Umum (TIU)
              </button>
              <button 
                onClick={() => handleTopicSelect('TKP')} 
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Tes Karakteristik Pribadi (TKP)
              </button>
            </div>
          </div>
        ) : !quizStarted ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Topik: {selectedTopic}</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Anda akan menjawab 3 pertanyaan acak tentang {selectedTopic}. 
              Setiap pertanyaan akan langsung menampilkan umpan balik setelah dijawab.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={handleStartQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Mulai Kuis
              </button>
              <button 
                onClick={() => setSelectedTopic('')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Ganti Topik
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Kuis {selectedTopic}</h2>
            <Quiz 
              questions={quizQuestions} 
              quizType={`pendek-${selectedTopic}`}
              showExplanations={true}
              showImmediateFeedback={true}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PendekPage;
