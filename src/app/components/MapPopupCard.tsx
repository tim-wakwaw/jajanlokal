"use client";

import React from 'react';
import { BackgroundGradient } from './ui/background-gradient';
import { cn } from '@/lib/utils';
import { Star, MapPin } from 'lucide-react';

/**
 * Tipe data yang diperlukan untuk popup card.
 * Disesuaikan dari struktur umkmData.json
 */
interface PopupData {
  id: number;
  name: string;
  image?: string;
  alamat: string;
  category: string;
  rating: number;
}

interface MapPopupCardProps {
  /** Objek data UMKM yang akan ditampilkan di popup */
  data: PopupData;
  className?: string;
}

/**
 * Komponen Card kustom untuk ditampilkan di dalam popup Leaflet.
 * Menggunakan BackgroundGradient untuk efek visual.
 */
export const MapPopupCard: React.FC<MapPopupCardProps> = ({ data, className }) => {
  
  const imageUrl = data.image || '/assets/icons/pin.png';

  return (
    <BackgroundGradient
      containerClassName={cn("rounded-xl p-1 w-80", className)}
      className="rounded-xl bg-card text-card-foreground p-4"
      animate={true}
    >
      <div className="flex gap-4 items-start">
        
        <div
          className="w-20 h-20 rounded-md shrink-0 bg-muted bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
          role="img"
          aria-label={data.name}
        />
        
        <div className="flex flex-col min-w-0">
          
          <span 
            className="text-xs font-medium text-muted-foreground mb-1 px-2 py-0.5 bg-muted rounded-full self-start"
          >
            {data.category}
          </span>
          
          <h3 
            className="text-base font-semibold text-foreground truncate" 
            title={data.name}
          >
            {data.name}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-foreground/90 mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{data.rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{data.alamat}</span>
          </div>

          <button 
            data-umkmid={data.id}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 self-start"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </BackgroundGradient>
  );
};

export default MapPopupCard;