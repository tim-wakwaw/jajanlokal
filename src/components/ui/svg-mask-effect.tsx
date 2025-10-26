"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const updateMousePosition = (e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", updateMousePosition);
      return () => {
        container.removeEventListener("mousemove", updateMousePosition);
      };
    }
  }, []);
  const maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative h-screen", className)}
      animate={{
        backgroundColor: isHovered ? "var(--slate-900)" : "var(--white)",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center bg-black text-white dark:bg-white dark:text-black"
        style={{
          maskImage: `url(/mask.svg)`,
          maskRepeat: "no-repeat",
          maskSize: `${maskSize}px`,
          maskPosition: `${mousePosition.x}px ${mousePosition.y}px`,
        }}
      >
        <div className="absolute inset-0 z-0 h-full w-full bg-black opacity-50 dark:bg-white" />
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center text-4xl font-bold text-white dark:text-black md:text-5xl lg:text-7xl">
          {children}
        </div>
      </motion.div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {revealText}
      </div>
    </motion.div>
  );
};

export function SVGMaskEffectDemo() {
  return (
    <div className="flex h-160 w-full items-center justify-center overflow-hidden">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-4xl text-center text-4xl font-bold text-slate-800 dark:text-white">
            The first rule of MRR Club is you do not talk about MRR Club. The
            second rule of MRR Club is you DO NOT talk about MRR Club.
          </p>
        }
        className="h-160 rounded-md border text-white dark:text-black"
      >
        Discover the power of{" "}
        <span className="text-blue-500">Tailwind CSS v4</span> with native CSS
        variables and container queries with
        <span className="text-blue-500">advanced animations</span>.
      </MaskContainer>
    </div>
  );
}
