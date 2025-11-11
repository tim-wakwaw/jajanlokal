"use client";

import Link from "next/link";
import { ArrowRight, MapPin, UserPlus } from "lucide-react";
import Aurora from "@/components/Aurora";
import SplitText from "./ui/SplitText";
import ShinyText from "./ui/ShinyText";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { RotatingFeatureIcons } from "./ui/RotatingFeatureIcons";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

export default function HeroSection() {
  const { resolvedTheme } = useTheme();
  const [currentColors, setCurrentColors] = useState(['#a855f7', '#3b82f6', '#ec4899']);
  const [isMounted, setIsMounted] = useState(false);

  const lightModeColors = ['#60A5FA', '#34D399', '#FDE68A'];
  const darkModeColors = ['#172554', '#3b82f6', '#9333ea'];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setCurrentColors(resolvedTheme === 'dark' ? darkModeColors : lightModeColors);
    }
  }, [isMounted, resolvedTheme]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-gray-900 px-4 py-24 transition-colors duration-300">
      <Aurora
        className="absolute inset-0 z-0 opacity-60 dark:opacity-40"
        colorStops={currentColors}
        amplitude={0.8}
        blend={0.7}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-y-20 lg:gap-x-24 gap-x-32">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="relative z-20 w-full flex flex-col items-start text-left"
          >
            <SplitText
              text="Temukan Kekayaan Lokal"
              tag="h1"
              className="text-5xl md:text-7xl font-bold mb-6 text-gray-700 dark:text-white"
              splitType="chars"
              delay={50}
              duration={0.6}
              from={{ opacity: 0, y: 30, scale: 0.8 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              ease="power3.out"
              textAlign="left"
            />

            <ShinyText
              text="Jelajahi, cintai, dan dukung ribuan produk UMKM terbaik langsung dari genggaman Anda."
              className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300"
              speed={4}
            />

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4">
              <Link
                href="/produk"
                className="flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-gray-700 hover:shadow-xl transform hover:-translate-y-0.5 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Mulai Belanja
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/peta-umkm"
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-900 backdrop-blur-sm transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:hover:bg-gray-800"
              >
                Lihat UMKM Terdekat
                <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="w-full relative flex items-center justify-center"
          >
            <RotatingFeatureIcons />
          </motion.div>
        </div>
      </div>
    </div>
  );
}