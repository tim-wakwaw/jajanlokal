"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface MagicBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tombol "Border Magic"
 * Menggunakan trik background-gradient dan animasi shimmer
 * untuk menciptakan efek border yang bergerak.
 */
const MagicBorderButton = React.forwardRef<HTMLButtonElement, MagicBorderButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex h-10 overflow-hidden rounded-full p-[1.5px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
          className
        )}
        {...props}
      >
        {/* Latar belakang shimmer yang dianimasikan */}
        <span
          className="animate-shimmer absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(to right, #4f46e5, #c026d3, #d946ef, #4f46e5)",
            backgroundSize: "200% 200%",
          }}
        />
        
        {/* Konten Tombol (bagian dalam) */}
        <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-card px-4 py-2 text-xs font-medium text-card-foreground backdrop-blur-3xl">
          {children}
        </span>
      </button>
    );
  }
);

MagicBorderButton.displayName = "MagicBorderButton";

export default MagicBorderButton;
