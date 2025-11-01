"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import LazyImage from './LazyImage'; 
import { IconShoppingCartPlus } from '@tabler/icons-react';

// Tipe data produk 
interface Product {
  name: string;
  price: number;
  image?: string;
}

interface UMKMProductCardProps {
  /** Objek data produk yang akan ditampilkan */
  product: Product;
  className?: string;
}

/**
 * Kartu individual untuk menampilkan satu produk di dalam carousel.
 * Menampilkan gambar, nama, harga, dan tombol "Add to Cart".
 */
export const UMKMProductCard: React.FC<UMKMProductCardProps> = ({ product, className }) => {

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  return (
    <div
      className={cn(
        "relative w-full h-full bg-card border border-border rounded-lg overflow-hidden shadow-sm",
        "flex flex-col",
        className
      )}
    >
      {/* Bagian Gambar Produk */}
      <div className="relative w-full h-32 bg-muted shrink-0">
        <LazyImage
          // Gunakan gambar produk atau gambar placeholder jika tidak ada
          src={product.image || 'https://picsum.photos/seed/product/300/200'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bagian Info Produk */}
      <div className="p-3 flex flex-col flex-1">
        
        {/* Nama Produk (dibatasi 2 baris) */}
        <h4 
          className="text-sm font-semibold text-foreground line-clamp-2 leading-tight h-10" // Beri tinggi tetap
          title={product.name}
        >
          {product.name}
        </h4>
        
        {/* Harga Produk */}
        <p className="text-sm font-medium text-primary mt-1">
          {formattedPrice}
        </p>

        {/* Tombol (didorong ke bawah) */}
        <div className="mt-auto pt-2">
          <button
            onClick={handleAddToCart}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md",
              "bg-primary text-primary-foreground text-xs font-medium",
              "transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <IconShoppingCartPlus className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMKMProductCard;