import React from 'react';

const PapiInstructions = ({ onStart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Tes Kepribadian PAPI Kostick
      </h1>
      
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Petunjuk Pengerjaan</h2>
        
        <p className="mb-4">
          Tes PAPI Kostick (Personality Assessment Preference Inventory) adalah alat ukur kepribadian 
          yang dirancang untuk memahami preferensi perilaku Anda dalam konteks pekerjaan.
        </p>
        
        <p className="mb-4">
          Tes ini terdiri dari 90 pertanyaan dengan format pilihan paksa (forced choice), 
          di mana Anda harus memilih satu dari dua pernyataan yang paling sesuai dengan diri Anda.
        </p>
        
        <h3 className="text-lg font-semibold mt-6 mb-3">Cara Mengerjakan:</h3>
        
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Anda akan melihat 4 pertanyaan dalam setiap halaman.</li>
          <li>Setiap pertanyaan memiliki dua pernyataan (A dan B).</li>
          <li>Pilih satu pernyataan yang paling menggambarkan diri Anda.</li>
          <li>Tidak ada jawaban benar atau salah dalam tes ini.</li>
          <li>Jawablah dengan jujur sesuai dengan kepribadian Anda yang sebenarnya.</li>
          <li>Anda harus menjawab semua pertanyaan sebelum melanjutkan ke halaman berikutnya.</li>
        </ol>
        
        <h3 className="text-lg font-semibold mb-3">Penting:</h3>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Jawablah berdasarkan bagaimana Anda biasanya berperilaku, bukan bagaimana Anda ingin berperilaku.</li>
          <li>Jangan terlalu lama memikirkan setiap pertanyaan, jawaban pertama biasanya yang terbaik.</li>
          <li>Hasil tes akan disimpan di profil Anda dan dapat diakses kembali nanti.</li>
          <li>Waktu pengerjaan sekitar 15-20 menit.</li>
        </ul>
        
        <p className="mb-4">
          Setelah menyelesaikan tes, Anda akan melihat profil kepribadian Anda berdasarkan 11 dimensi PAPI Kostick.
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Mulai Tes
        </button>
      </div>
    </div>
  );
};

export default PapiInstructions;
