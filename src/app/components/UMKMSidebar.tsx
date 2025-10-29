"use client";

import React from "react";
import AnimatedList from "./ui/AnimatedList"; // Import AnimatedList
import { cn } from "@/lib/utils";

// Tipe Data UMKM
interface Product { name: string; price: number;}
interface Comment { user: string; text: string;}
interface UMKM { id: number; name: string; alamat: string; category: string; lat: number; lng: number; description: string; rating: number; comments: Comment[]; products: Product[]; }


interface UMKMSidebarProps {
  items: UMKM[];
  onItemClick: (item: UMKM) => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * Komponen Sidebar yang menampilkan daftar UMKM menggunakan AnimatedList.
 */
const UMKMSidebar: React.FC<UMKMSidebarProps> = ({
  items,
  onItemClick,
  className,
  isLoading = false,
}) => {

  /**
   * Fungsi untuk merender setiap item UMKM di dalam AnimatedList.
   */
  const renderUMKMItem = (item: UMKM, index: number, isSelected: boolean) => {
    return (
      // ✅ Tambahkan lebih banyak padding vertikal (py-6) di sini
      <div
        className={cn(
          'px-4 py-8 border rounded-lg transition-colors duration-150', // Ubah py-4 menjadi py-6
          isSelected
            ? 'bg-muted border-primary/50'
            : 'bg-card border-border hover:bg-muted/50'
        )}
      >
        <strong className="text-sm font-medium text-foreground line-clamp-1">{item.name}</strong> {/* Opsi: line-clamp-1 jika nama panjang */}
        <div className="text-xs text-muted-foreground mt-1"> {/* Tambah mt-1 */}
          {item.category} • ⭐{item.rating}
        </div>
      </div>
    );
  };

  return (
    // Container utama sidebar
    <div className={cn("h-full w-full flex flex-col", className)}>
      {/* Judul Sidebar */}
      <h2 className="text-lg font-semibold mb-3 px-4 pt-4 shrink-0">UMKM Sekitar</h2>

      {/* Wrapper list */}
      <div className="flex-1 overflow-hidden relative px-4">
        {isLoading ? (
           <div className="p-4 text-center text-muted-foreground">Memuat data...</div>
        ) : items.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Tidak ada UMKM ditemukan.</div>
        ): (
          <AnimatedList<UMKM>
            items={items}
            renderItem={renderUMKMItem}
            onItemSelect={(item, index) => onItemClick(item)}
            className="h-full absolute inset-x-0 top-0 bottom-0"
            listHeight="h-full"
            displayScrollbar={true}
            enableArrowNavigation={true}
            showGradients={true}
            // itemContainerClassName diatur paddingnya oleh wrapper (px-4)
          />
        )}
      </div>
    </div>
  );
};

export default UMKMSidebar;

