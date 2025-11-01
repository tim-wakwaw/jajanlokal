"use client";

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import LazyImage from './LazyImage'; 
import { useOutsideClick } from '@/hooks/useOutsideClick'; 
import { IconX, IconMapPin } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// --- Definisi Tipe Data ---

interface Product { name: string; price: number;}
interface Comment { user: string; text: string;}

/**
 * Tipe data utama untuk objek UMKM.
 * Sesuai dengan struktur di `umkmData.json`.
 */
interface UMKM {
  id: number;
  name: string;
  image?: string; 
  alamat: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  comments: Comment[]; 
  products: Product[];
}

/** Properti untuk komponen UMKMCard */
interface UMKMCardProps {
  /** Objek data UMKM lengkap yang akan ditampilkan. */
  umkm: UMKM;
  onClose: () => void;
  className?: string;
}

/**
 * Komponen 3D Card yang berfungsi sebagai modal popup untuk menampilkan
 * detail ringkas dari satu UMKM.
 *
 * @param {UMKMCardProps} props - Properti untuk komponen.
 * @returns {React.ReactNode} Modal 3D Card.
 */
export const UMKMCard: React.FC<UMKMCardProps> = ({ umkm, onClose, className }) => {
  // Ref untuk elemen wrapper terluar dari modal (motion.div)
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  // Hook untuk mendeteksi klik di luar area cardWrapperRef untuk menutup modal
  useOutsideClick(cardWrapperRef, onClose);

  const handleDetailClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    alert(`Membuka halaman detail untuk: ${umkm.name}`);
  };

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4">
      
      {/* Wrapper untuk animasi dan ref outsideClick */}
      <motion.div
        ref={cardWrapperRef} 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Container 3D Card */}
        <CardContainer
          containerClassName={cn(
            "w-full max-w-md max-h-[85vh] py-0", 
            className
          )}
          className="bg-card border rounded-xl shadow-lg" 
        >
          {/* Body Kartu */}
          <CardBody className="relative p-6 w-full h-full flex flex-col max-h-[85vh]!"> 
            
            {/* Tombol Close */}
            <CardItem
              translateZ={60}
              className="absolute top-4 right-4 z-20"
            >
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Tutup detail"
              >
                <IconX className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardItem>

            {/* Gambar UMKM  */}
            {umkm.image && (
              <CardItem
                translateZ={40}
                className="w-full mt-2" 
              >
                <LazyImage
                  src={umkm.image}
                  alt={umkm.name}
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                />
              </CardItem>
            )}

            {/* Judul dan Rating */}
            <CardItem
              translateZ={50}
              className={cn("mt-4 w-full", !umkm.image && "mt-8")} 
            >
              <h3 className="text-xl font-bold text-foreground line-clamp-1">{umkm.name}</h3>
              <p className="text-sm text-muted-foreground">
                {umkm.category} • ⭐ {umkm.rating}
              </p>
            </CardItem>

            {/* Tampilan Alamat */}
            <CardItem
              translateZ={40}
              className="w-full mt-2 flex items-start gap-1.5"
            >
              <IconMapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground line-clamp-2">
                {umkm.alamat}
              </p>
            </CardItem>

            {/* Konten Scrollable (Deskripsi, Produk) */}
            <CardItem
              translateZ={30}
              className="mt-3 w-full flex-1 overflow-y-auto min-h-0 max-h-[40vh] pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
            >
              {/* Deskripsi */}
              <p className="text-sm text-foreground/80 mb-3">{umkm.description}</p>

              {/* Produk */}
              {umkm.products && umkm.products.length > 0 && (
                <div className="mb-3">
                  <strong className="text-sm font-medium text-foreground">Produk:</strong>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 text-muted-foreground">
                    {umkm.products.map((p, i) => (
                      <li key={i}>{p.name} - Rp{p.price.toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardItem>

            {/* Tombol Aksi (Lihat Detail) */}
            <CardItem
              translateZ={20}
              className="w-full flex justify-end mt-4" // Beri jarak atas dari area scroll
            >
              <button
                onClick={handleDetailClick}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold transition-colors hover:bg-primary/90"
              >
                Lihat Detail
              </button>
            </CardItem>

          </CardBody>
        </CardContainer>
      </motion.div>
    </div>
  );
};

export default UMKMCard;