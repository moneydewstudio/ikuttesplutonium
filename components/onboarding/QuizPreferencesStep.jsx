import { useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';

const focusAreas = [
  { id: 'twk_pancasila', group: 'TWK', label: 'Pancasila' },
  { id: 'twk_uud', group: 'TWK', label: 'UUD 1945' },
  { id: 'twk_bhinneka', group: 'TWK', label: 'Bhinneka Tunggal Ika' },
  { id: 'twk_nkri', group: 'TWK', label: 'NKRI' },
  { id: 'tiu_verbal', group: 'TIU', label: 'Verbal (Sinonim, Antonim, Analogi)' },
  { id: 'tiu_numerik', group: 'TIU', label: 'Numerik (Deret, Hitungan)' },
  { id: 'tiu_logika', group: 'TIU', label: 'Logika (Silogisme, Analitis)' },
  { id: 'tiu_figural', group: 'TIU', label: 'Figural' },
  { id: 'tkp_pelayanan', group: 'TKP', label: 'Pelayanan Publik' },
  { id: 'tkp_integritas', group: 'TKP', label: 'Integritas' },
  { id: 'tkp_komitmen', group: 'TKP', label: 'Komitmen Organisasi' }
];

const QuizPreferencesStep = ({ userProfile, onUpdateProfile, onNext, onBack }) => {
  const [preferences, setPreferences] = useState({
    studyPreferences: {
      dailyGoal: userProfile.studyPreferences?.dailyGoal || 30,
      focusAreas: userProfile.studyPreferences?.focusAreas || []
    }
  });

  const handleDailyGoalChange = (values) => {
    setPreferences({
      ...preferences,
      studyPreferences: {
        ...preferences.studyPreferences,
        dailyGoal: values[0]
      }
    });
  };

  const handleFocusAreaToggle = (areaId) => {
    const currentAreas = preferences.studyPreferences.focusAreas;
    let newAreas;
    
    if (currentAreas.includes(areaId)) {
      newAreas = currentAreas.filter(id => id !== areaId);
    } else {
      newAreas = [...currentAreas, areaId];
    }
    
    setPreferences({
      ...preferences,
      studyPreferences: {
        ...preferences.studyPreferences,
        focusAreas: newAreas
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(preferences);
    onNext();
  };

  // Group focus areas by category
  const groupedAreas = focusAreas.reduce((acc, area) => {
    if (!acc[area.group]) {
      acc[area.group] = [];
    }
    acc[area.group].push(area);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Preferensi Pembelajaran</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="dailyGoal" className="block text-sm font-medium mb-1">
            Target Waktu Belajar Harian
          </label>
          <div className="flex items-center space-x-4">
            <Slider
              id="dailyGoal"
              min={15}
              max={120}
              step={15}
              value={[preferences.studyPreferences.dailyGoal]}
              onValueChange={handleDailyGoalChange}
              className="flex-1"
            />
            <span className="text-sm font-medium w-20 text-right">
              {preferences.studyPreferences.dailyGoal} menit
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Berapa lama Anda berencana belajar setiap hari?
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Area yang Ingin Ditingkatkan
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Pilih materi yang ingin Anda fokuskan dalam persiapan CPNS
          </p>
          
          <div className="space-y-5 border rounded-md p-3">
            {Object.entries(groupedAreas).map(([group, areas]) => (
              <div key={group} className="space-y-2">
                <h3 className="font-medium text-sm text-blue-600">{group}</h3>
                <div className="space-y-2">
                  {areas.map(area => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.id}
                        checked={preferences.studyPreferences.focusAreas.includes(area.id)}
                        onCheckedChange={() => handleFocusAreaToggle(area.id)}
                      />
                      <label htmlFor={area.id} className="text-sm">
                        {area.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            Kami akan menyesuaikan latihan soal berdasarkan pilihan Anda.
          </div>
        </div>
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

export default QuizPreferencesStep;
