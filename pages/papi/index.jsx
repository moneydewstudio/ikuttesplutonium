import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { initTest, saveAnswer, completeTest } from '../../utils/papiStorage';
import ProgressBar from '../../components/ui/ProgressBar';

// Use dynamic imports with ssr: false to ensure client-side only rendering
const PapiInstructions = dynamic(() => import('../../components/papi/PapiInstructions'), { ssr: false });
const PapiQuestions = dynamic(() => import('../../components/papi/PapiQuestions'), { ssr: false });
const PapiResults = dynamic(() => import('../../components/papi/PapiResults'), { ssr: false });

export default function PapiTest() {
  const router = useRouter();
  const [stage, setStage] = useState('instructions'); // instructions, questions, results
  const [testState, setTestState] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const QUESTIONS_PER_SLIDE = 4;
  const TOTAL_QUESTIONS = 90;
  const TOTAL_SLIDES = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_SLIDE);
  
  useEffect(() => {
    // Initialize test state on component mount
    const state = initTest();
    setTestState(state);
  }, []);
  
  const handleStartTest = () => {
    setStage('questions');
  };
  
  const handleAnswer = (questionId, selectedLabel) => {
    if (!testState) return;
    
    const updatedState = saveAnswer(testState, questionId, selectedLabel);
    setTestState(updatedState);
  };
  
  const handleNextSlide = () => {
    // Check if all questions in current slide are answered
    const startIdx = currentSlide * QUESTIONS_PER_SLIDE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_SLIDE, TOTAL_QUESTIONS);
    
    const allAnswered = Array.from(
      { length: endIdx - startIdx },
      (_, i) => i + startIdx + 1
    ).every(id => testState.answers[id]);
    
    if (!allAnswered) {
      alert('Harap jawab semua pertanyaan sebelum melanjutkan.');
      return;
    }
    
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(currentSlide + 1);
      window.scrollTo(0, 0);
    } else {
      // All questions completed
      setLoading(true);
      completeTest(testState)
        .then(() => {
          setStage('results');
          setLoading(false);
        })
        .catch(error => {
          console.error('Error completing test:', error);
          setLoading(false);
          alert('Terjadi kesalahan saat menyimpan hasil tes. Silakan coba lagi.');
        });
    }
  };
  
  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const getCurrentQuestions = () => {
    if (!testState) return [];
    
    const startIdx = currentSlide * QUESTIONS_PER_SLIDE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_SLIDE, TOTAL_QUESTIONS);
    
    return testState.questions
      .filter(q => q.id > startIdx && q.id <= endIdx);
  };
  
  const calculateProgress = () => {
    return ((currentSlide + 1) / TOTAL_SLIDES) * 100;
  };
  
  if (!testState) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  return (
    <>
      <Head>
        <title>PAPI Kostick Test | Ikuttes</title>
        <meta name="description" content="Personality Assessment Preference Inventory (PAPI) Kostick Test" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {stage === 'instructions' && (
          <PapiInstructions onStart={handleStartTest} />
        )}
        
        {stage === 'questions' && (
          <>
            <div className="mb-6">
              <ProgressBar 
                progress={calculateProgress()} 
                label={`${currentSlide + 1} dari ${TOTAL_SLIDES}`} 
              />
            </div>
            
            <PapiQuestions 
              questions={getCurrentQuestions()}
              answers={testState.answers}
              onAnswer={handleAnswer}
            />
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className={`px-6 py-2 rounded-md ${
                  currentSlide === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Sebelumnya
              </button>
              
              <button
                onClick={handleNextSlide}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Memproses...
                  </>
                ) : currentSlide < TOTAL_SLIDES - 1 ? (
                  'Selanjutnya'
                ) : (
                  'Selesai'
                )}
              </button>
            </div>
          </>
        )}
        
        {stage === 'results' && (
          <PapiResults results={testState.results} />
        )}
      </div>
    </>
  );
}
