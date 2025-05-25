import { db } from './firebase';

// Constants for passing grades and scoring
export const SKD_PASSING_GRADES = {
  twk: 65,  // 65% of 150
  tiu: 80,  // 80% of 175
  tkp: 143  // 143 is passing (scale 1-5, average 3.25)
};

// Constants for aspect weights and max scores
export const SKD_ASPECTS = {
  twk: {
    weight: 0.3,
    maxScore: 150,
    categories: ['Pancasila', 'UUD 1945', 'Sistem Politik', 'Sistem Pemerintahan']
  },
  tiu: {
    weight: 0.35,
    maxScore: 175,
    categories: ['Verbal', 'Numerik', 'Logika']
  },
  tkp: {
    weight: 0.35,
    maxScore: 325,
    categories: [
      'Integritas', 'Kerjasama', 'Kepemimpinan', 'Kemampuan Mengambil Keputusan',
      'Kemampuan Mengelola Perubahan', 'Kemampuan Mengelola Sumber Daya',
      'Kemampuan Mengelola Diri', 'Kemampuan Mengelola Informasi',
      'Kemampuan Mengelola Komunikasi', 'Kemampuan Mengelola Teknologi'
    ]
  }
};

// Function to calculate aspect performance
export const calculateAspectPerformance = (aspectData, aspectType) => {
  const { correct, incorrect, timeSpent, categoryScores } = aspectData;
  const totalQuestions = correct + incorrect;
  const timePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;
  const percentage = (correct / totalQuestions) * 100;
  
  // Calculate category performance
  const categoryPerformance = Object.entries(categoryScores).map(([cat, scores]) => {
    const categoryTotal = aspectType === 'tkp' 
      ? scores.max 
      : scores.total;
    const categoryPercentage = categoryTotal > 0 
      ? (aspectType === 'tkp' 
        ? (scores.score / scores.max) * 100 
        : (scores.correct / scores.total) * 100)
      : 0;
    
    return {
      category: cat,
      score: scores.score,
      percentage: categoryPercentage,
      status: categoryPercentage >= 70 ? 'good' : 'needs_improvement'
    };
  });

  return {
    score: aspectType === 'tkp' 
      ? aspectData.score 
      : Math.round((correct / totalQuestions) * SKD_ASPECTS[aspectType].maxScore),
    percentage,
    correct,
    incorrect,
    timeSpent,
    timePerQuestion,
    categoryPerformance,
    status: aspectType === 'tkp' 
      ? aspectData.score >= SKD_PASSING_GRADES[aspectType] 
      : percentage >= SKD_PASSING_GRADES[aspectType],
    recommendations: generateAspectRecommendations(categoryPerformance)
  };
};

// Generate recommendations based on aspect performance
export const generateAspectRecommendations = (categoryPerformance) => {
  const weakCategories = categoryPerformance
    .filter(cp => cp.status === 'needs_improvement')
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  return weakCategories.map(cat => ({
    category: cat.category,
    score: cat.score,
    status: cat.status,
    suggestion: `Fokus pada latihan soal ${cat.category} untuk meningkatkan performa.`
  }));
};

// Analyze overall SKD performance
export const analyzeSKDPerformance = (testResult) => {
  if (!testResult?.aspectScores) return null;
  
  const { twk, tiu, tkp } = testResult.aspectScores;
  
  // Calculate aspect performance
  const twkPerformance = calculateAspectPerformance(twk, 'twk');
  const tiuPerformance = calculateAspectPerformance(tiu, 'tiu');
  const tkpPerformance = calculateAspectPerformance(tkp, 'tkp');
  
  // Calculate overall score
  const totalScore = twkPerformance.score * SKD_ASPECTS.twk.weight +
                     tiuPerformance.score * SKD_ASPECTS.tiu.weight +
                     tkpPerformance.score * SKD_ASPECTS.tkp.weight;
  
  // Get strongest and weakest aspects
  const aspects = [twkPerformance, tiuPerformance, tkpPerformance];
  const strongestAspect = aspects.reduce((prev, curr) => 
    prev.percentage > curr.percentage ? prev : curr
  );
  const weakestAspect = aspects.reduce((prev, curr) => 
    prev.percentage < curr.percentage ? prev : curr
  );

  return {
    totalScore: Math.round(totalScore),
    aspects: {
      twk: twkPerformance,
      tiu: tiuPerformance,
      tkp: tkpPerformance
    },
    strongestAspect,
    weakestAspect,
    timeManagement: {
      totalTime: twk.timeSpent + tiu.timeSpent + tkp.timeSpent,
      avgTimePerQuestion: (twk.timePerQuestion + tiu.timePerQuestion + tkp.timePerQuestion) / 3,
      recommendations: generateTimeManagementRecommendations(aspects)
    }
  };
};

// Generate time management recommendations
export const generateTimeManagementRecommendations = (aspects) => {
  const avgTimePerQuestion = aspects.reduce((sum, aspect) => 
    sum + aspect.timePerQuestion, 0
  ) / aspects.length;

  const slowAspects = aspects.filter(aspect => 
    aspect.timePerQuestion > avgTimePerQuestion * 1.2
  );

  return {
    avgTimePerQuestion,
    recommendations: slowAspects.map(aspect => ({
      aspect: aspect.aspect,
      timePerQuestion: aspect.timePerQuestion,
      suggestion: `Coba percepat waktu pengerjaan ${aspect.aspect.toUpperCase()} untuk meningkatkan efisiensi.`
    }))
  };
};

// Helper function to format SKD analysis for display
export const formatSKDAnalysis = (analysis) => {
  if (!analysis) return null;

  return {
    totalScore: analysis.totalScore,
    aspects: Object.entries(analysis.aspects).map(([aspect, data]) => ({
      name: aspect.toUpperCase(),
      score: data.score,
      percentage: data.percentage,
      status: data.status ? 'success' : 'warning',
      recommendations: data.recommendations,
      categoryPerformance: data.categoryPerformance
    })),
    timeManagement: {
      totalTime: analysis.timeManagement.totalTime,
      avgTimePerQuestion: analysis.timeManagement.avgTimePerQuestion,
      recommendations: analysis.timeManagement.recommendations
    },
    strongestAspect: {
      name: analysis.strongestAspect.aspect.toUpperCase(),
      score: analysis.strongestAspect.score,
      percentage: analysis.strongestAspect.percentage
    },
    weakestAspect: {
      name: analysis.weakestAspect.aspect.toUpperCase(),
      score: analysis.weakestAspect.score,
      percentage: analysis.weakestAspect.percentage
    }
  };
};
