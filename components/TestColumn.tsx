import { KraepelinColumn } from '@/types/kraepelin';

type TestColumnProps = {
  column: KraepelinColumn;
  currentPosition: number;
};

export function TestColumn({ column, currentPosition }: TestColumnProps) {
  return (
    <div className="relative h-[360px] border border-gray-200 dark:border-gray-700 rounded-lg p-2">
      {/* Fixed highlighted number (current) */}
      <div className="sticky top-0 z-10 mb-2 bg-white dark:bg-gray-800 pt-2 pb-1">
        {currentPosition < 60 && (
          <div className="flex justify-center p-2 rounded-lg w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div 
              className="bg-white dark:bg-gray-700 w-16 h-16 rounded flex items-center justify-center text-3xl font-mono shadow-sm"
            >
              {column.numbers[currentPosition].value}
            </div>
          </div>
        )}
      </div>
      
      {/* Scrollable column of other numbers */}
      <div className="h-[290px] overflow-y-auto pr-2 hide-scrollbar">
        <div className="flex flex-col items-center space-y-4 pt-2">
          {column.numbers
            .slice(currentPosition + 1, currentPosition + 4)
            .map((problem, index) => (
              <div 
                key={`next-${index}`}
                className="bg-white dark:bg-gray-700 w-16 h-16 rounded flex items-center justify-center text-2xl font-mono"
              >
                {problem.value}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
} 