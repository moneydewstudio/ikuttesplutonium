import { Badge } from "./badge";
import { BookOpen, BrainCircuit, ClipboardCheck, GraduationCap, Lightbulb, UserCheck } from "lucide-react";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800">Fitur Utama</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
                Persiapan CPNS Lengkap
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Ikuttes menyediakan fitur komprehensif untuk membantu Anda mempersiapkan seluruh aspek ujian CPNS dengan lebih efektif.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Tryout SKD Lengkap</h3>
              <p className="text-muted-foreground text-base">
                Simulasi ujian SKD dengan soal-soal yang mirip dengan ujian sebenarnya untuk TWK, TIU, dan TKP.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <Lightbulb className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Quiz Cepat</h3>
              <p className="text-muted-foreground text-base">
                Latihan singkat untuk topik spesifik dengan waktu terbatas, dilengkapi pembahasan komprehensif.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <BrainCircuit className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Tes Kraepelin</h3>
              <p className="text-muted-foreground text-base">
                Ukur kecakapan, ketelitian, dan ketahanan kerja Anda dengan metode evaluasi psikologi standar.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <UserCheck className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Tes Kepribadian</h3>
              <p className="text-muted-foreground text-base">
                Persiapkan diri untuk tes kepribadian dengan PAPI Kostick, EPPS, dan tools psikometri lainnya.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <ClipboardCheck className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Analisis Performa</h3>
              <p className="text-muted-foreground text-base">
                Pantau perkembangan Anda melalui dashboard yang menampilkan statistik dan area untuk peningkatan.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-md aspect-video mb-2 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl tracking-tight">Materi Belajar</h3>
              <p className="text-muted-foreground text-base">
                Akses materi pembelajaran untuk semua topik SKD, dengan penjelasan rinci dan contoh soal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
