import React from 'react';
import Head from 'next/head';
import { FeatureDemo } from '@/components/ui/feature-demo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FeatureGridDemo() {
  return (
    <>
      <Head>
        <title>Feature Grid Demo | Ikuttes</title>
        <meta name="description" content="Demo page for the feature grid component" />
      </Head>
      
      <div className="bg-white dark:bg-black min-h-screen">
        <Header />
        
        <main>
          <FeatureDemo />
          
          <div className="container mx-auto py-8 px-4 mb-20">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Tentang Komponen Ini</h2>
              <p className="mb-4">
                Komponen grid fitur ini menampilkan berbagai fitur dari platform Ikuttes dalam format
                grid yang responsif. Komponen ini dapat digunakan di halaman beranda atau halaman 
                fitur untuk menyoroti fungsionalitas utama platform.
              </p>
              <h3 className="text-xl font-semibold mb-2">Karakteristik:</h3>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Layout grid responsif yang beradaptasi dengan berbagai ukuran layar</li>
                <li>Tampilan visual dengan ikon dari Lucide React</li>
                <li>Warna tema yang konsisten dengan brand Ikuttes</li>
                <li>Mudah dikustom untuk berbagai jenis konten</li>
              </ul>
              <h3 className="text-xl font-semibold mb-2">Catatan Integrasi:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Komponen ini dapat digunakan sebagai pengganti atau pelengkap untuk komponen Features yang sudah ada</li>
                <li>Ikon dapat diganti sesuai dengan kebutuhan</li>
                <li>Teks dan judul dapat dikustomisasi untuk berbagai kebutuhan</li>
                <li>Background dapat diubah atau ditambahkan gambar jika diperlukan</li>
              </ul>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
