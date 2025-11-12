"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const cardLength = content.length;
  const darkBackgrounds = ["#0f172a", "#0a0a0a", "#171717"];
  const lightBackgrounds = ["#ffffff", "#f8fafc", "#f1f5f9"];

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.floor(latest * cardLength);
    setActiveCard(index >= cardLength ? cardLength - 1 : index);
  });

  const linearGradients = [
    "linear-gradient(to bottom right, #06b6d4, #10b981)", 
    "linear-gradient(to bottom right, #ec4899, #6366f1)",
    "linear-gradient(to bottom right, #f97316, #eab308)",
    "linear-gradient(to bottom right, #10b981, #3b82f6)",
  ];

  const { theme } = useTheme();
  const [backgroundColors, setBackgroundColors] = useState(darkBackgrounds);
  const [backgroundGradient, setBackgroundGradient] = useState(linearGradients[0]);

  useEffect(() => {
    setBackgroundColors(theme === "dark" ? darkBackgrounds : lightBackgrounds);
  }, [theme]);

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <div ref={ref} className="relative h-[400vh] w-full">
      <motion.div
        animate={{
          backgroundColor: backgroundColors[activeCard % backgroundColors.length],
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-6 md:px-20"
      >
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="sticky top-32 h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={content[activeCard].title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
                  {content[activeCard].title}
                </h2>
                <p className="mt-4 text-base text-neutral-600 dark:text-gray-300 md:text-lg">
                  {content[activeCard].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            style={{ background: backgroundGradient }}
            className={cn(
              "flex h-[300px] w-full items-center justify-center rounded-2xl shadow-lg md:h-[400px]",
              contentClassName,
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex h-full w-full items-center justify-center"
              >
                {content[activeCard].content}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
