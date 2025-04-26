import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { saveQuizResult } from '../utils/firestore';
import { updateLeaderboard } from '../utils/updateLeaderboard';

const Quiz = ({ 
  questions, 
  quizType, 
  showExplanations = false, 
  showImmediateFeedback = false,
  timeLeft,
  setTimerActive
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  
  const router = useRouter();
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : null;

  // Effect for timer reaching zero
  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      // Auto-submit the quiz when time runs out
      handleShowResult();
    }
  }, [timeLeft]);

  const handleOptionSelect = (optionIndex) => {
    if (feedbackVisible && showImmediateFeedback) return; // Prevent changing answer after feedback is shown
    
    setSelectedOption(optionIndex);
    
    // If immediate feedback is enabled, show it right away
    if (showImmediateFeedback) {
      // Update user answers
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = optionIndex;
      setUserAnswers(newUserAnswers);
      
      // Show feedback
      setFeedbackVisible(true);
      
      // Update score if correct
      if (optionIndex === questions[currentQuestion].correctAnswer) {
        setScore(prevScore => prevScore + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null && !showImmediateFeedback) {
      alert('Silakan pilih jawaban terlebih dahulu');
      return;
    }

    // If we're not using immediate feedback, score the answer now
    if (!showImmediateFeedback) {
      // Update user answers
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = selectedOption;
      setUserAnswers(newUserAnswers);
      
      // Update score if correct
      if (selectedOption === questions[currentQuestion].correctAnswer) {
        setScore(prevScore => prevScore + 1);
      }
    }

    // Reset selected option and feedback
    setSelectedOption(null);
    setFeedbackVisible(false);

    // Move to the next question or show result
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleShowResult();
    }
  };

  const handleShowResult = () => {
    // Stop the timer if it exists
    if (setTimerActive) {
      setTimerActive(false);
    }
    
    // Find incorrect questions for review
    const incorrect = [];
    userAnswers.forEach((answer, index) => {
      if (answer !== questions[index].correctAnswer) {
        incorrect.push(index);
      }
    });
    setIncorrectQuestions(incorrect);
    
    setShowResult(true);
  };

  const handleFinishQuiz = async () => {
    setLoading(true);

    try {
      if (userId) {
        // Only save results if it's not a short quiz (kuis pendek)
        const isShortQuiz = quizType.toLowerCase().includes('pendek');
        
        if (!isShortQuiz) {
          // Save results only for full tryout quizzes
          await saveQuizResult(userId, quizType, score);
          await updateLeaderboard(userId, score);
          console.log('Quiz result saved!');
        } else {
          console.log('Short quiz results not saved (practice only)');
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('User not logged in');
        alert('User not logged in. Please log in to save your result.');
        return;
      }
    } catch (error) {
      console.error('Error processing quiz result:', error);
      // Still redirect to dashboard even if there's an error
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewIncorrect = () => {
    if (incorrectQuestions.length > 0) {
      setReviewMode(true);
      setCurrentQuestion(incorrectQuestions[0]);
    } else {
      alert('Semua jawaban Anda benar!');
    }
  };

  const handleBackToResults = () => {
    setReviewMode(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  // Review mode for incorrect answers
  if (reviewMode) {
    const question = questions[currentQuestion];
    const userAnswer = userAnswers[currentQuestion];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Review Pertanyaan {currentQuestion + 1}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Pertanyaan {incorrectQuestions.indexOf(currentQuestion) + 1} dari {incorrectQuestions.length}</span>
        </div>
        
        <div className="mb-6">
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">{question.question}</p>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${index === question.correctAnswer 
                  ? 'bg-green-100 dark:bg-green-900 border-green-500' 
                  : index === userAnswer 
                    ? 'bg-red-100 dark:bg-red-900 border-red-500' 
                    : 'border-gray-300 dark:border-gray-700'}`}
              >
                <p className="text-gray-800 dark:text-gray-200">{option}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 font-medium">Penjelasan:</p>
            <p className="text-gray-800 dark:text-gray-200">{question.explanation}</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={handleBackToResults}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Kembali ke Hasil
          </button>
          
          {incorrectQuestions.indexOf(currentQuestion) < incorrectQuestions.length - 1 && (
            <button 
              onClick={() => setCurrentQuestion(incorrectQuestions[incorrectQuestions.indexOf(currentQuestion) + 1])}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Pertanyaan Berikutnya
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    let resultMessage;
    
    if (percentage >= 80) {
      resultMessage = "Luar biasa! Anda menguasai materi dengan sangat baik.";
    } else if (percentage >= 60) {
      resultMessage = "Bagus! Anda memiliki pemahaman yang cukup baik.";
    } else {
      resultMessage = "Teruslah berlatih. Anda akan semakin baik dengan latihan yang konsisten.";
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Hasil Kuis</h2>
        
        <div className="mb-8">
          <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
            <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{score}</span>
            <span className="text-xl text-gray-600 dark:text-gray-400">/{questions.length}</span>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300">{percentage}%</p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{resultMessage}</p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          {incorrectQuestions.length > 0 && (
            <button 
              onClick={handleReviewIncorrect}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Review Jawaban Salah ({incorrectQuestions.length})
            </button>
          )}
          
          <button 
            onClick={handleFinishQuiz}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  // Quiz question screen
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pertanyaan {currentQuestion + 1} dari {questions.length}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Skor: {score}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}></div>
        </div>
      </div>
      
      <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{questions[currentQuestion].question}</p>
      
      <div className="space-y-3 mb-6">
        {questions[currentQuestion].options.map((option, index) => {
          let optionClass = "p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
          
          // If feedback is visible, highlight correct and incorrect answers
          if (feedbackVisible) {
            if (index === questions[currentQuestion].correctAnswer) {
              optionClass = "p-3 border border-green-500 bg-green-100 dark:bg-green-900 rounded-lg";
            } else if (index === selectedOption) {
              optionClass = "p-3 border border-red-500 bg-red-100 dark:bg-red-900 rounded-lg";
            }
          } else if (index === selectedOption) {
            optionClass = "p-3 border border-indigo-500 bg-indigo-100 dark:bg-indigo-900 rounded-lg";
          }
          
          return (
            <div 
              key={index}
              className={optionClass}
              onClick={() => handleOptionSelect(index)}
            >
              <p className="text-gray-800 dark:text-gray-200">{option}</p>
            </div>
          );
        })}
      </div>
      
      {/* Explanation section (only visible with immediate feedback) */}
      {feedbackVisible && showExplanations && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 font-medium">Penjelasan:</p>
          <p className="text-gray-800 dark:text-gray-200">{questions[currentQuestion].explanation}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          onClick={handleNextQuestion}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={!showImmediateFeedback && selectedOption === null}
        >
          {currentQuestion < questions.length - 1 ? 'Pertanyaan Berikutnya' : 'Selesai'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;