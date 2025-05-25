import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { analyzeSKDPerformance, formatSKDAnalysis } from '../../utils/skdAnalytics';
import { Skeleton } from '../ui/skeleton';

const AspectScoreCard = ({ aspect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!aspect) return null;

  const getAspectColor = (status) => {
    return status === 'success' ? 'bg-green-500' : 'bg-amber-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{aspect.name}</span>
        <span className={`font-semibold ${
          aspect.status === 'success' ? 'text-green-600' : 'text-amber-600'
        }`}>
          {aspect.score} ({Math.round(aspect.percentage)}%)
        </span>
      </div>
      <Progress 
        value={aspect.percentage} 
        className={`h-2 ${getAspectColor(aspect.status)}/20`}
        indicatorClassName={getAspectColor(aspect.status)}
      />
    </div>
  );
};

const CategoryBreakdown = ({ categories, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-sm font-medium">Detail Kategori</h4>
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{category.category}</span>
              <span className={`font-medium ${
                category.status === 'good' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {Math.round(category.percentage)}%
              </span>
            </div>
            <Progress 
              value={category.percentage} 
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
              indicatorClassName={category.status === 'good' ? 'bg-green-500' : 'bg-amber-500'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
        <p className="text-sm text-green-800 dark:text-green-200">
          Selamat! Performa Anda sudah sangat baik di semua kategori.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Rekomendasi Peningkatan</h3>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md text-sm">
            <div className="font-medium text-amber-800 dark:text-amber-200">
              {rec.category}: {rec.suggestion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimeAnalysis = ({ timeData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    );
  }

  if (!timeData) return null;

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
        Analisis Waktu
      </h3>
      <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
        {Math.floor(timeData.totalTime / 60)} menit {timeData.totalTime % 60} detik
      </div>
      <div className="text-sm text-blue-600 dark:text-blue-400">
        Rata-rata {Math.round(timeData.avgTimePerQuestion)} detik/soal
      </div>
      
      {timeData.recommendations && timeData.recommendations.length > 0 && (
        <div className="mt-2 text-xs text-blue-800 dark:text-blue-200">
          Tip: {timeData.recommendations[0].suggestion}
        </div>
      )}
    </div>
  );
};

const SKDAnalytics = ({ skdResult, isLoading }) => {
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    if (skdResult && !isLoading) {
      const analysisResult = analyzeSKDPerformance(skdResult);
      setAnalysis(formatSKDAnalysis(analysisResult));
    }
  }, [skdResult, isLoading]);

  if (!skdResult && !isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada data SKD. Silakan kerjakan tes SKD terlebih dahulu.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Analisis SKD</span>
          {!isLoading && analysis && (
            <span className={`text-base ${
              analysis.aspects.every(a => a.status === 'success') 
                ? 'text-green-600' 
                : 'text-amber-600'
            }`}>
              {analysis.totalScore}/750
            </span>
          )}
        </CardTitle>
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : analysis ? (
          <p className="text-sm text-gray-500">
            {analysis.aspects.every(a => a.status === 'success') ? (
              <span className="text-green-600">Anda memenuhi passing grade untuk semua aspek!</span>
            ) : (
              <span className="text-amber-600">Beberapa aspek membutuhkan perhatian lebih</span>
            )}
          </p>
        ) : null}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="details">Detail Kategori</TabsTrigger>
            <TabsTrigger value="recommendations">Rekomendasi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Ringkasan Nilai</h3>
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <AspectScoreCard key={i} isLoading={true} />
                  ))
                ) : analysis ? (
                  analysis.aspects.map((aspect, i) => (
                    <AspectScoreCard key={i} aspect={aspect} isLoading={false} />
                  ))
                ) : null}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </>
              ) : analysis ? (
                <>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                      Aspek Terkuat
                    </div>
                    <div className="mt-1 text-xl font-bold text-green-600 dark:text-green-300">
                      {analysis.strongestAspect.name}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {Math.round(analysis.strongestAspect.percentage)}% • {analysis.strongestAspect.score} poin
                    </div>
                  </div>
                  
                  <TimeAnalysis 
                    timeData={analysis.timeManagement} 
                    isLoading={false} 
                  />
                </>
              ) : null}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <CategoryBreakdown isLoading={true} />
                </div>
              ))
            ) : analysis ? (
              analysis.aspects.map((aspect, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-medium">{aspect.name}</h3>
                  <CategoryBreakdown 
                    categories={aspect.categoryPerformance}
                    isLoading={false}
                  />
                </div>
              ))
            ) : null}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            {isLoading ? (
              <RecommendationCard isLoading={true} />
            ) : analysis ? (
              <>
                <RecommendationCard 
                  recommendations={analysis.aspects
                    .flatMap(a => a.recommendations)
                    .sort((a, b) => a.category.localeCompare(b.category))
                  }
                  isLoading={false}
                />
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-4">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Aspek yang Perlu Ditingkatkan
                  </h3>
                  {analysis.weakestAspect.percentage < 70 ? (
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>{analysis.weakestAspect.name}</strong> adalah aspek yang perlu paling banyak perhatian.
                      Fokus pada latihan soal pada kategori ini untuk meningkatkan performa SKD Anda secara keseluruhan.
                    </div>
                  ) : (
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      Semua aspek sudah cukup baik. Tetap pertahankan dan tingkatkan!
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SKDAnalytics;
