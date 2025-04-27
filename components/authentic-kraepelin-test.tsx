import { XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { KraepelinResults } from '@/types/kraepelin';
import { useKraepelinTest } from '@/hooks/useKraepelinTest';
import { Timer } from './Timer';
import { TestColumn } from './TestColumn';
import { TestInput } from './TestInput';
import { TestStats } from './TestStats';

type AuthenticKraepelinTestProps = {
  durationInMinutes: number;
  onComplete: (results: KraepelinResults) => void;
};

export function AuthenticKraepelinTest({ durationInMinutes, onComplete }: AuthenticKraepelinTestProps) {
  const {
    isStarted,
    isInstructionsOpen,
    isConfirmExitOpen,
    columnTimeLeft,
    columnProgressPercentage,
    currentColumnIndex,
    currentPosition,
    columns,
      totalAnswers,
      correctAnswers,
    lastInput,
    lastCorrect,
    inputRef,
    startTest,
    handleInput,
    handleExitRequest,
    confirmExit,
    setIsInstructionsOpen,
    setIsConfirmExitOpen
  } = useKraepelinTest(durationInMinutes, onComplete);

  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  
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
                <li>Anda akan melihat kolom angka yang harus dijumlahkan dua-dua.</li>
                <li>Lihat angka yang diberi highlight, lalu <strong>jumlahkan dengan angka di bawahnya</strong>.</li>
                <li>Masukkan <strong>digit terakhir</strong> dari hasil penjumlahan.</li>
                <li>Setiap kolom memiliki waktu 15 detik. Setelah waktu habis, kolom akan berganti secara otomatis.</li>
                <li>Tes terdiri dari 50 kolom dengan 60 angka per kolom.</li>
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
                Tes akan berjalan selama 15 detik per kolom. Jangan tinggalkan halaman selama tes berlangsung.
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
            <Button variant="outline" onClick={() => setIsConfirmExitOpen(false)} className="sm:flex-1">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          {/* Timer and controls */}
          <div className="flex flex-col items-center mb-6 relative">
            <Timer 
              timeLeft={columnTimeLeft}
              columnNumber={currentColumnIndex + 1}
              progress={columnProgressPercentage}
            />
            
              <Button 
                variant="ghost" 
              className="p-2 h-auto absolute top-0 right-0"
                onClick={handleExitRequest}
              >
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </Button>
          </div>
          
          {/* Test problems - Authentic Kraepelin UI with vertical stacked numbers */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Angka:</h3>
                <div className="text-sm text-gray-500">
                  Posisi: {currentPosition + 1}/60
                </div>
              </div>
              
              <TestColumn 
                column={columns[currentColumnIndex]}
                currentPosition={currentPosition}
              />
            </div>
            
            <TestInput 
              onInput={handleInput}
              lastInput={lastInput}
              lastCorrect={lastCorrect}
              inputRef={inputRef}
            />
                </div>
                
          {/* Stats display */}
          <div className="mt-6">
            <TestStats 
              totalAnswers={totalAnswers}
              correctAnswers={correctAnswers}
              accuracy={accuracy}
            />
          </div>
        </div>
      )}
    </div>
  );
}