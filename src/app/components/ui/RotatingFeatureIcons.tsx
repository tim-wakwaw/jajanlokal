"use client";

import { useRef, useEffect } from 'react';
import Link from 'next/link';
// Impor 'useInView'
import { motion, useMotionValue, useTransform, useSpring, type MotionValue, animate, type AnimationPlaybackControls, useInView } from 'framer-motion';
import { MapPin, ShoppingCart, Store, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { LottieAnimation } from './LottieAnimation'; 

const MotionLink = motion(Link);

const lottieUrl = "https://lottie.host/8bb39eb6-7e0f-4e7c-a831-834edd106d8b/VPJ19oI7yJ.lottie";

const features = [
  { icon: <MapPin className="h-6 w-6 text-blue-500" />, angle: 0, href: "/peta-umkm" },
  { icon: <ShoppingCart className="h-6 w-6 text-pink-500" />, angle: 60, href: "/produk" },
  { icon: <Store className="h-6 w-6 text-green-500" />, angle: 120, href: "/produk" },
  { icon: <ShieldCheck className="h-6 w-6 text-yellow-500" />, angle: 180, href: "/checkout" },
  { icon: <MessageSquare className="h-6 w-6 text-purple-500" />, angle: 240, href: "/faq" },
  { icon: <Heart className="h-6 w-6 text-red-500" />, angle: 300, href: "/orders" },
];

export const RotatingFeatureIcons = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const rotate = useMotionValue(0);

  const springRotate = useSpring(rotate, {
    stiffness: 100,
    damping: 30,    
    mass: 1.5,      
  });

  const dragX = useMotionValue(0);
  const dragRotateTransform = useTransform(dragX, [-200, 200], [-90, 90]);
  const prevDragRotate = useRef(0);
  const animationControls = useRef<AnimationPlaybackControls| null>(null);
  const isInView = useInView(constraintsRef, { margin: "0px 0px -50% 0px" });

  const manageAnimation = (action: 'start' | 'play' | 'pause') => {
    if (action === 'start') {
      animationControls.current?.stop();
      animationControls.current = animate(rotate, rotate.get() + 360, {
        duration: 60,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop" 
      });
      if (!isInView) {
        animationControls.current.pause();
      }
    } else if (action === 'play') {
      animationControls.current?.play();
    } else if (action === 'pause') {
      animationControls.current?.pause();
    }
  };

  useEffect(() => {
    manageAnimation('start');
    
    const stopDragListener = dragRotateTransform.on("change", (latest) => {
      const delta = latest - prevDragRotate.current;
      prevDragRotate.current = latest;
      rotate.set(rotate.get() + delta);
    });

    return () => {
      stopDragListener();
      animationControls.current?.stop();
    }
  }, []); 

  useEffect(() => {
    if (isInView) {
      manageAnimation('play');
    } else {
      manageAnimation('pause');
    }
  }, [isInView]);

  return (
    <motion.div ref={constraintsRef} className="relative w-full h-full min-h-[400px] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        drag="x"
        dragElastic={1.5} 
        dragConstraints={constraintsRef}
        style={{ x: dragX }}
        onDragStart={() => {
          manageAnimation('pause'); 
          prevDragRotate.current = 0;
        }}
        onDragEnd={() => {
          if (isInView) { 
            manageAnimation('play'); 
          }
          prevDragRotate.current = 0;
        }}
      />

      <div className="relative w-full max-w-sm pointer-events-none lg:-translate-x-2">
        <LottieAnimation
          src={lottieUrl}
          className="w-full h-auto"
        />
      </div>
      <motion.div
        className="absolute w-full h-full z-10"
        style={{ rotate: springRotate }}
      >
        {features.map((feature, i) => (
           <FeatureIcon 
            key={i} 
            feature={feature} 
            containerRotate={springRotate} 
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

const FeatureIcon = ({ 
  feature, 
  containerRotate
}: { 
  feature: (typeof features)[0], 
  containerRotate: MotionValue<number>
}) => {
  
  const radius = "300px";
  
  const iconTransform = useTransform(
    containerRotate,
    (latestRotate: number) => { 
      return `rotate(${feature.angle}deg) translateY(${radius}) rotate(-${feature.angle}deg) rotate(${-latestRotate}deg)`;
  }
  );

  return (
    <MotionLink
      href={feature.href}
      className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-600 p-3 shadow-lg backdrop-blur-md border border-gray-200/50 dark:bg-white/80 dark:border-transparent"
      style={{
        transform: iconTransform,
      }}
    >
      {feature.icon}
    </MotionLink>
 );
};