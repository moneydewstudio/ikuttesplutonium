import { Button } from '../ui/button';

const CompletionStep = ({ userProfile, onComplete }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-green-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold">Selamat! Profil Anda Sudah Siap</h1>
      
      <p className="text-gray-600">
        Kami telah menyesuaikan pengalaman belajar Anda berdasarkan informasi yang diberikan.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
        <div>
          <div className="text-sm text-gray-500">Nama</div>
          <div className="font-medium">{userProfile.displayName}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Pendidikan</div>
          <div className="font-medium">
            {userProfile.education.level} {userProfile.education.major} ({userProfile.education.institution})
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Target Skor SKD</div>
          <div className="font-medium">{userProfile.targetScore?.total || 0}/650</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Provinsi Target</div>
          <div className="font-medium">
            {userProfile.targetProvinces?.length > 0 
              ? userProfile.targetProvinces.join(', ')
              : 'Tidak ada provinsi yang dipilih'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Waktu Belajar Harian</div>
          <div className="font-medium">{userProfile.studyPreferences?.dailyGoal || 30} menit</div>
        </div>
      </div>
      
      <Button onClick={onComplete} className="w-full mt-6">
        Mulai Perjalanan CPNS Anda
      </Button>
    </div>
  );
};

export default CompletionStep;
