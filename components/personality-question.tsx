import { PersonalityQuestion } from "@/lib/personality-test-data";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PersonalityQuestionCardProps = {
  question: PersonalityQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: string;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
};

export function PersonalityQuestionCard({
  question,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  selectedAnswer,
  onSelectAnswer,
  onPrevQuestion,
  onNextQuestion,
}: PersonalityQuestionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 mb-4">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
        </span>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          Sisa waktu: {timeRemaining}
        </span>
      </div>
      
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8">
        <div 
          className="absolute top-0 left-0 bg-primary-600 h-2 rounded-full"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>
      
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        {question.text}
      </h3>
      
      <RadioGroup 
        value={selectedAnswer || ""} 
        onValueChange={onSelectAnswer}
        className="space-y-4 mb-8"
      >
        {question.options.map((option) => (
          <div 
            key={option.id} 
            className={`flex items-center p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === option.id 
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <RadioGroupItem
              id={option.id}
              value={option.id}
              className="mr-4"
            />
            <Label 
              htmlFor={option.id} 
              className="flex-1 cursor-pointer text-base text-gray-700 dark:text-gray-300"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Sebelumnya
        </Button>
        
        <Button
          onClick={onNextQuestion}
          disabled={!selectedAnswer}
          className="flex items-center gap-2"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya'}
          {currentQuestionIndex < totalQuestions - 1 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}