import { PersonalityResult, PersonalityTest, PersonalityTestType } from "@/lib/personality-test-data";
import { 
  Facebook, 
  Twitter, 
  Link as LinkIcon, 
  Download, 
  Brain,
  Share2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type PersonalityResultCardProps = {
  result: PersonalityResult;
  test: PersonalityTest;
  isPublic?: boolean;
  isShared?: boolean;
  onSaveToProfile?: () => void;
};

export function PersonalityResultCard({
  result,
  test,
  isPublic = true,
  isShared = false,
  onSaveToProfile,
}: PersonalityResultCardProps) {
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
  
  const renderFactorResult = (factorKey: string, score: number) => {
    // Get the factor info from the test
    const factorInfo = test.factors[factorKey];
    if (!factorInfo) return null;
    
    // Determine the interpretation based on score
    let interpretation = '';
    if (score <= 2.33) {
      interpretation = factorInfo.scoreInterpretation.low;
    } else if (score <= 3.66) {
      interpretation = factorInfo.scoreInterpretation.medium;
    } else {
      interpretation = factorInfo.scoreInterpretation.high;
    }
    
    // Calculate percentage for progress bar
    const percentage = (score / 5) * 100;
    
    return (
      <div key={factorKey} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {factorInfo.name}
          </h4>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {score.toFixed(1)} / 5
          </span>
        </div>
        
        <Progress value={percentage} className="h-2 mb-2" />
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {interpretation}
        </p>
      </div>
    );
  };
  
  const renderMBTIResult = () => {
    if (result.testType !== 'MBTI' || !result.mainType) return null;
    
    return (
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">
            Tipe Kepribadian MBTI Anda
          </h3>
          <div className="w-14 h-14 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-2xl font-bold text-purple-700 dark:text-purple-300">
            {result.mainType}
          </div>
        </div>
        
        <p className="text-purple-700 dark:text-purple-300">
          {result.mainType === 'INTJ' ? 'Arsitek - Pemikir strategis dan perencana dengan visi jangka panjang' :
           result.mainType === 'INTP' ? 'Logis - Inovator yang mementingkan pengetahuan dan intelektualitas' :
           result.mainType === 'ENTJ' ? 'Komandan - Pemimpin berani dengan kemauan keras dan pikiran strategis' :
           result.mainType === 'ENTP' ? 'Pendebat - Pemikir cerdas yang menyukai tantangan intelektual' :
           result.mainType === 'INFJ' ? 'Advokat - Idealis dengan prinsip moral kuat dan visi jelas tentang kebaikan' :
           result.mainType === 'INFP' ? 'Mediator - Individu idealis, setia pada nilai-nilai dan orang yang mereka anggap penting' :
           result.mainType === 'ENFJ' ? 'Protagonis - Pemimpin karismatik dan inspiratif, memotivasi orang lain' :
           result.mainType === 'ENFP' ? 'Juru Kampanye - Semangat bebas yang antusias, kreatif dan sosial' :
           result.mainType === 'ISTJ' ? 'Logistik - Individu praktis dan berorientasi fakta dengan akurasi kuat' :
           result.mainType === 'ISFJ' ? 'Pembela - Pelindung yang sangat berdedikasi dan hangat' :
           result.mainType === 'ESTJ' ? 'Eksekutif - Administrator yang unggul, mengelola hal-hal dengan jelas' :
           result.mainType === 'ESFJ' ? 'Konsul - Orang yang peduli, sosial dan populer, selalu ingin membantu' :
           result.mainType === 'ISTP' ? 'Pengrajin - Eksperimentalis pemberani yang menguasai semua jenis alat' :
           result.mainType === 'ISFP' ? 'Petualang - Seniman fleksibel dan memukau dengan gaya estetika baru' :
           result.mainType === 'ESTP' ? 'Pengusaha - Orang pintar, energik yang menikmati hidup di sini dan sekarang' :
           result.mainType === 'ESFP' ? 'Penghibur - Orang yang spontan, energik dan antusias' :
           'Hasil tipe kepribadian MBTI Anda'}
        </p>
      </div>
    );
  };
  
  const renderDISCResult = () => {
    if (result.testType !== 'DISC' || !result.mainType) return null;
    
    // Define descriptions for different DISC types
    const discDescriptions: Record<string, string> = {
      'D': 'Dominance - Anda langsung, tegas, dan berorientasi pada hasil. Anda menyukai tantangan dan mengambil keputusan cepat.',
      'I': 'Influence - Anda antusias, optimis, dan suka bersosialisasi. Anda menginspirasi orang lain dan berfokus pada membangun hubungan.',
      'S': 'Steadiness - Anda sabar, setia, dan dapat diandalkan. Anda konsisten, mendukung orang lain, dan menghargai kerja sama.',
      'C': 'Conscientiousness - Anda analitis, sistematis, dan berorientasi pada detail. Anda mementingkan akurasi dan kualitas yang tinggi.',
      'DI': 'Dominance-Influence - Anda percaya diri dan berorientasi pada hasil, tetapi juga memotivasi orang lain dan bersemangat dalam tim.',
      'DS': 'Dominance-Steadiness - Anda tegas dan terorganisir, mengejar tujuan dengan pendekatan yang stabil dan langkah yang konsisten.',
      'DC': 'Dominance-Conscientiousness - Anda berorientasi pada hasil dan detail, membuat keputusan berdasarkan analisis mendalam.',
      'ID': 'Influence-Dominance - Anda karismatik dan berani, memotivasi orang lain sambil tetap fokus pada pencapaian tujuan.',
      'IS': 'Influence-Steadiness - Anda ramah dan suportif, membangun hubungan yang harmonis dan berkelanjutan dengan orang lain.',
      'IC': 'Influence-Conscientiousness - Anda antusias dan teliti, menciptakan ide-ide inovatif yang juga direncanakan dengan hati-hati.',
      'SD': 'Steadiness-Dominance - Anda sabar dan tegas, stabil dalam pendekatan Anda sambil menjaga fokus pada tujuan.',
      'SI': 'Steadiness-Influence - Anda hangat dan ramah, menciptakan lingkungan yang harmonis dan mendukung untuk tim.',
      'SC': 'Steadiness-Conscientiousness - Anda dapat diandalkan dan akurat, bekerja dengan konsisten dan memastikan kualitas.',
      'CD': 'Conscientiousness-Dominance - Anda analitis dan berorientasi pada tujuan, menggunakan logika untuk mencapai hasil.',
      'CI': 'Conscientiousness-Influence - Anda terorganisir dan persuasif, menggabungkan perhatian pada detail dengan komunikasi yang efektif.',
      'CS': 'Conscientiousness-Steadiness - Anda metodis dan dapat diandalkan, bekerja dengan teliti dan konsisten.'
    };
    
    // Background colors for different DISC types
    const getTypeColor = (type: string) => {
      const firstLetter = type.charAt(0);
      switch(firstLetter) {
        case 'D': return 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300';
        case 'I': return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300';
        case 'S': return 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300';
        case 'C': return 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300';
        default: return 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      }
    };
    
    // Background for the card based on primary DISC type
    const cardBgColor = result.mainType.charAt(0) === 'D' ? 'bg-red-50 dark:bg-red-900/20' :
                       result.mainType.charAt(0) === 'I' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                       result.mainType.charAt(0) === 'S' ? 'bg-green-50 dark:bg-green-900/20' :
                       'bg-blue-50 dark:bg-blue-900/20';
    
    // Text color for the card based on primary DISC type
    const cardTextColor = result.mainType.charAt(0) === 'D' ? 'text-red-700 dark:text-red-300' :
                         result.mainType.charAt(0) === 'I' ? 'text-yellow-700 dark:text-yellow-300' :
                         result.mainType.charAt(0) === 'S' ? 'text-green-700 dark:text-green-300' :
                         'text-blue-700 dark:text-blue-300';
    
    return (
      <div className={`mb-6 p-4 ${cardBgColor} rounded-xl`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${cardTextColor}`}>
            Tipe DISC Anda
          </h3>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${getTypeColor(result.mainType)}`}>
            {result.mainType}
          </div>
        </div>
        
        <p className={cardTextColor}>
          {discDescriptions[result.mainType] || `Tipe DISC: ${result.mainType}`}
        </p>
      </div>
    );
  };
  
  const getShareUrl = () => {
    // In a real app, this would be a proper sharing URL with the result ID
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared-result/${result.testId}/${result.testType.toLowerCase()}`;
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">Hasil Tes Kepribadian</CardTitle>
            <CardDescription>
              {test.title} • {formatDate(result.timestamp)}
            </CardDescription>
          </div>
          
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center 
            ${result.testType === 'MBTI' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 
              result.testType === 'BIG_FIVE' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 
              result.testType === 'DISC' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 
              'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300'}`}
          >
            <Brain className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Display MBTI type if available */}
        {renderMBTIResult()}
        
        {/* Display DISC type if available */}
        {renderDISCResult()}
        
        {/* Factor scores */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Detail Skor
          </h3>
          
          {Object.entries(result.scores).map(([factor, score]) => renderFactorResult(factor, score))}
        </div>
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
              Pilih cara berbagi hasil tes kepribadian Anda
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
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(`Lihat hasil tes kepribadian ${test.title} saya!`)}`, '_blank')}
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