import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { saveQuizResult } from '../utils/firestore';
import { updateLeaderboard } from '../utils/updateLeaderboard';

const Quiz = ({ questions, quizType }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : null;

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      alert('Please select an option');
      return;
    }

    // Score the answer
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    // Reset selected option
    setSelectedOption(null);

    // Move to the next question or show result
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleFinishQuiz = async () => {
      setLoading(true);

      const finalScore = questions.reduce((acc, question, index) => {
          return selectedOption === question.correctAnswer ? acc + 1 : acc;
      }, 0);

    //Save the quiz result
    try {
        // Replace 'testUser' with actual user ID from AuthContext
        if (userId) {
            await saveQuizResult(userId, quizType, finalScore);
            await updateLeaderboard(userId, finalScore);
        } else {
            console.error('User not logged in');
            alert('User not logged in. Please log in to save your result.');
            return;
        }

        console.log('Quiz result saved to Firestore!');
        // Redirect to dashboard or results page
        router.push('/dashboard');
    } catch (error) {
        console.error('Error saving quiz result to Firestore:', error);
        //Display error message to user
        alert('Failed to save quiz result. Please try again later.');
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return <div>Loading...</div>;
  }

  if (showResult) {
    return (
      <div>
        <h2>Quiz Result</h2>
        <p>Your Score: {score} / {questions.length}</p>
        <button onClick={handleFinishQuiz}>Finish</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Question {currentQuestion + 1}</h2>
      <p>{questions[currentQuestion].question}</p>
      <ul>
        {questions[currentQuestion].options.map((option, index) => (
          <li key={index}>
            <button
              className={selectedOption === index ? 'selected' : ''}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleNextQuestion}>Next Question</button>
    </div>
  );
};

export default Quiz;