type TestStatsProps = {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
};

export function TestStats({ totalAnswers, correctAnswers, accuracy }: TestStatsProps) {
  return (
    <div className="flex justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">Dijawab</div>
        <div className="text-xl font-bold">{totalAnswers}</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">Benar</div>
        <div className="text-xl font-bold text-green-600 dark:text-green-400">
          {correctAnswers}
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">Akurasi</div>
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {accuracy.toFixed(1)}%
        </div>
      </div>
    </div>
  );
} 