import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import KraepelinResults from './KraepelinResults';
import { saveQuizResult } from '../utils/firestore';
import { updateLeaderboard } from '../utils/updateLeaderboard';
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "../utils/ui";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

const KraepelinTest = ({ mode, rowDuration }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : null;
  const inputRef = useRef(null);
  
  // Test state
  const [currentRow, setCurrentRow] = useState(0);
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
  const [digits, setDigits] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [rowResults, setRowResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(rowDuration);
  const [testActive, setTestActive] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, correct: false });
  
  // Generate all digits for the test on mount
  useEffect(() => {
    const generateDigits = () => {
      const allDigits = [];
      for (let i = 0; i < 30; i++) {
        const rowDigits = [];
        for (let j = 0; j < 116; j++) {
          rowDigits.push(Math.floor(Math.random() * 10));
        }
        allDigits.push(rowDigits);
      }
      return allDigits;
    };
    
    setDigits(generateDigits());
    
    // Focus input on start
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up for this row
      handleRowComplete();
    }
    
    return () => clearInterval(timer);
  }, [testActive, timeLeft]);
  
  // Auto-focus input when available
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentDigitIndex, currentRow]);
  
  const handleRowComplete = () => {
    // Calculate results for this row
    const correctCount = userAnswers.filter(a => a.correct).length;
    
    // Add to row results
    setRowResults(prev => [
      ...prev, 
      {
        rowIndex: currentRow,
        opsDone: userAnswers.length,
        correctCount,
        errorCount: userAnswers.length - correctCount
      }
    ]);
    
    // Reset for next row
    setUserAnswers([]);
    setTimeLeft(rowDuration);
    
    // Move to next row or end test
    if (currentRow < 29) {
      setCurrentRow(prev => prev + 1);
      setCurrentDigitIndex(0);
    } else {
      // Test complete
      setTestActive(false);
      setTestCompleted(true);
    }
  };
  
  const handleInputChange = (e) => {
    if (!testActive) return;
    
    const value = e.target.value;
    if (value.length === 0) return;
    
    // Get only the last character if multiple were somehow entered
    const answer = parseInt(value.slice(-1), 10);
    
    // Get current 4 digits
    const rowDigits = digits[currentRow];
    const currentWindowDigits = rowDigits.slice(currentDigitIndex, currentDigitIndex + 4);
    
    // Calculate expected answer for the first pair in the window
    const expected = (currentWindowDigits[0] + currentWindowDigits[1]) % 10;
    const isCorrect = answer === expected;
    
    // Record answer
    setUserAnswers(prev => [
      ...prev,
      {
        digitIndex: currentDigitIndex,
        userAnswer: answer,
        expected,
        correct: isCorrect
      }
    ]);
    
    // Show feedback briefly
    setFeedback({ visible: true, correct: isCorrect });
    setTimeout(() => {
      setFeedback({ visible: false, correct: false });
      // Clear input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }, 100);
    
    // Move to next pair
    if (currentDigitIndex < rowDigits.length - 2) {
      setCurrentDigitIndex(prev => prev + 1);
    } else {
      // End of row reached before time is up
      // Just wait for the timer to finish
    }
  };
  
  // Helper function to calculate the three aspects of Kraepelin scoring
  const calculateKraepelinMetrics = (rows) => {
    if (!rows || rows.length === 0) return {};
    
    // 1. Ketelitian Kerja (Work Accuracy)
    // Calculate error ratio compared to questions done
    const totalOpsDone = rows.reduce((sum, row) => sum + row.opsDone, 0);
    const totalCorrect = rows.reduce((sum, row) => sum + row.correctCount, 0);
    const totalErrors = rows.reduce((sum, row) => sum + row.errorCount, 0);
    const accuracy = totalOpsDone > 0 ? totalCorrect / totalOpsDone : 0;
    const errorRatio = totalOpsDone > 0 ? totalErrors / totalOpsDone : 0;
    
    // Work Accuracy Score (1-10 scale, 10 being best)
    const workAccuracyScore = Math.round((1 - errorRatio) * 10);
    
    // 2. Ketahanan Kerja (Work Resilience)
    // Compare performance of first three rows vs. last three rows
    // Take at least 6 rows for a meaningful comparison
    let workResilienceScore = 5; // Default to middle score
    if (rows.length >= 6) {
      const firstThreeRows = rows.slice(0, 3);
      const lastThreeRows = rows.slice(-3);
      
      const firstThreeAvgOps = firstThreeRows.reduce((sum, row) => sum + row.opsDone, 0) / 3;
      const lastThreeAvgOps = lastThreeRows.reduce((sum, row) => sum + row.opsDone, 0) / 3;
      
      // Calculate resilience ratio: last three rows / first three rows
      const resilienceRatio = firstThreeAvgOps > 0 ? lastThreeAvgOps / firstThreeAvgOps : 1;
      
      // Scale to 1-10: 
      // - If lastThree > firstThree (improved speed), score higher
      // - If lastThree = firstThree (consistent performance), score in the middle
      // - If lastThree < firstThree (fatigue/slowdown), score lower
      if (resilienceRatio >= 1.2) {
        // Significant improvement (gets better with practice)
        workResilienceScore = 10;
      } else if (resilienceRatio >= 1.05) {
        // Moderate improvement
        workResilienceScore = 8;
      } else if (resilienceRatio >= 0.95) {
        // Consistent performance (within 5% variance)
        workResilienceScore = 7;
      } else if (resilienceRatio >= 0.8) {
        // Moderate decline
        workResilienceScore = 5;
      } else {
        // Significant decline
        workResilienceScore = 3;
      }
    }
    
    // 3. Kecakapan Kerja (Work Capability)
    // Measure the average operations done per row
    const avgOpsPerRow = totalOpsDone / rows.length;
    
    // Scale to 1-10 score based on typical performance ranges
    // These thresholds can be adjusted based on empirical data
    let workCapabilityScore;
    if (avgOpsPerRow >= 50) {
      workCapabilityScore = 10; // Exceptional
    } else if (avgOpsPerRow >= 40) {
      workCapabilityScore = 9;
    } else if (avgOpsPerRow >= 30) {
      workCapabilityScore = 8;
    } else if (avgOpsPerRow >= 25) {
      workCapabilityScore = 7;
    } else if (avgOpsPerRow >= 20) {
      workCapabilityScore = 6;
    } else if (avgOpsPerRow >= 15) {
      workCapabilityScore = 5;
    } else if (avgOpsPerRow >= 10) {
      workCapabilityScore = 4;
    } else if (avgOpsPerRow >= 5) {
      workCapabilityScore = 3;
    } else {
      workCapabilityScore = 2;
    }
    
    // Calculate composite score (weighted average of the three aspects)
    // Weights can be adjusted based on the relative importance of each aspect
    const compositeScore = Math.round(
      (workAccuracyScore * 0.35) + // 35% weight for accuracy
      (workResilienceScore * 0.25) + // 25% weight for resilience
      (workCapabilityScore * 0.4) // 40% weight for capability/speed
    );
    
    // Return all metrics for storage and display
    return {
      totalOpsDone,
      totalCorrect,
      totalErrors,
      accuracy,
      errorRatio,
      workAccuracy: {
        score: workAccuracyScore,
        errorRatio
      },
      workResilience: {
        score: workResilienceScore,
        firstThreeAvg: rows.length >= 3 ? 
          rows.slice(0, 3).reduce((sum, row) => sum + row.opsDone, 0) / 3 : 0,
        lastThreeAvg: rows.length >= 3 ? 
          rows.slice(Math.max(0, rows.length - 3)).reduce((sum, row) => sum + row.opsDone, 0) / Math.min(3, rows.length) : 0
      },
      workCapability: {
        score: workCapabilityScore,
        avgOpsPerRow
      },
      compositeScore
    };
  };
  
  const saveResults = async () => {
    try {
      if (userId) {
        // Calculate enhanced Kraepelin metrics
        const metrics = calculateKraepelinMetrics(rowResults);
        
        // Prepare result object with original data plus new metrics
        const resultData = {
          mode,
          rowDuration,
          totalOpsDone: metrics.totalOpsDone,
          totalCorrect: metrics.totalCorrect,
          accuracy: metrics.accuracy,
          rowResults,
          // Add enhanced metrics
          workAccuracy: metrics.workAccuracy,
          workResilience: metrics.workResilience,
          workCapability: metrics.workCapability,
          compositeScore: metrics.compositeScore
        };
        
        // Save to Firestore with localStorage fallback (always save to history)
        await saveQuizResult(userId, 'kraepelin', resultData);
        
        // Only update leaderboard for the 30-second (real) test mode
        // 15-second mode is considered practice and shouldn't be on the leaderboard
        if (rowDuration === 30) {
          // Update leaderboard with enhanced data
          await updateLeaderboard(userId, 'kraepelin', {
            accuracy: metrics.accuracy,
            totalCorrect: metrics.totalCorrect,
            totalOpsDone: metrics.totalOpsDone,
            workAccuracyScore: metrics.workAccuracy.score,
            workResilienceScore: metrics.workResilience.score,
            workCapabilityScore: metrics.workCapability.score,
            compositeScore: metrics.compositeScore
          });
          
          // Try to sync any pending leaderboard entries
          try {
            const { syncLeaderboard } = await import('../utils/updateLeaderboard');
            await syncLeaderboard(userId);
          } catch (syncError) {
            console.log('Background sync attempt failed, will try later:', syncError);
          }
          
          console.log('Enhanced Kraepelin results saved and leaderboard updated!');
        } else {
          console.log('Practice mode (15s) results saved to history but not to leaderboard.');
        }
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };
  
  // Function to finish test early without saving results
  const handleFinishEarly = () => {
    setTestActive(false);
    setTestCompleted(true);
    // We set a flag to indicate results shouldn't be saved
    sessionStorage.setItem('kraepelin_skip_save', 'true');
  };
  
  // Get current window of 4 digits to display in a column
  const getCurrentDigitWindow = () => {
    if (!digits[currentRow]) return ['', '', '', ''];
    return digits[currentRow].slice(currentDigitIndex, currentDigitIndex + 4);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Save results when test is completed (unless skipped)
  useEffect(() => {
    if (testCompleted) {
      const skipSave = sessionStorage.getItem('kraepelin_skip_save') === 'true';
      
      if (!skipSave) {
        // Only save results if all 30 rows were completed
        if (rowResults.length === 30) {
          saveResults();
        } else {
          console.log(`Test not fully completed (${rowResults.length}/30 rows). Results will not be saved to profile or leaderboard.`);
          // Set a flag to inform the results component this was partial completion
          sessionStorage.setItem('kraepelin_partial_completion', 'true');
        }
      } else {
        // Clear the flag after checking
        sessionStorage.removeItem('kraepelin_skip_save');
      }
    }
  }, [testCompleted, rowResults.length]);
  
  // Try to sync pending leaderboard entries when component mounts
  useEffect(() => {
    const attemptSync = async () => {
      try {
        if (userId) {
          const { syncLeaderboard } = await import('../utils/updateLeaderboard');
          await syncLeaderboard(userId);
        }
      } catch (error) {
        console.log('Background sync at component mount failed:', error);
      }
    };
    
    attemptSync();
  }, [userId]);
  
  // If test is completed, show results
  if (testCompleted) {
    return <KraepelinResults results={rowResults} />;
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Baris {currentRow + 1} dari 30
          </h2>
          <span className="text-lg font-medium text-red-600 dark:text-red-400">
            Waktu: {formatTime(timeLeft)}
          </span>
        </div>
        <Progress value={(currentRow / 30) * 100} className="h-2" />
      </div>
      
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex space-x-8 mb-4">
          {/* Digit display - now in a vertical column with plus signs */}
          <div className="flex flex-col">
            {getCurrentDigitWindow().map((digit, idx) => (
              <React.Fragment key={idx}>
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                >
                  {digit}
                </div>
                {idx === 0 && (
                  <div className="flex items-center justify-center h-6 text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Input box - positioned to the right of the column */}
          <div className="relative self-start">
            <Input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              className={cn(
                "w-12 h-12 text-2xl font-bold text-center appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0",
                feedback.visible && (
                  feedback.correct 
                    ? "border-green-500 bg-green-50 dark:bg-green-900" 
                    : "border-red-500 bg-red-50 dark:bg-red-900"
                )
              )}
              onChange={handleInputChange}
              disabled={!testActive}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">Masukkan<br/>jawaban</p>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Jumlahkan pasangan angka berurutan dari atas ke bawah dan masukkan digit terakhir.
        <br />
        Contoh: Jika angka pertama 5 dan kedua 7, maka 5 + 7 = 12, masukkan 2
      </p>
      
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Jawaban yang sudah dimasukkan: {userAnswers.length}
        </p>
        
        {rowResults.length === 0 && (
          <Alert variant="warning" className="mb-4 text-left bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-500 font-medium">Selesaikan minimal 1 baris</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Anda harus menyelesaikan minimal 1 baris untuk melihat hasil. Selesaikan semua 30 baris untuk mendapatkan skor resmi.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleFinishEarly}
          variant="outline"
          className="text-sm"
          disabled={rowResults.length === 0}
        >
          Lihat Hasil Sekarang
        </Button>
      </div>
    </div>
  );
};

export default KraepelinTest;
