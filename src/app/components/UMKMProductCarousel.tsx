"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import UMKMProductCard  from './UMKMProductCard'; 

interface Product {
  name: string;
  price: number;
  image?: string;
}

interface UMKMProductCarouselProps {
  products: Product[];
  className?: string;
}

/**
 * Komponen carousel horizontal yang menampilkan daftar UMKMProductCard.
 * Dirancang untuk digunakan di dalam modal detail UMKM.
 */
export const UMKMProductCarousel: React.FC<UMKMProductCarouselProps> = ({ products, className }) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          UMKM ini belum memiliki produk.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Container Scrollable */}
      <div
        className={cn(
          "flex w-full gap-3 overflow-x-auto p-1 pb-2", 
          "scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
        )}
      >
        {/* Loop/map semua produk */}
        {products.map((product, index) => (
          <div 
            key={index} 
            className="w-44 shrink-0" 
          >
            <UMKMProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UMKMProductCarousel;