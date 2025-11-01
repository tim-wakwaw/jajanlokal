"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { FloatingDock } from "../components/ui/floating-dock";
import {
  IconSearch,
  IconList,
  IconFilter,
  IconCurrentLocation,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import UMKMSidebar from "../components/UMKMSidebar";
import UMKMCard from "../components/UMKMCard"; 
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ReactDOMServer from 'react-dom/server';
import MapPopupCard from '../components/MapPopupCard';

// --- Tipe Data ---

/**
 * @typedef {object} Product
 * @property {string} name - Nama produk.
 * @property {number} price - Harga produk.
 */

interface Product { name: string; price: number;}

/**
 * @typedef {object} Comment
 * @property {string} user - Nama pengguna yang berkomentar.
 * @property {string} text - Isi komentar.
 */
interface Comment { user: string; text: string;}

/**
 * @typedef {object} UMKM
 * @property {number} id - ID unik UMKM.
 * @property {string} name - Nama UMKM.
 * @property {string} [image] - URL gambar UMKM.
 * @property {string} alamat - Alamat UMKM.
 * @property {string} category - Kategori UMKM.
 * @property {number} lat - Latitude lokasi UMKM.
 * @property {number} lng - Longitude lokasi UMKM.
 * @property {string} description - Deskripsi singkat UMKM.
 * @property {number} rating - Rating UMKM.
 * @property {Comment[]} comments - Daftar komentar tentang UMKM.
 * @property {Product[]} products - Daftar produk yang dijual UMKM.
 */
interface UMKM { id: number; name: string; image?: string; alamat: string; category: string; lat: number; lng: number; description: string; rating: number; comments: Comment[]; products: Product[]; }

// --- Tipe Leaflet & React-Leaflet ---
import type { Icon as LeafletIcon, Map as LeafletMap, LayerGroup } from 'leaflet';

/**
 * Komponen halaman untuk menampilkan peta interaktif UMKM dengan ikon per kategori,
 * sidebar list, floating dock, search, filter, dan popup detail.
 */
export default function PetaUMKM() {
  /** Referensi ke instance map Leaflet. */
  const mapRef = useRef<LeafletMap | null>(null);
  /** Referensi ke objek yang menyimpan instance ikon Leaflet per kategori. */
  const categoryIconsRef = useRef<{ [key: string]: LeafletIcon }>({});
  /** Referensi ke instance ikon marker lokasi pengguna (animasi). */
  const userIconRef = useRef<LeafletIcon | null>(null);
  /** Referensi ke library Leaflet (L). */
  const LRef = useRef<typeof import("leaflet") | null>(null);
  /** Status map siap (Leaflet library & icons loaded). */
  const [mapReady, setMapReady] = useState(false);
  /** Daftar data UMKM dari JSON. */
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  /** Nilai input pencarian nama UMKM. */
  const [search, setSearch] = useState("");
  /** Kategori UMKM yang dipilih (filter). */
  const [category, setCategory] = useState("Semua");
  /** Data UMKM yang sedang dipilih (untuk popup detail). */
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  /** Status visibilitas sidebar daftar UMKM. */
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  /** Status visibilitas input pencarian floating. */
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  /** Status visibilitas dropdown filter floating. */
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  /** Status komponen sudah di-mount di client-side. */
  const [isClient, setIsClient] = useState(false);
  /** Ref layer group untuk marker UMKM. */
  const markersLayerGroupRef = useRef<LayerGroup | null>(null);
  /** Ref marker lokasi pengguna. */
  const userLocationMarkerRef = useRef<import('leaflet').Marker | null>(null);
  /** Ref lingkaran akurasi lokasi pengguna. */
  const userLocationCircleRef = useRef<import('leaflet').Circle | null>(null);
  /** Status loading data UMKM dari JSON. */
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320); 
  const [isResizing, setIsResizing] = useState(false);
  /** Ref untuk elemen DOM Sidebar. */
  const sidebarRef = useRef<HTMLDivElement>(null!);

  const isDesktop = useMediaQuery("(min-width: 768px)");


  // Dipanggil saat mouse ditekan pada resizer
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Dipanggil saat mouse bergerak (hanya jika isResizing true)
  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !isDesktop) return; // Hanya jalankan jika sedang resizing & di desktop

    // Batas lebar minimum dan maksimum
    const minWidth = 320; // 20rem (w-80)
    const maxWidth = 640; // 40rem (w-[40rem])

    // e.clientX adalah posisi mouse horizontal. Ini akan jadi lebar baru.
    const newWidth = e.clientX;
    
    // Terapkan batasan
    const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    setSidebarWidth(constrainedWidth);

  }, [isResizing, isDesktop]); // Dependensi

  const handleResizeMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Effect untuk menambah/menghapus listener global
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

   /**
   * Efek untuk menandai bahwa komponen sudah berjalan di client-side.
   * Dijalankan sekali setelah initial render.
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Efek untuk menginisialisasi library Leaflet (L) dan membuat instance ikon
   * setelah komponen berjalan di client-side.
   */
  useEffect(() => {
    if (!isClient) return;

    const setupLeaflet = async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      LRef.current = L;

      const iconSize: [number, number] = [35, 35];
      const iconAnchor: [number, number] = [17, 35];
      const popupAnchor: [number, number] = [0, -35];

      const icons: { [key: string]: LeafletIcon } = {
        kuliner: L.icon({ iconUrl: '/assets/icons/pin-kuliner.gif', iconSize, iconAnchor, popupAnchor }),
        fashion: L.icon({ iconUrl: '/assets/icons/pin-fashion.gif', iconSize, iconAnchor, popupAnchor }),
        kerajinan: L.icon({ iconUrl: '/assets/icons/pin-kerajinan.gif', iconSize, iconAnchor, popupAnchor }),
        kesehatan: L.icon({ iconUrl: '/assets/icons/pin-kesehatan.gif', iconSize, iconAnchor, popupAnchor }),
        retail: L.icon({ iconUrl: '/assets/icons/pin-retail.gif', iconSize, iconAnchor, popupAnchor }),

        fallback: L.icon({ iconUrl: '/assets/icons/pin.png', iconSize: [30, 45], iconAnchor: [15, 45], popupAnchor: [0, -45] })
      };
      categoryIconsRef.current = icons;

      userIconRef.current = L.icon({
        iconUrl: "/assets/icons/pin-posisi.gif",
        iconSize: [60, 55],
        iconAnchor: [30, 55],
        popupAnchor: [0, -55],
      });

      setMapReady(true);
    };
    setupLeaflet();
  }, [isClient]);

  /**
   * Efek untuk mengambil data UMKM dari file JSON
   * setelah komponen berjalan di client-side.
   */
  useEffect(() => {
    if (!isClient) return;
    setIsLoadingData(true);
    fetch("/data/umkmData.json")
      .then((res) => res.json())
      .then((data) => {
          setUmkmList(data);
          setIsLoadingData(false);
          
          // Preload images setelah data dimuat
          data.forEach((umkm: UMKM) => {
            if (umkm.image) {
              const img = new Image(); 
              img.src = umkm.image;
            }
          });
        })
      .catch((err) => {
          console.error("Gagal load JSON:", err);
          setIsLoadingData(false);
      });
  }, [isClient]);

  /**
   * Efek untuk menginisialisasi peta Leaflet (HANYA SEKALI).
   * Dijalankan ketika mapReady dan isClient menjadi true.
   */
  useEffect(() => {
    const L = LRef.current;
    if (mapReady && L && !mapRef.current && document.getElementById('map')) {
      console.log("Inisialisasi map...");
      mapRef.current = L.map("map", { center: [-7.955, 112.615], zoom: 15 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 20
      }).addTo(mapRef.current);
       if (!markersLayerGroupRef.current && mapRef.current) {
         markersLayerGroupRef.current = L.layerGroup().addTo(mapRef.current);
       } else {
       }
    } else {
        if (!mapReady) console.log("Map belum siap (mapReady false)");
        if (!L) console.log("Leaflet (L) belum siap");
        if (mapRef.current) console.log("Map ref sudah ada");
        if (!document.getElementById('map')) console.log("Elemen #map tidak ditemukan");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapReady, isClient]);

  /**
   * Efek untuk me-render/update marker UMKM di peta.
   * Dijalankan ketika mapRef, filteredUMKMList, atau isLoadingData berubah.
   */
  useEffect(() => {
    const L = LRef.current;
    const currentMap = mapRef.current;
    const markersLayerGroup = markersLayerGroupRef.current;
    const categoryIcons = categoryIconsRef.current;

    if (!currentMap || !L || !markersLayerGroup || Object.keys(categoryIcons).length === 0 || isLoadingData) {
        if (markersLayerGroup) markersLayerGroup.clearLayers();
        return;
    }
    markersLayerGroup.clearLayers();

    const filtered = umkmList.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "Semua" || u.category === category)
    );

    filtered.forEach((umkm) => {
      const categoryKey = umkm.category.toLowerCase();
      const selectedIcon = categoryIcons[categoryKey] || categoryIcons.fallback;

      if (!selectedIcon) {
          console.warn(`Ikon tidak ditemukan untuk kategori: ${umkm.category}`);
          return;
      }

      const marker = L.marker([umkm.lat, umkm.lng], { icon: selectedIcon });
      const popupComponent = <MapPopupCard data={umkm} />;
      const popupContent = ReactDOMServer.renderToString(popupComponent);

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup' 
      });

      marker.on("popupopen", (e) => {
            const btn = e.popup.getElement()?.querySelector<HTMLButtonElement>(`button[data-umkmid="${umkm.id}"]`);
            if (btn) {
              const newBtn = btn.cloneNode(true) as HTMLButtonElement;
              btn.parentNode?.replaceChild(newBtn, btn);
              
              newBtn.onclick = () => {
                setSelectedUMKM(umkm);
                currentMap.closePopup();
              };
            }
          });
      markersLayerGroup.addLayer(marker);
    });

  }, [umkmList, search, category, isLoadingData]);

   /**
   * Fungsi untuk mendapatkan lokasi pengguna saat ini, menampilkan marker
   * lokasi di peta, dan menggeser peta ke lokasi tersebut.
   */
  const handleUseMyLocation = () => {
    const L = LRef.current;
    const currentMap = mapRef.current;
    if (!L || !currentMap || !navigator.geolocation) {
      alert("Geolocation tidak didukung atau map belum siap.");
      return;
    };

    if (userLocationMarkerRef.current && currentMap.hasLayer(userLocationMarkerRef.current)) {
        currentMap.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
    }
    if (userLocationCircleRef.current && currentMap.hasLayer(userLocationCircleRef.current)) {
        currentMap.removeLayer(userLocationCircleRef.current);
        userLocationCircleRef.current = null;
    }

    console.log("Mencari lokasi pengguna...");
    currentMap.locate({setView: true, maxZoom: 17});

    currentMap.once('locationfound', (e) => {
      console.log("Lokasi ditemukan:", e.latlng);
      const radius = 1500;
      if (userIconRef.current) {
        userLocationMarkerRef.current = L.marker(e.latlng, { icon: userIconRef.current })
          .addTo(currentMap)
          .bindPopup(`Lokasimu`).openPopup();
      }
      userLocationCircleRef.current = L.circle(e.latlng, radius).addTo(currentMap);
    });

    currentMap.once('locationerror', (e) => {
        console.error("Gagal mendapatkan lokasi:", e.message);
        alert(`Tidak dapat mengambil lokasi: ${e.message}`);
    });
  };
  
  /** Daftar item konfigurasi untuk komponen FloatingDock. */
   const dockItems = [
     {
       title: "UMKM Sekitar",
       icon: <IconList className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />,
       onClick: () => setIsSidebarOpen(!isSidebarOpen),
       ariaLabel: "Toggle Sidebar"
     },
     { title: "Cari UMKM", icon: <IconSearch className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />, onClick: () => { setIsSearchOpen(!isSearchOpen); setIsFilterOpen(false); } },
     { title: "Filter Kategori", icon: <IconFilter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />, onClick: () => { setIsFilterOpen(!isFilterOpen); setIsSearchOpen(false); } },
     { title: "Lokasi Saya", icon: <IconCurrentLocation className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />, onClick: handleUseMyLocation }
   ];
  const categories = ["Semua", ...new Set(umkmList.map(u => u.category))];

  const filteredUMKMList = umkmList.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "Semua" || u.category === category)
  );

  const handleSidebarItemClick = (umkm: UMKM) => {
    const currentMap = mapRef.current;
    if (currentMap) {
      currentMap.setView([umkm.lat, umkm.lng], 17);
      setSelectedUMKM(umkm);
    }
  };
 
  if (!isClient) return null;

  return (
    <div className="flex h-screen relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            
            style={isDesktop ? { width: `${sidebarWidth}px` } : {}}

            className="fixed bottom-0 left-0 right-0 h-72 bg-card border-t border-border overflow-hidden z-1000 shadow-lg
                       md:absolute md:top-0 md:left-0 md:h-full md:border-r md:border-t-0"
          >
            <UMKMSidebar
              items={filteredUMKMList}
              onItemClick={handleSidebarItemClick} 
              isLoading={isLoadingData}
            />
            <div
              className="hidden md:block w-2 cursor-col-resize absolute right-0 top-0 h-full bg-transparent hover:bg-primary/50 active:bg-primary/50 transition-colors duration-200"
              onMouseDown={handleResizeMouseDown}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={cn(
            "flex-1 flex flex-col relative h-full",
            "ml-0" 
          )}
        style={(isSidebarOpen && isDesktop) ? { 
            marginLeft: `${sidebarWidth}px`,
            transition: 'margin-left 0.3s ease-in-out' 
          } : {
            marginLeft: '0px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
      >
        <div id="map" className="flex-1 h-full w-full z-400" />
      </div>

      {isClient && (
          <FloatingDock
            items={dockItems}
            desktopClassName="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1001]"
            mobileClassName={cn(
              "fixed right-5 z-[1001] transition-all duration-300 ease-in-out",
              isSidebarOpen 
                ? "bottom-[calc(16rem+1.25rem)]"
                : "bottom-5"
            )}
          />
      )}

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed left-1/2 -translate-x-1/2 z-1002 p-2 bg-card border rounded-lg shadow-xl flex items-center gap-2 transition-all duration-300 ease-in-out",
              (isSidebarOpen && !isDesktop) 
                ? "bottom-[calc(20rem+1.5rem)]" 
                : "bottom-[calc(4rem+1.5rem)]"  
            )}
          >
            <IconSearch className="h-5 w-5 text-muted-foreground"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama UMKM..." className="border-none focus:ring-0 bg-transparent text-sm w-60" autoFocus />
            <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-full hover:bg-muted"> <IconX className="h-4 w-4 text-muted-foreground"/> </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed left-1/2 -translate-x-1/2 z-1002 p-3 bg-card border rounded-lg shadow-xl flex flex-col gap-2 w-60 transition-all duration-300 ease-in-out",
              (isSidebarOpen && !isDesktop) 
                ? "bottom-[calc(20rem+1.5rem)]" 
                : "bottom-[calc(4rem+1.5rem)]"  
            )}
            >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Filter Kategori</span>
              <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-full hover:bg-muted -mr-1"> <IconX className="h-4 w-4 text-muted-foreground"/> </button>
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-md p-2 text-sm w-full bg-background" >
              {categories.map(cat => ( <option key={cat} value={cat}>{cat}</option>))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUMKM && (
          <UMKMCard 
            umkm={selectedUMKM} 
            onClose={() => setSelectedUMKM(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}