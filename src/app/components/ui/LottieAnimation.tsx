"use client";

// Impor dari library resmi @lottiefiles
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

interface LottieAnimationProps {
  // 'src' adalah path ke file .json atau URL .lottie
  src: string; 
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieAnimation = ({ 
  src, 
  className, 
  loop = true, 
  autoplay = true 
}: LottieAnimationProps) => {
  
  return (
    // Kita bungkus dengan div agar bisa menerima className
    <div className={cn(className)}>
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
      />
    </div>
  );
};