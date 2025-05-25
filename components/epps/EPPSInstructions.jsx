import React from 'react';

const EPPSInstructions = ({ onStart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 border-4 border-black">
      <h1 className="text-2xl font-bold text-center text-black mb-6 relative">
        <span className="bg-yellow-300 px-4 py-1 -rotate-1 inline-block">Tes Kepribadian EPPS</span>
      </h1>
      
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold mb-4">Petunjuk Pengerjaan</h2>
        
        <p className="mb-4">
          Tes Edwards Personal Preference Schedule (EPPS) adalah alat ukur kepribadian 
          yang dirancang untuk memahami preferensi dan motivasi Anda dalam konteks pekerjaan.
        </p>
        
        <p className="mb-4">
          Tes ini terdiri dari 225 pasang pernyataan dengan format pilihan paksa (forced choice), 
          di mana Anda harus memilih satu dari dua pernyataan yang paling sesuai dengan diri Anda.
        </p>
        
        <h3 className="text-lg font-semibold mt-6 mb-3">Cara Mengerjakan:</h3>
        
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Anda akan melihat 45 pertanyaan dalam setiap batch (total 5 batch).</li>
          <li>Setiap pertanyaan memiliki dua pernyataan (A dan B).</li>
          <li>Pilih satu pernyataan yang paling menggambarkan diri Anda.</li>
          <li>Tidak ada jawaban benar atau salah dalam tes ini.</li>
          <li>Jawablah dengan jujur sesuai dengan kepribadian Anda yang sebenarnya.</li>
          <li>Anda harus menjawab semua pertanyaan sebelum melanjutkan ke batch berikutnya.</li>
          <li>Anda tidak dapat kembali ke pertanyaan sebelumnya (no backtracking).</li>
        </ol>
        
        <h3 className="text-lg font-semibold mb-3">Penting:</h3>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Jawablah berdasarkan bagaimana Anda biasanya berperilaku, bukan bagaimana Anda ingin berperilaku.</li>
          <li>Jangan terlalu lama memikirkan setiap pertanyaan, jawaban pertama biasanya yang terbaik.</li>
          <li>Hasil tes akan disimpan di browser Anda dan dapat diakses kembali nanti.</li>
          <li>Waktu pengerjaan sekitar 45 menit untuk seluruh tes.</li>
        </ul>
        
        <p className="mb-4">
          Setelah menyelesaikan tes, Anda akan melihat profil kepribadian Anda berdasarkan 15 dimensi EPPS.
        </p>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors transform hover:-translate-y-1 hover:shadow-lg"
        >
          Mulai Tes
        </button>
      </div>
    </div>
  );
};

export default EPPSInstructions;
