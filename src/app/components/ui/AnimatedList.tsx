"use client"; 
import React, { useRef, useState, useEffect, ReactNode, MouseEventHandler, UIEvent } from 'react';
import { motion, useInView } from 'motion/react'; 
import { cn } from '@/lib/utils'; 

/**
 * Props untuk komponen AnimatedItem.
 */
interface AnimatedItemProps {
  /** Konten yang akan dirender di dalam item. */
  children: ReactNode;
  /** Delay animasi (ms) sebelum item mulai muncul (ditambahkan ke delay index). */
  delay?: number;
  /** Index item dalam list, digunakan untuk data-attribute dan kalkulasi delay. */
  index: number;
  /** Callback saat mouse memasuki area item. */
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  /** Callback saat item diklik. */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Class CSS tambahan untuk elemen motion.div container. */
  className?: string;
}

/**
 * Komponen individual dalam list yang memiliki animasi fade-in/scale-in saat masuk viewport.
 */
const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick, className }) => {
  /** Ref untuk elemen div item. */
  const ref = useRef<HTMLDivElement>(null);
  /** Hook untuk mendeteksi apakah elemen terlihat di viewport. */
  // Animasi akan terpicu ketika 20% bagian item terlihat.
  const inView = useInView(ref, { amount: 0.2, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index} // Untuk seleksi via keyboard/ref
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0, y: 10 }} // State awal animasi (sebelum terlihat)
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 10 }} // State akhir animasi (saat terlihat) / kembali ke awal jika keluar
      transition={{ duration: 0.3, delay: delay + index * 0.05 }} // Durasi dan delay animasi per item
      className={cn("mb-2 cursor-pointer last:mb-0", className)} // Styling dasar + className tambahan
    >
      {children}
    </motion.div>
  );
};

/**
 * Props untuk komponen AnimatedList. Menggunakan generic type T untuk tipe data item.
 * @template T Tipe data untuk setiap item dalam list. Defaultnya adalah `any`.
 */
interface AnimatedListProps<T = any> {
  /** Array berisi data item yang akan ditampilkan. */
  items: T[];
  /** Fungsi kustom untuk merender tampilan setiap item. Menerima data item, index, dan status isSelected. */
  renderItem?: (item: T, index: number, isSelected: boolean) => ReactNode;
  /** Callback function yang dipanggil saat item dipilih (via klik atau Enter). Menerima data item dan index. */
  onItemSelect?: (item: T, index: number) => void;
  /** Menampilkan/menyembunyikan efek gradient di atas dan bawah list. Default: true. */
  showGradients?: boolean;
  /** Mengaktifkan/menonaktifkan navigasi list menggunakan keyboard (ArrowUp, ArrowDown, Tab, Enter). Default: true. */
  enableArrowNavigation?: boolean;
  /** Class CSS tambahan untuk container utama AnimatedList. */
  className?: string;
  /** Class CSS tambahan untuk setiap container item (elemen AnimatedItem). */
  itemContainerClassName?: string;
  /** Class CSS tambahan untuk konten *di dalam* setiap item (jika menggunakan render default). */
  itemClassName?: string;
  /** Menampilkan/menyembunyikan scrollbar. Default: true. */
  displayScrollbar?: boolean;
  /** Index item yang dipilih secara awal. Default: -1 (tidak ada). */
  initialSelectedIndex?: number;
  /** Class CSS untuk mengatur tinggi list (e.g., 'h-[500px]', 'max-h-screen'). Default: 'max-h-[400px]'. */
  listHeight?: string;
}

/**
 * Komponen list generik yang menampilkan item dengan animasi masuk saat scroll,
 * mendukung navigasi keyboard, highlight item terpilih, dan efek gradient pada batas scroll.
 * @template T Tipe data untuk setiap item dalam list.
 */
const AnimatedList = <T extends unknown>({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemContainerClassName = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  listHeight = 'max-h-[400px]'
}: AnimatedListProps<T>) => {
  /** Ref untuk elemen div yang scrollable. */
  const listRef = useRef<HTMLDivElement>(null);
  /** State untuk menyimpan index item yang sedang dipilih/di-highlight. */
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  /** State flag untuk menandai bahwa perubahan selectedIndex berasal dari navigasi keyboard. */
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  /** State untuk mengatur opacity gradient atas. */
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  /** State untuk mengatur opacity gradient bawah. */
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  /**
   * Handler untuk event scroll pada list. Mengatur opacity gradient atas dan bawah.
   * @param e Event scroll UI.
   */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 30, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 30, 1));
  };

  /**
   * Efek untuk menambahkan dan membersihkan event listener keyboard (keydown)
   * untuk navigasi list (ArrowUp, ArrowDown, Tab, Enter).
   */
  useEffect(() => {
    if (!enableArrowNavigation) return;

    /** Handler untuk event keydown. */
    const handleKeyDown = (e: KeyboardEvent) => {
      let preventDefault = false;
      let newIndex = selectedIndex;

      // Logika perpindahan index berdasarkan tombol yang ditekan
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        preventDefault = true;
        newIndex = Math.min(selectedIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        preventDefault = true;
        newIndex = Math.max(selectedIndex - 1, 0);
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          preventDefault = true;
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }

      // Jika tombol navigasi relevan ditekan
      if (preventDefault) {
        e.preventDefault(); 
        setKeyboardNav(true); 
        setSelectedIndex(newIndex); 
      }
    };

    // Tambahkan listener
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]); // Dependensi

  /**
   * Efek untuk melakukan auto-scroll agar item yang dipilih via keyboard
   * selalu terlihat di dalam area scrollable.
   */
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;

    if (selectedItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = selectedItem.getBoundingClientRect();
      const relativeItemTop = itemRect.top - containerRect.top;
      const relativeItemBottom = itemRect.bottom - containerRect.top;
      const extraMargin = 10; 

      if (relativeItemTop < extraMargin) {
        container.scrollTo({ top: container.scrollTop + relativeItemTop - extraMargin, behavior: 'smooth' });
      }
      else if (relativeItemBottom > container.clientHeight - extraMargin) {
        container.scrollTo({
          top: container.scrollTop + (relativeItemBottom - container.clientHeight + extraMargin),
          behavior: 'smooth'
        });
      }
    }
    // Reset flag navigasi keyboard setelah scroll selesai
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]); 

  /**
   * Fungsi render default untuk item jika prop `renderItem` tidak disediakan.
   * Mencoba menampilkan properti 'name' jika item adalah objek, atau item itu sendiri.
   * @param item Data item.
   * @param index Index item.
   * @param isSelected Status apakah item sedang dipilih.
   * @returns Element React untuk item.
   */
  const defaultRenderItem = (item: T, index: number, isSelected: boolean) => (
    <div className={cn(
        'p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors duration-150',
        isSelected ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50',
        itemClassName
    )}>
      <p className="text-neutral-900 dark:text-neutral-100 m-0">
        {/* Coba render property 'name' jika ada, atau item sebagai string */}
        {typeof item === 'object' && item !== null && 'name' in item ? String((item as any).name) : String(item)}
      </p>
    </div>
  );

  return (
    <div className={cn('relative w-full', className)}>
      {/* Container scrollable */}
      <div
        ref={listRef}
        className={cn(
            'overflow-y-auto p-4', 
            listHeight, 
            displayScrollbar
            ? 'scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200 dark:scrollbar-thumb-neutral-600 dark:scrollbar-track-neutral-800'
            : 'scrollbar-hide'
        )}
        onScroll={handleScroll} // Handler scroll untuk gradient
      >
        {/* Mapping data items ke komponen AnimatedItem */}
        {items.map((item, index) => (
          <AnimatedItem
            key={index} 
            index={index}
            onMouseEnter={() => setSelectedIndex(index)} 
            onClick={() => {
              setSelectedIndex(index); 
              onItemSelect?.(item, index); 
            }}
            className={itemContainerClassName} 
          >
            {/* Render item menggunakan fungsi renderItem atau defaultRenderItem */}
            {renderItem
              ? renderItem(item, index, selectedIndex === index)
              : defaultRenderItem(item, index, selectedIndex === index)
            }
          </AnimatedItem>
        ))}
      </div>
      {/* Efek Gradient Atas & Bawah */}
      {showGradients && (
        <>
          {/* Gradient Atas */}
          <div
            className="absolute top-0 left-0 right-0 h-[50px] bg-linear-to-b from-card to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          ></div>
          {/* Gradient Bawah */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[50px] bg-linear-to-t from-card to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;

