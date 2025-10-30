"use client";

import React from "react";

interface TestimonialCardProps {
  user: string;
  text: string;
  umkmName: string;
  umkmCategory: string;
  rating: number;
}

export default function TestimonialCard({ 
  user, 
  text, 
  umkmName, 
  umkmCategory, 
  rating 
}: TestimonialCardProps) {
  const generateAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {/* Half Star */}
        {hasHalfStar && (
          <div key="half" className="relative w-3 h-3">
            <svg className="w-3 h-3 text-gray-300 fill-current absolute" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg className="w-3 h-3 text-yellow-400 fill-current absolute overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
        
        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-3 h-3 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[380px] h-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0 min-h-[72px]">
        <div className="flex gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-full border-2 border-blue-500 bg-cover bg-center bg-no-repeat shrink-0"
            style={{ backgroundImage: `url(${generateAvatar(user)})` }}
            aria-label={`${user} avatar`}
          />
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {user}
            </h4>
            <h5 className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Pelanggan {umkmName}
            </h5>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
            {renderStars(rating)}
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm line-clamp-4">
          &ldquo;{text}&rdquo;
        </p>
        <div className="pt-3 text-xs text-gray-500 dark:text-gray-400">
          #{umkmCategory} #{umkmName.replace(/\s+/g, '')}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 flex gap-3 text-xs text-gray-500 dark:text-gray-400 shrink-0">
        <div className="flex gap-1">
          <p className="font-semibold truncate">
            {umkmName}
          </p>
        </div>
        <div className="flex gap-1">
          <p>
            {umkmCategory}
          </p>
        </div>
      </div>
    </div>
  );
}