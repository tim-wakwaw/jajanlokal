"use client"; // Komponen ini menggunakan hooks (useState, useEffect, useRef) dan event listener, jadi harus client component

import React, { useRef, useState, useEffect, ReactNode, MouseEventHandler, UIEvent } from 'react';
import { motion, useInView } from 'motion/react'; // Pastikan motion/react diimpor
import { cn } from '@/lib/utils'; // Import cn jika digunakan

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string; // Pastikan className ada di sini
}

/**
 * Komponen individual dalam list yang memiliki animasi fade-in/scale-in saat masuk viewport.
 */
const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick, className }) => { // Terima className
  const ref = useRef<HTMLDivElement>(null);
  // useInView perlu amount dan once jika ingin efek hanya sekali atau saat sebagian terlihat
  const inView = useInView(ref, { amount: 0.2, once: false }); // amount: 0.2 -> trigger saat 20% terlihat

  return (
    <motion.div
      ref={ref}
      data-index={index} // Untuk seleksi via keyboard/ref
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0, y: 10 }} // Animasi awal sedikit berbeda
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 10 }} // Kembali ke state awal jika keluar view
      transition={{ duration: 0.3, delay: delay + index * 0.05 }} // Tambahkan sedikit delay per index
      // Terapkan className di sini menggunakan cn()
      className={cn("mb-2 cursor-pointer last:mb-0", className)}
    >
      {children}
    </motion.div>
  );
};

// --- Tipe Props dengan Generic ---
interface AnimatedListProps<T = any> { // Gunakan generic type T
  items: T[]; // items bertipe T[]
  renderItem?: (item: T, index: number, isSelected: boolean) => ReactNode; // renderItem menerima T
  onItemSelect?: (item: T, index: number) => void; // onItemSelect menerima T
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemContainerClassName?: string;
  itemClassName?: string; // Class untuk konten di dalam item (jika pakai default render)
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  listHeight?: string;
}
// --- Akhir Tipe Props ---

/**
 * Komponen list generik yang menampilkan item dengan animasi.
 */
// --- ✅ Perbaikan Definisi Komponen dengan Generic ---
const AnimatedList = <T extends unknown>({ // Deklarasikan T di sini
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
}: AnimatedListProps<T>) => { // Gunakan AnimatedListProps<T>
// --- Akhir Perbaikan ---
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false); // State untuk menandai navigasi keyboard
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  /** Mengatur opasitas gradient berdasarkan posisi scroll */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    // Opacity top gradient (muncul saat scroll ke bawah)
    setTopGradientOpacity(Math.min(scrollTop / 30, 1)); // /30 agar lebih cepat muncul
    // Opacity bottom gradient (hilang saat scroll sampai bawah)
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    // Jika scrollHeight <= clientHeight (tidak ada scrollbar), opacity 0
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 30, 1));
  };

  /** Efek untuk menangani navigasi keyboard (ArrowUp, ArrowDown, Enter, Tab) */
  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let preventDefault = false;
      let newIndex = selectedIndex;

      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        preventDefault = true;
        newIndex = Math.min(selectedIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        preventDefault = true;
        newIndex = Math.max(selectedIndex - 1, 0);
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          preventDefault = true;
          onItemSelect?.(items[selectedIndex], selectedIndex); // Tipe T otomatis benar
        }
      }

      if (preventDefault) {
        e.preventDefault();
        setKeyboardNav(true); // Tandai bahwa navigasi keyboard aktif
        setSelectedIndex(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]); // Pastikan items ada di dependency

  /** Efek untuk scroll otomatis ke item yang dipilih via keyboard */
  useEffect(() => {
    // Hanya scroll jika navigasi via keyboard dan ada item terpilih
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    // Cari elemen item berdasarkan data-index
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;

    if (selectedItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = selectedItem.getBoundingClientRect();

      // Hitung posisi relatif item di dalam container scroll
      const relativeItemTop = itemRect.top - containerRect.top;
      const relativeItemBottom = itemRect.bottom - containerRect.top;

      const extraMargin = 10; // Margin tambahan agar tidak terlalu mepet

      // Scroll ke atas jika item di atas viewport + margin
      if (relativeItemTop < extraMargin) {
        container.scrollTo({ top: container.scrollTop + relativeItemTop - extraMargin, behavior: 'smooth' });
      }
      // Scroll ke bawah jika item di bawah viewport - margin
      else if (relativeItemBottom > container.clientHeight - extraMargin) {
        container.scrollTo({
          top: container.scrollTop + (relativeItemBottom - container.clientHeight + extraMargin),
          behavior: 'smooth'
        });
      }
    }
    // Reset flag navigasi keyboard setelah scroll
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]); // Hanya trigger saat selectedIndex atau keyboardNav berubah

  /** Fungsi render default jika renderItem tidak disediakan */
  const defaultRenderItem = (item: T, index: number, isSelected: boolean) => ( // Terima T
    <div className={cn(
        'p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors duration-150',
        isSelected ? 'bg-neutral-200 dark:bg-neutral-700' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50',
        itemClassName
    )}>
      <p className="text-neutral-900 dark:text-neutral-100 m-0">
        {/* Coba tampilkan name jika objek, atau item itu sendiri */}
        {typeof item === 'object' && item !== null && 'name' in item ? String((item as any).name) : String(item)}
      </p>
    </div>
  );

  return (
    // Lebar default dihilangkan, ambil dari className atau parent
    <div className={cn('relative w-full', className)}>
      <div
        ref={listRef}
        // Gunakan prop listHeight untuk tinggi, scrollbar styling disederhanakan
        className={cn(
            'overflow-y-auto p-4',
            listHeight, // Terapkan tinggi dari prop
            displayScrollbar
            ? 'scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200 dark:scrollbar-thumb-neutral-600 dark:scrollbar-track-neutral-800'
            : 'scrollbar-hide'
        )}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            // delay={0.05} // Delay diatur di transition AnimatedItem
            index={index}
            onMouseEnter={() => setSelectedIndex(index)} // Tetap update highlight on hover
            onClick={() => {
              setSelectedIndex(index); // Update highlight on click
              onItemSelect?.(item, index); // Tipe T otomatis benar
            }}
            className={itemContainerClassName} // Terapkan class untuk container item
          >
            {/* Gunakan renderItem jika ada, jika tidak pakai defaultRenderItem */}
            {renderItem
              ? renderItem(item, index, selectedIndex === index) // renderItem menerima T
              : defaultRenderItem(item, index, selectedIndex === index)
            }
          </AnimatedItem>
        ))}
      </div>
      {/* Gradients */}
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-card to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-card to-transparent pointer-events-none transition-opacity duration-300 ease" // h-[50px] juga untuk bottom
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;

