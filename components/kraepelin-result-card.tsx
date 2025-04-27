import { KraepelinResults } from './authentic-kraepelin-test';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Share2, Download, Brain, Activity, CheckCircle, Clock, BarChart } from 'lucide-react';
import { PersonalityTest } from '@/lib/personality-test-data';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type KraepelinResultCardProps = {
  results: KraepelinResults;
  test: PersonalityTest;
  isShared?: boolean;
  onSaveToProfile?: () => void;
};

export function KraepelinResultCard({ 
  results,
  test,
  isShared = false,
  onSaveToProfile 
}: KraepelinResultCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Berhasil disalin",
      description: "Link telah disalin ke clipboard",
    });
  };
  
  const getShareUrl = () => {
    // In a real app, this would be a proper sharing URL with the result ID
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared-result/${test.id}/${test.type.toLowerCase()}`;
  };
  
  // Calculate percentiles for the metrics (in a real implementation, these would be calculated based on population data)
  const getPercentile = (score: number) => {
    // For demo, just convert the score (0-5) to a percentile
    return Math.min(Math.round(score * 20), 99);
  };
  
  const speedPercentile = getPercentile(results.speed);
  const accuracyPercentile = getPercentile(results.accuracy);
  const consistencyPercentile = getPercentile(results.consistency);
  const endurancePercentile = getPercentile(results.endurance);
  
  // Get interpretation text based on percentile
  const getInterpretation = (factor: string, percentile: number) => {
    const level = percentile < 33 ? 'low' : percentile < 66 ? 'medium' : 'high';
    return test.factors[factor]?.scoreInterpretation[level] || '';
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">Hasil Tes Kraepelin</CardTitle>
            <CardDescription>
              {test.title} • {formatDate(Date.now())}
            </CardDescription>
          </div>
          
          <div className="w-12 h-12 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Top Summary - Eye-catching results overview */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Ringkasan Performa</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{results.totalAnswers}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Jawaban</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{results.correctAnswers}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Jawaban Benar</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <BarChart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((results.correctAnswers / results.totalAnswers) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Akurasi</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {Math.round(results.totalAnswers / (results.columns?.length || 1))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Rata-rata per Kolom</div>
            </div>
          </div>
        </div>
        
        {/* Detailed metrics */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Detail Performa
          </h3>
          
          {/* Speed */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kecepatan
                </h4>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Persentil {speedPercentile}
              </span>
            </div>
            
            <Progress value={speedPercentile} className="h-2 mb-2" />
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getInterpretation('SPEED', speedPercentile)}
            </p>
          </div>
          
          {/* Accuracy */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ketelitian
                </h4>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Persentil {accuracyPercentile}
              </span>
            </div>
            
            <Progress value={accuracyPercentile} className="h-2 mb-2" />
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getInterpretation('ACCURACY', accuracyPercentile)}
            </p>
          </div>
          
          {/* Consistency */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <BarChart className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Konsistensi
                </h4>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Persentil {consistencyPercentile}
              </span>
            </div>
            
            <Progress value={consistencyPercentile} className="h-2 mb-2" />
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getInterpretation('CONSISTENCY', consistencyPercentile)}
            </p>
          </div>
          
          {/* Endurance */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ketahanan Mental
                </h4>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Persentil {endurancePercentile}
              </span>
            </div>
            
            <Progress value={endurancePercentile} className="h-2 mb-2" />
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getInterpretation('ENDURANCE', endurancePercentile)}
            </p>
          </div>
        </div>
        
        {/* Performance chart */}
        {results.columns && results.columns.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Grafik Performa
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={results.columns.map((column, index) => ({
                    name: `Kolom ${index + 1}`,
                    column: index + 1,
                    answers: column.answers,
                    accuracy: column.answers > 0 ? Math.round((column.correct / column.answers) * 100) : 0,
                  }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="column" label={{ value: 'Nomor Kolom', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis yAxisId="left" label={{ value: 'Jumlah Jawaban', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Akurasi (%)', angle: -90, position: 'insideRight' }} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'accuracy') return [`${value}%`, 'Akurasi'];
                    return [value, 'Jumlah Jawaban'];
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="answers" 
                    name="Jumlah Jawaban" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="accuracy" 
                    name="Akurasi (%)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Detail Performa per Kolom
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                <div>Kolom</div>
                <div>Jawaban</div>
                <div>Akurasi</div>
              </div>
              
              {results.columns.map((column, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-medium">{index + 1}</div>
                  <div>{column.answers}</div>
                  <div>
                    {column.answers > 0 
                      ? `${Math.round((column.correct / column.answers) * 100)}%` 
                      : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        {!isShared && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4" />
            Bagikan Hasil
          </Button>
        )}
        
        {onSaveToProfile && (
          <Button 
            className="flex items-center gap-2"
            onClick={onSaveToProfile}
          >
            <Download className="w-4 h-4" />
            Simpan ke Profil
          </Button>
        )}
      </CardFooter>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bagikan Hasil Tes</DialogTitle>
            <DialogDescription>
              Pilih cara berbagi hasil tes Kraepelin Anda
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank')}
              >
                <Facebook className="w-6 h-6 mb-2 text-blue-600" />
                <span>Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(`Lihat hasil tes Kraepelin saya!`)}`, '_blank')}
              >
                <Twitter className="w-6 h-6 mb-2 text-blue-400" />
                <span>Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => copyToClipboard(getShareUrl())}
              >
                <LinkIcon className="w-6 h-6 mb-2 text-gray-600" />
                <span>Salin Link</span>
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
              <input
                type="text"
                value={getShareUrl()}
                readOnly
                className="flex-1 bg-transparent border-none focus:outline-none p-0 text-sm"
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(getShareUrl())}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}