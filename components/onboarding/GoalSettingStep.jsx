import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const GoalSettingStep = ({ userProfile, onUpdateProfile, onNext, onBack }) => {
  const [goals, setGoals] = useState({
    targetExam: userProfile.targetExam || 'SKD',
    targetScore: {
      twk: userProfile.targetScore?.twk || 85,
      tiu: userProfile.targetScore?.tiu || 80,
      tkp: userProfile.targetScore?.tkp || 155,
      total: userProfile.targetScore?.total || 320
    }
  });

  const handleExamChange = (value) => {
    setGoals({
      ...goals,
      targetExam: value
    });
  };

  const handleScoreChange = (aspect, value) => {
    const newTargetScore = {
      ...goals.targetScore,
      [aspect]: parseInt(value)
    };
    
    // Update total automatically
    newTargetScore.total = newTargetScore.twk + newTargetScore.tiu + newTargetScore.tkp;
    
    setGoals({
      ...goals,
      targetScore: newTargetScore
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(goals);
    onNext();
  };
  
  // Calculate passing chances based on target score
  const getPassingChance = (score) => {
    if (score >= 350) return "Sangat Tinggi";
    if (score >= 320) return "Tinggi";
    if (score >= 290) return "Sedang";
    if (score >= 260) return "Rendah";
    return "Sangat Rendah";
  };

  const passingChance = getPassingChance(goals.targetScore.total);
  const passingChanceColor = {
    "Sangat Tinggi": "text-green-600",
    "Tinggi": "text-green-500",
    "Sedang": "text-yellow-500",
    "Rendah": "text-orange-500",
    "Sangat Rendah": "text-red-500"
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Target Skor Anda</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="targetExam" className="block text-sm font-medium mb-1">
            Ujian Target
          </label>
          <Select onValueChange={handleExamChange} defaultValue={goals.targetExam}>
            <SelectTrigger id="targetExam" className="w-full">
              <SelectValue placeholder="Pilih ujian target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SKD">SKD CPNS</SelectItem>
              <SelectItem value="PPPK">PPPK</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {goals.targetExam === 'SKD' && (
          <>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="twkScore" className="text-sm font-medium">
                    TWK (Tes Wawasan Kebangsaan)
                  </label>
                  <span className="text-sm font-medium">
                    {goals.targetScore.twk}/150
                  </span>
                </div>
                <Slider
                  id="twkScore"
                  min={0}
                  max={150}
                  step={1}
                  value={[goals.targetScore.twk]}
                  onValueChange={(values) => handleScoreChange('twk', values[0])}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Passing grade: 65-75 (tergantung formasi)
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="tiuScore" className="text-sm font-medium">
                    TIU (Tes Intelegensi Umum)
                  </label>
                  <span className="text-sm font-medium">
                    {goals.targetScore.tiu}/175
                  </span>
                </div>
                <Slider
                  id="tiuScore"
                  min={0}
                  max={175}
                  step={1}
                  value={[goals.targetScore.tiu]}
                  onValueChange={(values) => handleScoreChange('tiu', values[0])}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Passing grade: 80-85 (tergantung formasi)
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="tkpScore" className="text-sm font-medium">
                    TKP (Tes Karakteristik Pribadi)
                  </label>
                  <span className="text-sm font-medium">
                    {goals.targetScore.tkp}/325
                  </span>
                </div>
                <Slider
                  id="tkpScore"
                  min={0}
                  max={325}
                  step={1}
                  value={[goals.targetScore.tkp]}
                  onValueChange={(values) => handleScoreChange('tkp', values[0])}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Passing grade: 143-155 (tergantung formasi)
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Total Target Skor:</div>
                <div className="text-lg font-bold">{goals.targetScore.total}/650</div>
              </div>
              
              <div className="mt-2 text-sm">
                Peluang kelulusan: <span className={passingChanceColor[passingChance]}>{passingChance}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit">
          Lanjutkan
        </Button>
      </div>
    </form>
  );
};

export default GoalSettingStep;
