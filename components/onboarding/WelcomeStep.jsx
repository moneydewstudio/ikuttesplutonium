import { Button } from '../ui/button';

const WelcomeStep = ({ onNext }) => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-bold">Selamat Datang di Ikuttes!</h1>
      
      <p className="text-gray-600">
        Kami akan membantu Anda mempersiapkan ujian CPNS dengan lebih efektif
        melalui beberapa langkah pengaturan awal.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
            1
          </div>
          <div className="text-left">Isi profil pendidikan Anda</div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
            2
          </div>
          <div className="text-left">Tetapkan target skor yang ingin dicapai</div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
            3
          </div>
          <div className="text-left">Sesuaikan preferensi pembelajaran Anda</div>
        </div>
      </div>
      
      <Button onClick={onNext} className="w-full mt-6">
        Mulai Sekarang
      </Button>
    </div>
  );
};

export default WelcomeStep;
