import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import KraepelinTest from '../components/KraepelinTest';
import { NextSeo } from 'next-seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const KraepelinPage = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [testStarted, setTestStarted] = useState(false);
  const [testMode, setTestMode] = useState('practice'); // 'practice' (15s) or 'real' (30s)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  const handleStartTest = (mode) => {
    setTestMode(mode);
    setTestStarted(true);
  };

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <NextSeo
        title="Tes Kraepelin - Ikuttes"
        description="Tes Kraepelin untuk mengukur kecepatan dan akurasi perhitungan matematika sederhana."
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Tes Kraepelin</h1>
        
        {!testStarted ? (
          <Card>
            <CardHeader>
              <CardTitle>Petunjuk Tes Kraepelin</CardTitle>
              <CardDescription>Tes kecepatan dan akurasi perhitungan matematika sederhana</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Tes ini terdiri dari 30 baris angka, masing-masing berisi 116 digit.</li>
                <li>Tugas Anda adalah menjumlahkan setiap pasangan angka yang berdekatan.</li>
                <li>Masukkan hanya digit terakhir dari hasil penjumlahan (misal: 5+7=12, masukkan 2).</li>
                <li>Anda akan melihat 4 digit pada satu waktu, dan harus memasukkan 3 jawaban.</li>
                <li>Jawaban akan otomatis dikirim saat Anda mengetik angka.</li>
                <li>Jika Anda menyelesaikan semua pasangan sebelum waktu habis, tunggu hingga waktu habis.</li>
                <li>Hasil akan disimpan dan muncul di profil Anda.</li>
              </ul>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => handleStartTest('practice')}
                  variant="outline"
                >
                  Latihan (15 detik per baris)
                </Button>
                <Button 
                  onClick={() => handleStartTest('real')}
                >
                  Tes Sebenarnya (30 detik per baris)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <KraepelinTest 
                mode={testMode}
                rowDuration={testMode === 'practice' ? 15 : 30}
              />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KraepelinPage;
