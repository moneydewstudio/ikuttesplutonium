import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { initTest, saveAnswer, updateBatch, updateTimeRemaining, completeTest } from '../../utils/eppsStorage';
import ProgressBar from '../../components/ui/ProgressBar';
import questionsData from '../../data/epps/questions.json';

// Use dynamic imports with ssr: false to ensure client-side only rendering
const EPPSInstructions = dynamic(() => import('../../components/epps/EPPSInstructions'), { ssr: false });
const EPPSQuestions = dynamic(() => import('../../components/epps/EPPSQuestions'), { ssr: false });
const EPPSResults = dynamic(() => import('../../components/epps/EPPSResults'), { ssr: false });

export default function EPPSTest() {
  const router = useRouter();
  const [stage, setStage] = useState('instructions'); // instructions, questions, results
  const [testState, setTestState] = useState(null);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const timerRef = useRef(null);
  
  const TOTAL_QUESTIONS = 225;
  const QUESTIONS_PER_BATCH = 45;
  const TOTAL_BATCHES = 5;
  
  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    // Initialize test state on component mount
    const state = initTest(questionsData.questions);
    setTestState(state);
    setCurrentBatch(state.currentBatch || 1);
    setTimeRemaining(state.timeRemaining || 45 * 60);
  }, []);
  
  useEffect(() => {
    // Timer logic
    if (stage === 'questions' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (testState) {
            updateTimeRemaining(testState, newTime);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stage, testState]);
  
  useEffect(() => {
    // Auto-submit when time runs out
    if (timeRemaining <= 0 && stage === 'questions') {
      handleCompleteTest();
    }
  }, [timeRemaining, stage]);
  
  const handleStartTest = () => {
    setStage('questions');
  };
  
  const handleAnswer = (questionId, selectedLabel) => {
    if (!testState) return;
    
    const updatedState = saveAnswer(testState, questionId, selectedLabel);
    setTestState(updatedState);
    
    // Auto-advance to next question
    if (currentQuestion < getCurrentBatchEndQuestion()) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const getCurrentBatchStartQuestion = () => {
    return (currentBatch - 1) * QUESTIONS_PER_BATCH + 1;
  };
  
  const getCurrentBatchEndQuestion = () => {
    return Math.min(currentBatch * QUESTIONS_PER_BATCH, TOTAL_QUESTIONS);
  };
  
  const getCurrentBatchQuestions = () => {
    if (!testState) return [];
    
    const startIdx = getCurrentBatchStartQuestion();
    const endIdx = getCurrentBatchEndQuestion();
    
    return testState.questions
      .filter(q => q.id >= startIdx && q.id <= endIdx);
  };
  
  const handleNextBatch = () => {
    // Check if all questions in current batch are answered
    const startIdx = getCurrentBatchStartQuestion();
    const endIdx = getCurrentBatchEndQuestion();
    
    const allAnswered = Array.from(
      { length: endIdx - startIdx + 1 },
      (_, i) => i + startIdx
    ).every(id => testState.answers[id]);
    
    if (!allAnswered) {
      alert('Harap jawab semua pertanyaan sebelum melanjutkan.');
      return;
    }
    
    if (currentBatch < TOTAL_BATCHES) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      setCurrentQuestion(getCurrentBatchStartQuestion() + nextBatch - 1);
      
      if (testState) {
        const updatedState = updateBatch(testState, nextBatch);
        setTestState(updatedState);
      }
      
      window.scrollTo(0, 0);
    } else {
      // All batches completed
      handleCompleteTest();
    }
  };
  
  const handleCompleteTest = () => {
    setLoading(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
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
  };
  
  const calculateProgress = () => {
    const startIdx = getCurrentBatchStartQuestion();
    const answeredCount = Object.keys(testState?.answers || {})
      .filter(id => parseInt(id) >= startIdx && parseInt(id) <= getCurrentBatchEndQuestion())
      .length;
    
    return (answeredCount / QUESTIONS_PER_BATCH) * 100;
  };
  
  const calculateOverallProgress = () => {
    return ((currentBatch - 1) * QUESTIONS_PER_BATCH + (currentQuestion - getCurrentBatchStartQuestion() + 1)) / TOTAL_QUESTIONS * 100;
  };
  
  if (!testState) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>;
  }
  
  return (
    <>
      <Head>
        <title>EPPS Test | Ikuttes</title>
        <meta name="description" content="Edwards Personal Preference Schedule (EPPS) Test" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {stage === 'instructions' && (
          <EPPSInstructions onStart={handleStartTest} />
        )}
        
        {stage === 'questions' && (
          <>
            <div className="mb-6 bg-white rounded-lg shadow-md p-4 border-2 border-black">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium">Batch {currentBatch} dari {TOTAL_BATCHES}</span>
                  <span className="mx-2">•</span>
                  <span>Pertanyaan {currentQuestion} dari {TOTAL_QUESTIONS}</span>
                </div>
                <div className="text-red-600 font-medium">
                  Waktu: {formatTime(timeRemaining)}
                </div>
              </div>
              
              <ProgressBar 
                progress={calculateOverallProgress()} 
                label={`${Math.round(calculateOverallProgress())}%`} 
              />
            </div>
            
            <EPPSQuestions 
              questions={getCurrentBatchQuestions()}
              answers={testState.answers}
              onAnswer={handleAnswer}
              currentQuestion={currentQuestion}
            />
            
            <div className="flex justify-between mt-8">
              <div></div> {/* Empty div for spacing since we don't have a back button */}
              
              <button
                onClick={handleNextBatch}
                disabled={loading}
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-md flex items-center transform hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Memproses...
                  </>
                ) : currentBatch < TOTAL_BATCHES ? (
                  'Batch Selanjutnya'
                ) : (
                  'Selesai'
                )}
              </button>
            </div>
          </>
        )}
        
        {stage === 'results' && (
          <EPPSResults results={testState.results} />
        )}
      </div>
    </>
  );
}
