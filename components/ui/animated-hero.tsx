import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoveRight, UserPlus } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

function Hero() {
  // Reference to the Features section for smooth scrolling
  const scrollToFeatures = () => {
    // Find the Features section and scroll to it
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["SKD", "Tes Kepribadian", "Tes Logika", "Tes Kompetensi"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Persiapan CPNS 2025 sudah dimulai! <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-indigo-500">Lebih siap</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Persiapan CPNS 2025 sudah dimulai! Ikut tes CPNS dengan Ikuttes, ikut bersaing menuju masa depan.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button 
              size="lg" 
              className="gap-4" 
              variant="outline"
              onClick={scrollToFeatures}
            >
              Apa itu Ikuttes? <MoveRight className="w-4 h-4" />
            </Button>
            <Link href="/register" passHref>
              <Button size="lg" className="gap-4" asChild>
                <a>
                  Mulai Latihan Gratis <UserPlus className="w-4 h-4" />
                </a>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
