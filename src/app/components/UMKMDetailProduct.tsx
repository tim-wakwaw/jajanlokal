"use client";

import React from 'react';
import { UMKM } from './UMKMDetailCard'; 
import LazyImage from './LazyImage'; 
import { IconShoppingCartPlus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface Props {
  umkm: UMKM;
}

const UMKMDetailProduct: React.FC<Props> = ({ umkm }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Produk Unggulan ({umkm.products.length})
      </h4>
      
      {/* Container untuk list vertikal */}
      <div className="flex flex-col gap-3">
        {umkm.products && umkm.products.length > 0 ? (
          umkm.products.map((product, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Gambar Produk */}
              <LazyImage
                src={product.image || 'https://picsum.photos/seed/product/300/200'}
                alt={product.name}
                className="w-16 h-16 rounded-md object-cover shrink-0 bg-muted-foreground/10"
                eager 
              />
              
              {/* Info Produk */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" title={product.name}>
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Tombol Add to Cart */}
              <button
                className={cn(
                  "p-2 rounded-md",
                  "bg-primary text-primary-foreground",
                  "transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                aria-label={`Tambah ${product.name} ke keranjang`}
              >
                <IconShoppingCartPlus className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-24 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              UMKM ini belum memiliki produk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UMKMDetailProduct;