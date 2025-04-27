// Local questions data store
// This file contains a core set of questions that are bundled with the app
// Additional questions will be fetched from Firebase

export const localQuestions = {
  'TWK': [
    {
      id: 'twk-001',
      question: 'Pancasila sebagai dasar negara Indonesia disahkan pada tanggal?',
      options: ['18 Agustus 1945', '17 Agustus 1945', '1 Juni 1945', '22 Juni 1945'],
      correctAnswer: 0,
      explanation: 'Pancasila sebagai dasar negara disahkan pada tanggal 18 Agustus 1945 bersamaan dengan pengesahan UUD 1945.',
      difficulty: 'easy',
      tags: ['pancasila', 'sejarah']
    },
    {
      id: 'twk-002',
      question: 'Siapakah yang menggagas nama Pancasila?',
      options: ['Soekarno', 'Mohammad Yamin', 'Mohammad Hatta', 'Soepomo'],
      correctAnswer: 0,
      explanation: 'Soekarno adalah tokoh yang menggagas nama Pancasila dalam pidatonya pada tanggal 1 Juni 1945.',
      difficulty: 'easy',
      tags: ['pancasila', 'tokoh']
    },
    {
      id: 'twk-003',
      question: 'Apa lambang sila ke-3 Pancasila?',
      options: ['Pohon Beringin', 'Bintang', 'Kepala Banteng', 'Rantai'],
      correctAnswer: 2,
      explanation: 'Lambang sila ke-3 Pancasila (Persatuan Indonesia) adalah Kepala Banteng.',
      difficulty: 'medium',
      tags: ['pancasila', 'lambang']
    },
    {
      id: 'twk-004',
      question: 'Siapakah presiden pertama Republik Indonesia?',
      options: ['Soekarno', 'Soeharto', 'BJ Habibie', 'Megawati'],
      correctAnswer: 0,
      explanation: 'Ir. Soekarno adalah presiden pertama Republik Indonesia yang menjabat dari tahun 1945 hingga 1967.',
      difficulty: 'easy',
      tags: ['sejarah', 'tokoh']
    },
    {
      id: 'twk-005',
      question: 'Kapan Indonesia merdeka?',
      options: ['17 Agustus 1945', '17 Agustus 1949', '17 Agustus 1950', '17 Agustus 1955'],
      correctAnswer: 0,
      explanation: 'Indonesia memproklamasikan kemerdekaannya pada tanggal 17 Agustus 1945 oleh Soekarno-Hatta.',
      difficulty: 'easy',
      tags: ['sejarah']
    }
  ],
  'TIU': [
    {
      id: 'tiu-001',
      question: 'Jika 3x + 5 = 20, maka nilai x adalah...',
      options: ['5', '7', '8', '15'],
      correctAnswer: 0,
      explanation: '3x + 5 = 20 → 3x = 15 → x = 5',
      difficulty: 'easy',
      tags: ['matematika', 'aljabar']
    },
    {
      id: 'tiu-002',
      question: 'Antonim dari kata "Proliferasi" adalah...',
      options: ['Pengurangan', 'Penyebaran', 'Pembiakan', 'Penambahan'],
      correctAnswer: 0,
      explanation: 'Proliferasi berarti perkembangbiakan/penambahan dengan cepat. Antonimnya adalah pengurangan.',
      difficulty: 'hard',
      tags: ['verbal', 'antonim']
    },
    {
      id: 'tiu-003',
      question: 'Jika semua manusia adalah makhluk hidup, dan beberapa makhluk hidup adalah hewan, maka...',
      options: ['Belum tentu semua manusia adalah hewan', 'Semua manusia adalah hewan', 'Tidak ada manusia yang hewan', 'Semua hewan adalah manusia'],
      correctAnswer: 0,
      explanation: 'Dari premis tersebut, kita hanya bisa menyimpulkan bahwa belum tentu semua manusia adalah hewan.',
      difficulty: 'medium',
      tags: ['logika']
    },
    {
      id: 'tiu-004',
      question: 'Berapakah hasil dari 15% dari 80?',
      options: ['12', '15', '8', '20'],
      correctAnswer: 0,
      explanation: '15% dari 80 = 0,15 × 80 = 12',
      difficulty: 'easy',
      tags: ['matematika', 'persentase']
    },
    {
      id: 'tiu-005',
      question: 'Manakah yang bukan merupakan sinonim dari kata "Efisien"?',
      options: ['Boros', 'Hemat', 'Tepat guna', 'Ekonomis'],
      correctAnswer: 0,
      explanation: 'Efisien berarti hemat, tepat guna, atau ekonomis. Boros adalah antonim dari efisien.',
      difficulty: 'medium',
      tags: ['verbal', 'sinonim']
    }
  ],
  'TKP': [
    {
      id: 'tkp-001',
      question: 'Apa yang Anda lakukan jika rekan kerja melakukan kesalahan yang berdampak pada pekerjaan Anda?',
      options: [
        'Memberitahu dengan baik dan membantu memperbaiki kesalahan', 
        'Melaporkan ke atasan', 
        'Menegur dengan keras di depan rekan lain', 
        'Membiarkan saja'
      ],
      correctAnswer: 0,
      explanation: 'Memberitahu dengan baik dan membantu memperbaiki kesalahan adalah sikap yang paling tepat dalam situasi ini.',
      difficulty: 'medium',
      tags: ['kerja sama', 'komunikasi']
    },
    {
      id: 'tkp-002',
      question: 'Bagaimana sikap Anda jika mendapat tugas mendadak dari atasan saat Anda sudah memiliki banyak pekerjaan?',
      options: [
        'Menerima dan mengatur ulang prioritas pekerjaan', 
        'Menolak dengan alasan sudah banyak pekerjaan', 
        'Menerima tapi mengeluh kepada rekan kerja', 
        'Menerima tapi tidak mengerjakannya'
      ],
      correctAnswer: 0,
      explanation: 'Menerima dan mengatur ulang prioritas pekerjaan menunjukkan sikap profesional dan kemampuan adaptasi yang baik.',
      difficulty: 'medium',
      tags: ['manajemen waktu', 'profesionalisme']
    },
    {
      id: 'tkp-003',
      question: 'Apa yang Anda lakukan jika menemukan rekan kerja melakukan korupsi kecil-kecilan?',
      options: [
        'Mengingatkan bahwa tindakan tersebut melanggar aturan dan etika', 
        'Ikut melakukan hal yang sama', 
        'Diam saja karena bukan urusan Anda', 
        'Membicarakannya dengan rekan kerja lain'
      ],
      correctAnswer: 0,
      explanation: 'Mengingatkan bahwa tindakan tersebut melanggar aturan dan etika adalah sikap yang paling tepat untuk menjaga integritas.',
      difficulty: 'hard',
      tags: ['etika', 'integritas']
    },
    {
      id: 'tkp-004',
      question: 'Bagaimana Anda menyikapi kritik dari atasan terhadap hasil kerja Anda?',
      options: [
        'Menerima dengan terbuka dan menjadikannya pembelajaran', 
        'Membela diri dan mencari pembenaran', 
        'Menerima tapi menganggapnya tidak adil', 
        'Mengabaikan kritik tersebut'
      ],
      correctAnswer: 0,
      explanation: 'Menerima kritik dengan terbuka dan menjadikannya pembelajaran menunjukkan sikap yang dewasa dan profesional.',
      difficulty: 'medium',
      tags: ['profesionalisme', 'pembelajaran']
    },
    {
      id: 'tkp-005',
      question: 'Apa yang Anda lakukan jika diminta untuk menggantikan rekan yang tidak masuk kerja?',
      options: [
        'Bersedia membantu dan mempelajari tugas rekan tersebut', 
        'Menolak karena bukan tanggung jawab Anda', 
        'Menerima tapi tidak mengerjakannya dengan sungguh-sungguh', 
        'Menerima sambil mengeluh kepada rekan lain'
      ],
      correctAnswer: 0,
      explanation: 'Bersedia membantu dan mempelajari tugas rekan menunjukkan sikap kooperatif dan kemauan untuk berkembang.',
      difficulty: 'easy',
      tags: ['kerja sama', 'adaptasi']
    }
  ]
};

// Sample full tryout questions
export const sampleTryoutQuestions = [
  {
    id: 'tryout-001',
    question: 'Siapakah presiden pertama Republik Indonesia?',
    options: ['Soekarno', 'Soeharto', 'BJ Habibie', 'Megawati'],
    correctAnswer: 0,
    explanation: 'Ir. Soekarno adalah presiden pertama Republik Indonesia yang menjabat dari tahun 1945 hingga 1967.',
    category: 'TWK',
    difficulty: 'easy',
    tags: ['sejarah', 'tokoh']
  },
  {
    id: 'tryout-002',
    question: 'Kapan Indonesia merdeka?',
    options: ['17 Agustus 1945', '17 Agustus 1949', '17 Agustus 1950', '17 Agustus 1955'],
    correctAnswer: 0,
    explanation: 'Indonesia memproklamasikan kemerdekaannya pada tanggal 17 Agustus 1945 oleh Soekarno-Hatta.',
    category: 'TWK',
    difficulty: 'easy',
    tags: ['sejarah']
  },
  {
    id: 'tryout-003',
    question: 'Apa isi Pancasila sila ke-3?',
    options: ['Persatuan Indonesia', 'Kemanusiaan yang adil dan beradab', 'Keadilan sosial bagi seluruh rakyat Indonesia', 'Ketuhanan Yang Maha Esa'],
    correctAnswer: 0,
    explanation: 'Sila ke-3 Pancasila adalah "Persatuan Indonesia".',
    category: 'TWK',
    difficulty: 'easy',
    tags: ['pancasila']
  },
  {
    id: 'tryout-004',
    question: 'Siapakah yang menggantikan Soekarno sebagai presiden Indonesia?',
    options: ['Soeharto', 'BJ Habibie', 'Abdurrahman Wahid', 'Megawati'],
    correctAnswer: 0,
    explanation: 'Soeharto adalah presiden kedua Indonesia yang menggantikan Soekarno dan menjabat dari tahun 1967 hingga 1998.',
    category: 'TWK',
    difficulty: 'easy',
    tags: ['sejarah', 'tokoh']
  },
  {
    id: 'tryout-005',
    question: 'Berapakah hasil dari 25% dari 120?',
    options: ['30', '25', '35', '40'],
    correctAnswer: 0,
    explanation: '25% dari 120 = 0,25 × 120 = 30',
    category: 'TIU',
    difficulty: 'easy',
    tags: ['matematika', 'persentase']
  },
  {
    id: 'tryout-006',
    question: 'Jika 2x + 7 = 15, maka nilai x adalah...',
    options: ['4', '5', '6', '7'],
    correctAnswer: 0,
    explanation: '2x + 7 = 15 → 2x = 8 → x = 4',
    category: 'TIU',
    difficulty: 'easy',
    tags: ['matematika', 'aljabar']
  },
  {
    id: 'tryout-007',
    question: 'Antonim dari kata "Konstruktif" adalah...',
    options: ['Destruktif', 'Produktif', 'Efektif', 'Kreatif'],
    correctAnswer: 0,
    explanation: 'Konstruktif berarti membangun atau bersifat membina. Antonimnya adalah destruktif yang berarti merusak.',
    category: 'TIU',
    difficulty: 'medium',
    tags: ['verbal', 'antonim']
  },
  {
    id: 'tryout-008',
    question: 'Bagaimana sikap Anda jika mendapat kritik dari rekan kerja?',
    options: [
      'Menerima dengan terbuka dan mengevaluasi diri', 
      'Membela diri dan mencari kesalahan rekan', 
      'Mengabaikan kritik tersebut', 
      'Marah dan membalas dengan kritik'
    ],
    correctAnswer: 0,
    explanation: 'Menerima kritik dengan terbuka dan mengevaluasi diri menunjukkan kedewasaan dan keinginan untuk berkembang.',
    category: 'TKP',
    difficulty: 'medium',
    tags: ['profesionalisme', 'komunikasi']
  },
  {
    id: 'tryout-009',
    question: 'Apa yang Anda lakukan jika melihat rekan kerja kesulitan dengan pekerjaannya?',
    options: [
      'Menawarkan bantuan jika Anda memiliki waktu', 
      'Membiarkannya karena bukan tanggung jawab Anda', 
      'Melaporkan ke atasan bahwa rekan tersebut tidak kompeten', 
      'Menunggu sampai dia meminta bantuan'
    ],
    correctAnswer: 0,
    explanation: 'Menawarkan bantuan menunjukkan sikap kooperatif dan empati terhadap rekan kerja.',
    category: 'TKP',
    difficulty: 'easy',
    tags: ['kerja sama', 'empati']
  },
  {
    id: 'tryout-010',
    question: 'Bagaimana Anda menyikapi perubahan kebijakan di tempat kerja?',
    options: [
      'Beradaptasi dan mencari sisi positif dari perubahan tersebut', 
      'Menolak dan tetap bekerja dengan cara lama', 
      'Menerima tapi mengeluh kepada rekan kerja', 
      'Mengikuti perubahan sambil mencari pekerjaan baru'
    ],
    correctAnswer: 0,
    explanation: 'Beradaptasi dan mencari sisi positif menunjukkan fleksibilitas dan sikap positif terhadap perubahan.',
    category: 'TKP',
    difficulty: 'medium',
    tags: ['adaptasi', 'sikap positif']
  }
];
