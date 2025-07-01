import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';

// List of provinces in Indonesia
const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan',
  'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung', 'DKI Jakarta', 'Jawa Barat', 'Banten',
  'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan'
];

// Academic levels with detailed information
const academicLevels = [
  { value: 'SMA', label: 'SMA/SMK', description: 'Sekolah Menengah Atas/Kejuruan' },
  { value: 'D1', label: 'D1', description: 'Diploma 1' },
  { value: 'D2', label: 'D2', description: 'Diploma 2' },
  { value: 'D3', label: 'D3', description: 'Diploma 3' },
  { value: 'D4', label: 'D4', description: 'Diploma 4' },
  { value: 'S1', label: 'S1', description: 'Sarjana' },
  { value: 'S2', label: 'S2', description: 'Magister' },
  { value: 'S3', label: 'S3', description: 'Doktor' }
];

const ProfileStep = ({ userProfile, onUpdateProfile, onNext, onBack }) => {
  const [profile, setProfile] = useState({
    displayName: userProfile.displayName || '',
    education: {
      level: userProfile.education?.level || '',
      major: userProfile.education?.major || '',
      institution: userProfile.education?.institution || '',
      graduationYear: userProfile.education?.graduationYear || '',
      gpa: userProfile.education?.gpa || ''
    },
    targetProvinces: userProfile.targetProvinces || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };
  
  const handleEducationLevelChange = (value) => {
    setProfile({
      ...profile,
      education: {
        ...profile.education,
        level: value
      }
    });
  };
  
  const handleProvinceToggle = (province) => {
    const currentProvinces = [...profile.targetProvinces];
    
    if (currentProvinces.includes(province)) {
      // Remove the province if already selected
      setProfile({
        ...profile,
        targetProvinces: currentProvinces.filter(p => p !== province)
      });
    } else {
      // Add the province if not already selected
      setProfile({
        ...profile,
        targetProvinces: [...currentProvinces, province]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(profile);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Profil Anda</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Informasi Pribadi</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                Nama Lengkap
              </label>
              <Input
                id="displayName"
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Education Information */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Latar Belakang Pendidikan</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="education.level" className="block text-sm font-medium mb-1">
                Jenjang Pendidikan Terakhir
              </label>
              <Select onValueChange={handleEducationLevelChange} defaultValue={profile.education.level}>
                <SelectTrigger id="education.level" className="w-full">
                  <SelectValue placeholder="Pilih Jenjang Pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {academicLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="education.major" className="block text-sm font-medium mb-1">
                Jurusan/Program Studi
              </label>
              <Input
                id="education.major"
                name="education.major"
                value={profile.education.major}
                onChange={handleChange}
                placeholder="Contoh: Akuntansi, Hukum, Teknik Sipil"
                required
              />
            </div>
            
            <div>
              <label htmlFor="education.institution" className="block text-sm font-medium mb-1">
                Institusi Pendidikan
              </label>
              <Input
                id="education.institution"
                name="education.institution"
                value={profile.education.institution}
                onChange={handleChange}
                placeholder="Contoh: Universitas Indonesia, Politeknik Negeri Jakarta"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="education.graduationYear" className="block text-sm font-medium mb-1">
                  Tahun Lulus
                </label>
                <Input
                  id="education.graduationYear"
                  name="education.graduationYear"
                  type="number"
                  min="1980"
                  max="2025"
                  value={profile.education.graduationYear}
                  onChange={handleChange}
                  placeholder="Contoh: 2023"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="education.gpa" className="block text-sm font-medium mb-1">
                  IPK
                </label>
                <Input
                  id="education.gpa"
                  name="education.gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={profile.education.gpa}
                  onChange={handleChange}
                  placeholder="Contoh: 3.50"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Target Provinces */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Provinsi Target Penempatan</h3>
          <p className="text-sm text-gray-500 mb-2">
            Pilih provinsi yang Anda minati untuk penempatan CPNS (maksimal 5 provinsi)
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
            {provinces.map(province => (
              <div key={province} className="flex items-center space-x-2">
                <Checkbox
                  id={`province-${province}`}
                  checked={profile.targetProvinces.includes(province)}
                  onCheckedChange={() => handleProvinceToggle(province)}
                  disabled={!profile.targetProvinces.includes(province) && profile.targetProvinces.length >= 5}
                />
                <label 
                  htmlFor={`province-${province}`} 
                  className={`text-sm ${!profile.targetProvinces.includes(province) && profile.targetProvinces.length >= 5 ? 'text-gray-400' : ''}`}
                >
                  {province}
                </label>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Provinsi terpilih: {profile.targetProvinces.length}/5
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

export default ProfileStep;
