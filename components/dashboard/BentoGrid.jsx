import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import { Skeleton } from "../ui/skeleton";

const BentoGrid = ({ testResults, loading }) => {
  const router = useRouter();

  // Grid configuration
  const gridConfig = [
    // Row 1
    [
      {
        title: "Tes SKD",
        description: "Uji kemampuan SKD Anda",
        icon: "📝",
        color: "from-blue-500 to-blue-600",
        href: "/tryout",
        score: testResults?.skd?.score,
        lastAttempt: testResults?.skd?.lastAttempt,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        title: "Tes Kraepelin",
        description: "Ukur kecepatan dan ketelitian",
        icon: "⚡",
        color: "from-purple-500 to-purple-600",
        href: "/kraepelin",
        score: testResults?.kraepelin?.compositeScore,
        lastAttempt: testResults?.kraepelin?.lastAttempt,
        colSpan: 1,
        rowSpan: 1,
      },
      {
        title: "Tes Kepribadian EPPS",
        description: "Temukan kepribadian Anda",
        icon: "🧠",
        color: "from-emerald-500 to-emerald-600",
        href: "/epps",
        score: testResults?.epps?.primaryTrait,
        lastAttempt: testResults?.epps?.lastAttempt,
        colSpan: 1,
        rowSpan: 1,
      },
    ],
    // Row 2
    [
      {
        title: "Statistik",
        description: "Lihat perkembangan Anda",
        icon: "📊",
        color: "from-amber-500 to-amber-600",
        href: "/stats",
        colSpan: 1,
        rowSpan: 1,
      },
      {
        title: "Leaderboard",
        description: "Bandingkan dengan peserta lain",
        icon: "🏆",
        color: "from-rose-500 to-rose-600",
        href: "/leaderboard",
        colSpan: 1,
        rowSpan: 1,
      },
      {
        title: "Rekomendasi Belajar",
        description: "Tingkatkan skor Anda",
        icon: "🎯",
        color: "from-indigo-500 to-indigo-600",
        href: "/recommendations",
        colSpan: 2,
        rowSpan: 1,
      },
    ],
  ];

  const GridItem = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-6 ${item.color} text-white`}
      style={{
        gridColumn: `span ${item.colSpan} / span ${item.colSpan}`,
        gridRow: `span ${item.rowSpan} / span ${item.rowSpan}`,
      }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      <div className="relative z-10 h-full flex flex-col">
        <div className="text-4xl mb-4">{item.icon}</div>
        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
        <p className="text-sm text-white/80 mb-4">{item.description}</p>
        
        {item.score !== undefined && (
          <div className="mt-auto">
            <div className="text-2xl font-bold">{item.score}</div>
            <p className="text-xs text-white/60">
              {item.lastAttempt ? `Terakhir: ${new Date(item.lastAttempt).toLocaleDateString()}` : 'Belum ada hasil'}
            </p>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white"
          onClick={() => router.push(item.href)}
        >
          Buka
        </Button>
      </div>
    </motion.div>
  );

  const SkeletonItem = () => (
    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-6 animate-pulse">
      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
      <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mt-6"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="col-span-1">
            <SkeletonItem />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {gridConfig.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-4">
          {row.map((item, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`col-span-${item.colSpan} row-span-${item.rowSpan}`}
            >
              <GridItem item={item} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BentoGrid;
