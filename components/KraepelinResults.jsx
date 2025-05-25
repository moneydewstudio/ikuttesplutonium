import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

const KraepelinResults = ({ results }) => {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [isPartialCompletion, setIsPartialCompletion] = useState(false);
  
  // Check if this was a partial completion
  useEffect(() => {
    const partialCompletion = sessionStorage.getItem('kraepelin_partial_completion') === 'true';
    setIsPartialCompletion(partialCompletion);
    
    // Clean up
    return () => {
      sessionStorage.removeItem('kraepelin_partial_completion');
    }
  }, []);
  
  // Calculate enhanced metrics on component mount
  useEffect(() => {
    // Use the same calculation logic as in KraepelinTest component
    const calculateKraepelinMetrics = (rows) => {
      if (!rows || rows.length === 0) return {};
      
      // 1. Ketelitian Kerja (Work Accuracy)
      const totalOpsDone = rows.reduce((sum, row) => sum + row.opsDone, 0);
      const totalCorrect = rows.reduce((sum, row) => sum + row.correctCount, 0);
      const totalErrors = rows.reduce((sum, row) => sum + row.errorCount, 0);
      const accuracy = totalOpsDone > 0 ? totalCorrect / totalOpsDone : 0;
      const errorRatio = totalOpsDone > 0 ? totalErrors / totalOpsDone : 0;
      
      // Work Accuracy Score (1-10 scale, 10 being best)
      const workAccuracyScore = Math.round((1 - errorRatio) * 10);
      
      // 2. Ketahanan Kerja (Work Resilience)
      let workResilienceScore = 5; // Default to middle score
      let firstThreeAvg = 0;
      let lastThreeAvg = 0;
      let resilienceRatio = 1;
      
      if (rows.length >= 6) {
        const firstThreeRows = rows.slice(0, 3);
        const lastThreeRows = rows.slice(-3);
        
        firstThreeAvg = firstThreeRows.reduce((sum, row) => sum + row.opsDone, 0) / 3;
        lastThreeAvg = lastThreeRows.reduce((sum, row) => sum + row.opsDone, 0) / 3;
        
        // Calculate resilience ratio: last three rows / first three rows
        resilienceRatio = firstThreeAvg > 0 ? lastThreeAvg / firstThreeAvg : 1;
        
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
      } else {
        firstThreeAvg = rows.length >= 3 ? 
          rows.slice(0, 3).reduce((sum, row) => sum + row.opsDone, 0) / Math.min(3, rows.length) : 0;
        lastThreeAvg = rows.length >= 3 ? 
          rows.slice(Math.max(0, rows.length - 3)).reduce((sum, row) => sum + row.opsDone, 0) / Math.min(3, rows.length) : 0;
      }
      
      // 3. Kecakapan Kerja (Work Capability)
      // Measure the average operations done per row
      const avgOpsPerRow = totalOpsDone / rows.length;
      
      // Scale to 1-10 score
      let workCapabilityScore;
      if (avgOpsPerRow >= 50) {
        workCapabilityScore = 10;
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
      
      // Calculate composite score
      const compositeScore = Math.round(
        (workAccuracyScore * 0.35) + // 35% weight for accuracy
        (workResilienceScore * 0.25) + // 25% weight for resilience
        (workCapabilityScore * 0.4) // 40% weight for capability/speed
      );
      
      return {
        totalOpsDone,
        totalCorrect,
        totalErrors,
        accuracy: accuracy,
        accuracyPercent: accuracy * 100,
        errorRatio,
        workAccuracy: {
          score: workAccuracyScore,
          errorRatio,
          description: getWorkAccuracyDescription(workAccuracyScore)
        },
        workResilience: {
          score: workResilienceScore,
          firstThreeAvg,
          lastThreeAvg,
          resilienceRatio,
          description: getWorkResilienceDescription(workResilienceScore)
        },
        workCapability: {
          score: workCapabilityScore,
          avgOpsPerRow,
          description: getWorkCapabilityDescription(workCapabilityScore)
        },
        compositeScore,
        compositeDescription: getCompositeScoreDescription(compositeScore)
      };
    };
    
    // Get descriptions for each score
    function getWorkAccuracyDescription(score) {
      if (score >= 9) return "Excellent: Highly detail-oriented with minimal errors. You have exceptional focus and attention to detail.";
      if (score >= 7) return "Good: Makes few errors. You have strong attention to detail in most situations.";
      if (score >= 5) return "Average: Acceptable error rate. You maintain adequate attention to detail but there's room for improvement.";
      if (score >= 3) return "Needs Improvement: Makes frequent errors. You may need to slow down and focus more on precision.";
      return "Concerning: Very high error rate. Consider strategies to improve focus and accuracy.";
    }
    
    function getWorkResilienceDescription(score) {
      if (score >= 9) return "Exceptional: Performance improves significantly over time. You excel under sustained work conditions.";
      if (score >= 7) return "Strong: Maintains consistent performance throughout the test. You have good stamina and focus.";
      if (score >= 5) return "Average: Shows some decline but maintains reasonable performance. You have adequate work stamina.";
      if (score >= 3) return "Fair: Shows moderate decline in performance over time. You may need to build mental stamina.";
      return "Needs Work: Shows significant performance drop. Consider strategies to improve mental endurance.";
    }
    
    function getWorkCapabilityDescription(score) {
      if (score >= 9) return "Superior: Exceptional processing speed. You complete tasks very quickly with high efficiency.";
      if (score >= 7) return "Above Average: Good processing speed. You work at a pace faster than most.";
      if (score >= 5) return "Average: Standard processing speed. You complete tasks at an acceptable pace.";
      if (score >= 3) return "Below Average: Slower processing speed. You may benefit from speed-focused practice.";
      return "Needs Improvement: Very slow processing. Consider exercises to increase mental processing speed.";
    }
    
    function getCompositeScoreDescription(score) {
      if (score >= 9) return "Exceptional: You demonstrate superior mental processing capabilities.";
      if (score >= 7) return "Strong: You demonstrate above-average mental processing capabilities.";
      if (score >= 5) return "Average: You demonstrate typical mental processing capabilities.";
      if (score >= 3) return "Fair: Your mental processing capabilities could benefit from training.";
      return "Needs Improvement: Consider exercises to strengthen your mental processing capabilities.";
    }
    
    setMetrics(calculateKraepelinMetrics(results));
  }, [results]);
  
  // Format data for line chart
  const chartData = results.map(row => ({
    row: row.rowIndex + 1,
    opsDone: row.opsDone,
    correct: row.correctCount,
  }));
  
  // Data for radar chart
  const radarData = metrics ? [
    {
      subject: 'Ketelitian',
      A: metrics.workAccuracy.score,
      fullMark: 10,
    },
    {
      subject: 'Ketahanan',
      A: metrics.workResilience.score,
      fullMark: 10,
    },
    {
      subject: 'Kecakapan',
      A: metrics.workCapability.score,
      fullMark: 10,
    },
  ] : [];
  
  const handleFinish = () => {
    router.push('/dashboard');
  };
  
  // Show loading state if metrics haven't been calculated yet
  if (!metrics) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Menghitung hasil...</p>
      </div>
    </div>;
  }
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        Hasil Tes Kraepelin
      </h2>
      
      {isPartialCompletion && (
        <Alert variant="warning" className="mb-4 w-full max-w-2xl bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-500 font-medium">Tes Tidak Lengkap</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            Anda hanya menyelesaikan {results.length} dari 30 baris. Hasil ini tidak akan disimpan ke profil atau leaderboard. Selesaikan semua 30 baris untuk mendapatkan skor resmi.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4 flex justify-center">
        <Badge variant="outline" className="rounded-full px-4 py-1 bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
          Skor Komposit: {metrics.compositeScore}/10
        </Badge>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-6">
        {metrics.compositeDescription}
      </p>
      
      <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <Tabs defaultValue="scores">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scores">Skor & Interpretasi</TabsTrigger>
            <TabsTrigger value="charts">Grafik Performa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores" className="pt-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Operasi</CardDescription>
                    <CardTitle className="text-3xl text-indigo-600 dark:text-indigo-400">{metrics.totalOpsDone}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Jawaban Benar</CardDescription>
                    <CardTitle className="text-3xl text-green-600 dark:text-green-400">{metrics.totalCorrect}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Akurasi</CardDescription>
                    <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">{metrics.accuracyPercent.toFixed(1)}%</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              
              {/* Detailed Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">Ketelitian Kerja (Work Accuracy)</span>
                    <Badge variant="outline">{metrics.workAccuracy.score}/10</Badge>
                  </CardTitle>
                  <CardDescription>
                    Mengukur kemampuan menjaga akurasi dan presisi dalam tugas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Rasio Kesalahan:</span> {(metrics.workAccuracy.errorRatio * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {metrics.workAccuracy.description}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">Ketahanan Kerja (Work Resilience)</span>
                    <Badge variant="outline">{metrics.workResilience.score}/10</Badge>
                  </CardTitle>
                  <CardDescription>
                    Mengukur konsistensi performa selama periode kerja berkelanjutan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Awal (Baris 1-3)</p>
                      <p className="text-lg font-semibold">{metrics.workResilience.firstThreeAvg.toFixed(1)} operasi/baris</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Akhir (3 baris terakhir)</p>
                      <p className="text-lg font-semibold">{metrics.workResilience.lastThreeAvg.toFixed(1)} operasi/baris</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {metrics.workResilience.description}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">Kecakapan Kerja (Work Capability)</span>
                    <Badge variant="outline">{metrics.workCapability.score}/10</Badge>
                  </CardTitle>
                  <CardDescription>
                    Mengukur kecepatan pemrosesan dan efisiensi kerja secara keseluruhan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Rata-rata Operasi:</span> {metrics.workCapability.avgOpsPerRow.toFixed(1)} per baris
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {metrics.workCapability.description}
                  </p>
                </CardContent>
              </Card>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">Catatan: Kraepelin Test adalah alat untuk mengukur kemampuan kognitif, kecepatan pemrosesan, dan konsistensi kerja. Hasil ini memberikan gambaran tentang karakteristik kerja Anda.</p>
                <p>Hasil ini adalah simulasi dan bukan diagnosis. Untuk penilaian resmi, hubungi psikolog profesional.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grafik Performa</CardTitle>
                  <CardDescription>Jumlah operasi per baris</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="row" 
                          label={{ value: 'Baris', position: 'insideBottomRight', offset: -5 }} 
                        />
                        <YAxis 
                          label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="opsDone" 
                          name="Total Operasi" 
                          stroke="#6366F1" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="correct" 
                          name="Jawaban Benar" 
                          stroke="#10B981" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dimensi Kinerja</CardTitle>
                  <CardDescription>Tiga aspek utama performa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="80%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Skor" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Button
        onClick={handleFinish}
        className="px-6"
      >
        Selesai
      </Button>
    </div>
  );
};

export default KraepelinResults;
