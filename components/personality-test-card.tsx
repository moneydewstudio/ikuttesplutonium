import { PersonalityTestType } from "@/lib/personality-test-data";
import { Clock, Users, PenLine, Brain } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type PersonalityTestCardProps = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: PersonalityTestType;
  timeInMinutes: number;
  participants?: number;
};

export function PersonalityTestCard({
  id,
  slug,
  title,
  description,
  type,
  timeInMinutes,
  participants = 0,
}: PersonalityTestCardProps) {
  const getTypeIcon = (type: PersonalityTestType) => {
    switch (type) {
      case 'MBTI':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
      case 'BIG_FIVE':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'HEXACO':
        return 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300';
      case 'KRAEPELIN':
        return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300';
      case 'DISC':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeIcon(type)}`}>
            <Brain className="w-5 h-5" />
          </div>
          <div className="ml-3">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {type === 'MBTI' ? 'Myers-Briggs Type Indicator' :
               type === 'BIG_FIVE' ? 'Big Five Personality Test' :
               type === 'HEXACO' ? 'HEXACO Personality Inventory' :
               type === 'DISC' ? 'DISC Personality Assessment' :
               type === 'KRAEPELIN' ? 'Kraepelin Arithmetic Test' : 'Personality Test'}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-5">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{timeInMinutes} menit</span>
          </div>
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{participants.toLocaleString()} peserta</span>
          </div>
          
          <div className="flex items-center">
            <PenLine className="w-4 h-4 mr-1" />
            <span>
              {type === 'MBTI' ? '12 pertanyaan' : 
               type === 'BIG_FIVE' ? '10 pertanyaan' : 
               type === 'KRAEPELIN' ? 'arithmetic test' : 
               '12 pertanyaan'}
            </span>
          </div>
        </div>
        
        <Link href={type === 'KRAEPELIN' ? `/kraepelin-test/${slug}` : `/personality-test/${slug}`}>
          <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
            Mulai Tes
          </Button>
        </Link>
      </div>
    </div>
  );
}