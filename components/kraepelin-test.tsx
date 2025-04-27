import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRightCircle, XCircle, PlayCircle, PauseCircle, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

type KraepelinTestProps = {
  durationInMinutes: number;
  onComplete: (results: KraepelinResults) => void;
};

export type KraepelinResults = {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  speed: number;
  consistency: number;
  endurance: number;
  columns: {
    answers: number;
    correct: number;
    accuracy: number;
  }[];
};

// Represents a single number in the test with its result
type KraepelinProblem = {
  value: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
};

// Represents a column of 60 numbers (authentic Kraepelin format)
type KraepelinColumn = {
  numbers: KraepelinProblem[];
  completed: boolean;
  answers: number;
  correct: number;
  timeSpent: number;
};

// Helper to generate a random number between min and max (inclusive)
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate a column of random single-digit numbers for Kraepelin test
const generateColumn = (length: number = 60): KraepelinProblem[] => {
  return Array.from({ length }, () => ({
    value: getRandomNumber(1, 9),
    userAnswer: null,
    isCorrect: null
  }));
};

export function KraepelinTest({ durationInMinutes, onComplete }: KraepelinTestProps) {
  const totalTimeInSeconds = durationInMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalTimeInSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
  
  // For tracking statistics
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sections, setSections] = useState<{time: number, answers: number, correct: number}[]>([]);
  const sectionInterval = useRef<number>(60); // Update stats every minute
  const lastSectionTime = useRef<number>(0);
  const sectionAnswers = useRef<number>(0);
  const sectionCorrect = useRef<number>(0);
  
  // Test problems
  const [visibleProblems, setVisibleProblems] = useState<KraepelinProblem[]>([]);
  const [position, setPosition] = useState(0);
  const [lastInput, setLastInput] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize or reset the problem set
  const initializeProblems = useCallback(() => {
    const initialProblems: KraepelinProblem[] = Array.from({ length: 12 }, () => ({
      row: generateRow(),
      userAnswer: null,
      isCorrect: null,
    }));
    setVisibleProblems(initialProblems);
    setPosition(0);
    setTotalAnswers(0);
    setCorrectAnswers(0);
    setSections([]);
    lastSectionTime.current = 0;
    sectionAnswers.current = 0;
    sectionCorrect.current = 0;
  }, []);
  
  // Start the test
  const startTest = () => {
    setIsStarted(true);
    setIsInstructionsOpen(false);
    initializeProblems();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle timer logic
  useEffect(() => {
    if (!isStarted || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Check if we need to record section data
        const elapsedTime = totalTimeInSeconds - prev;
        if (elapsedTime - lastSectionTime.current >= sectionInterval.current) {
          setSections(prev => [
            ...prev, 
            { 
              time: elapsedTime, 
              answers: sectionAnswers.current, 
              correct: sectionCorrect.current 
            }
          ]);
          lastSectionTime.current = elapsedTime;
          sectionAnswers.current = 0;
          sectionCorrect.current = 0;
        }
        
        // End test if time is up
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isStarted, isPaused, totalTimeInSeconds]);
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = ((totalTimeInSeconds - timeLeft) / totalTimeInSeconds) * 100;
  
  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only process single-digit numbers
    if (/^[0-9]$/.test(value)) {
      const userAnswer = parseInt(value, 10);
      const currentProblem = visibleProblems[position];
      
      // This is the current number
      const currentNum = currentProblem.row[0];
      
      // For the vertical stacked UI, we need to get the next number to add (if it exists)
      const nextNum = (position < visibleProblems.length - 1) ? visibleProblems[position + 1].row[0] : 0;
      
      // Calculate correct answer (sum of current and next number)
      const correctAnswer = currentNum + nextNum;
      
      // Check if the last digit matches
      const isCorrect = userAnswer === correctAnswer % 10;
      
      // Save the input for display and feedback
      setLastInput(value);
      setLastCorrect(isCorrect);
      
      // Update the current problem
      const updatedProblems = [...visibleProblems];
      updatedProblems[position] = {
        ...currentProblem,
        userAnswer,
        isCorrect,
      };
      
      // Update statistics
      setTotalAnswers(prev => prev + 1);
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        sectionCorrect.current += 1;
      }
      sectionAnswers.current += 1;
      
      // Short delay to show feedback before moving to next problem
      setTimeout(() => {
        // Move to the next problem and clear input
        setVisibleProblems(updatedProblems);
        e.target.value = '';
        setLastInput(null);
        setLastCorrect(null);
        
        // Move to the next position or add a new problem
        if (position < visibleProblems.length - 1) {
          setPosition(position + 1);
        } else {
          // Add a new problem and shift the visible window
          const newProblems = [...updatedProblems];
          newProblems.push({
            row: generateRow(),
            userAnswer: null,
            isCorrect: null,
          });
          
          if (newProblems.length > 12) {
            newProblems.shift(); // Remove the first problem if we have more than 12
          } else {
            setPosition(position + 1);
          }
          
          setVisibleProblems(newProblems);
        }
        
        // Keep focus on the input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 150); // Short delay (150ms) to show feedback but still feel responsive
    }
  };
  
  // Calculate results and finish the test
  const finishTest = () => {
    const finalSectionData = {
      time: totalTimeInSeconds - lastSectionTime.current,
      answers: sectionAnswers.current,
      correct: sectionCorrect.current
    };
    
    // Add the last section data if there's anything to record
    const finalSections = sectionAnswers.current > 0 
      ? [...sections, finalSectionData]
      : sections;
    
    // Calculate metrics (simplified calculations for demo)
    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
    
    // Speed: normalized to a 1-5 scale
    const answersPerMinute = totalAnswers / (durationInMinutes || 1);
    const speed = Math.min(answersPerMinute / 20, 5); // Assuming 100 answers/min is maximum (5 rating)
    
    // Consistency: standard deviation of performance across sections
    let consistency = 5; // Default high consistency
    if (finalSections.length > 1) {
      const accuracies = finalSections.map(s => s.answers > 0 ? s.correct / s.answers : 0);
      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(5 - (stdDev * 10), 1); // Convert to 1-5 scale
    }
    
    // Endurance: compare performance in first half vs second half
    let endurance = 3; // Default average endurance
    if (finalSections.length > 1) {
      const midpoint = Math.floor(finalSections.length / 2);
      const firstHalf = finalSections.slice(0, midpoint);
      const secondHalf = finalSections.slice(midpoint);
      
      const firstHalfAccuracy = firstHalf.reduce((sum, s) => sum + (s.answers > 0 ? s.correct / s.answers : 0), 0) / firstHalf.length;
      const secondHalfAccuracy = secondHalf.reduce((sum, s) => sum + (s.answers > 0 ? s.correct / s.answers : 0), 0) / secondHalf.length;
      
      const enduranceRatio = secondHalfAccuracy / (firstHalfAccuracy || 0.01); // Avoid division by zero
      endurance = Math.min(Math.max(enduranceRatio * 3, 1), 5); // Convert to 1-5 scale
    }
    
    // Complete the test with results
    onComplete({
      totalAnswers,
      correctAnswers,
      accuracy,
      speed,
      consistency,
      endurance,
      sections: finalSections,
    });
  };
  
  // Handle pause/resume
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused && inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle exit confirmation
  const handleExitRequest = () => {
    if (isStarted && !isPaused) {
      setIsPaused(true);
    }
    setIsConfirmExitOpen(true);
  };
  
  const confirmExit = () => {
    finishTest();
    setIsConfirmExitOpen(false);
  };
  
  return (
    <div className="relative">
      {/* Instructions Dialog */}
      <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Instruksi Tes Kraepelin</DialogTitle>
            <DialogDescription>
              Tes ini mengukur kecepatan, ketelitian, konsistensi, dan ketahanan mental Anda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Cara Mengerjakan:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Anda akan melihat satu kolom angka yang harus dijumlahkan satu per satu.</li>
                <li>Lihat angka yang diberi highlight, lalu <strong>jumlahkan dengan angka di bawahnya</strong>.</li>
                <li>Masukkan <strong>digit terakhir</strong> dari hasil penjumlahan.</li>
                <li>Bekerjalah secepat dan seteliti mungkin. Fokus sangat penting!</li>
              </ol>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <h3 className="font-semibold mb-1">Contoh:</h3>
              <div className="flex flex-col items-center space-y-2 mb-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded text-center font-mono w-12">8</div>
                <div className="bg-white dark:bg-gray-700 p-2 rounded text-center font-mono w-12">7</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-mono">8 + 7 = 15</span>, masukkan <span className="font-mono">5</span>
              </p>
            </div>
            
            <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p className="text-sm">
                Tes akan berjalan selama {durationInMinutes} menit. Jangan tinggalkan halaman selama tes berlangsung.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={startTest} className="w-full">
              Mulai Tes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Exit Confirmation Dialog */}
      <Dialog open={isConfirmExitOpen} onOpenChange={setIsConfirmExitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Yakin ingin mengakhiri tes?</DialogTitle>
            <DialogDescription>
              Jika Anda mengakhiri tes sekarang, tes akan dihitung berdasarkan jawaban yang sudah diisi.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setIsConfirmExitOpen(false);
              if (!isPaused) {
                setIsPaused(false);
              }
            }} className="sm:flex-1">
              Lanjutkan Tes
            </Button>
            <Button variant="destructive" onClick={confirmExit} className="sm:flex-1">
              Akhiri Tes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test UI */}
      {isStarted && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft">
          {/* Timer and controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <div className="text-3xl font-mono font-bold">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progressPercentage} className="w-32 h-2 mt-1" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="p-2 h-auto"
                onClick={togglePause}
              >
                {isPaused ? 
                  <PlayCircle className="w-8 h-8 text-green-600 dark:text-green-500" /> : 
                  <PauseCircle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                }
              </Button>
              
              <Button 
                variant="ghost" 
                className="p-2 h-auto"
                onClick={handleExitRequest}
              >
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </Button>
            </div>
          </div>
          

          
          {/* Test problems - Redesigned for vertical stacked numbers with fixed highlighted row */}
          <div className="mb-8 flex">
            <div className="w-1/2 mr-4">
              <h3 className="text-lg font-semibold mb-4">Angka:</h3>
              
              <div className="relative h-[360px]">
                {/* Fixed highlighted number (current) */}
                <div className="sticky top-0 z-10 mb-2">
                  {position < visibleProblems.length && (
                    <div className="flex justify-center p-2 rounded-lg w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div 
                        className="bg-white dark:bg-gray-700 w-16 h-16 rounded flex items-center justify-center text-3xl font-mono shadow-sm"
                      >
                        {visibleProblems[position].row[0]}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Scrollable column of other numbers */}
                <div className="h-[300px] overflow-y-auto pr-2 hide-scrollbar border-t border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center space-y-4 pt-4">
                    {visibleProblems.slice(position + 1).map((problem, index) => (
                      <div 
                        key={`next-${index}`}
                        className="p-2 rounded-lg w-full"
                      >
                        <div className="flex justify-center">
                          <div 
                            className="bg-white dark:bg-gray-700 w-16 h-16 rounded flex items-center justify-center text-3xl font-mono shadow-sm"
                          >
                            {problem.row[0]}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add some padding elements at the end for better UX */}
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={`padding-${index}`} className="p-2 w-full opacity-0">
                        <div className="flex justify-center">
                          <div className="w-16 h-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Previously answered numbers (if needed) */}
                <div className="mt-2">
                  {position > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Terakhir dijawab:</div>
                      <div className={`text-sm ${
                        visibleProblems[position-1].isCorrect
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {visibleProblems[position-1].isCorrect ? '✓ Benar' : '✗ Salah'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fixed input box */}
            <div className="w-1/2 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Jawaban:</h3>
              
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Masukkan digit terakhir<br />dari hasil penjumlahan
                  </p>
                  
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus
                      disabled={isPaused}
                      value={lastInput || ''}
                      className={`w-20 h-20 rounded bg-white dark:bg-gray-700 border-2 text-center text-4xl font-mono shadow-sm focus:outline-none focus:ring-2 
                        ${lastCorrect === true 
                          ? 'border-green-500 dark:border-green-400 focus:ring-green-500' 
                          : lastCorrect === false
                            ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
                            : 'border-blue-300 dark:border-blue-600 focus:ring-blue-500'
                        }`}
                      onChange={handleInputChange}
                    />
                    
                    {/* Show the user's input clearly */}
                    {lastInput && (
                      <div className={`absolute inset-0 flex items-center justify-center text-4xl font-mono pointer-events-none
                        ${lastCorrect === true 
                          ? 'text-green-600 dark:text-green-400' 
                          : lastCorrect === false
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                        {lastInput}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {isPaused && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <PauseCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <h3 className="text-2xl font-bold mb-2">Tes Dijeda</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Klik tombol lanjutkan untuk melanjutkan tes
                </p>
                <Button onClick={togglePause}>
                  Lanjutkan Tes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}