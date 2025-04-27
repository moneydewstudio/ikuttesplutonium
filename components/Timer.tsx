import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TimerState } from '@/types/kraepelin';

// Format time as MM:SS
const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

type TimerProps = {
  timeLeft: number;
  columnNumber: number;
  progress: number;
};

export function Timer({ timeLeft, columnNumber, progress }: TimerProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="text-4xl font-mono font-bold">
        {formatTime(timeLeft)}
      </div>
      <Badge variant="outline" className="font-mono text-lg">
        Kolom {columnNumber}/50
      </Badge>
      <Progress value={progress} className="w-40 h-2" />
    </div>
  );
} 