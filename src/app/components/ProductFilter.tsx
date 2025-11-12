"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, SortAsc, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Tipe data filter (LENGKAP DENGAN 4 FILTER)
interface FilterValues {
  search: string;
  category: string;
  sortBy: string;
  minRating?: number;
  priceRange?: { min?: number; max?: number };
}

interface ProductFilterProps {
  categories: string[];
  onFilterSubmit: (filters: FilterValues) => void;
  onFilterReset: () => void;
}

export default function ProductFilter({
  categories,
  onFilterSubmit,
  onFilterReset
}: ProductFilterProps) {

  const searchParams = useSearchParams();
  const kategoriFromUrl = searchParams.get('kategori');

  // Memoize kategori yang valid. Ini akan ter-update saat prop 'categories' berubah.
  const validCategories = useMemo(() => new Set(categories), [categories]);

  // Gunakan "lazy initializer" untuk useState. Fungsi ini HANYA berjalan sekali saat mount.
  // Kita BACA URL SEKALI saja untuk nilai awal.
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return kategoriFromUrl || "all";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  const [showFilters, setShowFilters] = useState(false);


  // [!code ++]
  // *** INI ADALAH PERBAIKAN UTAMA ***
  // Effect ini menyinkronkan state DARI URL atau Props.
  // Dia TIDAK bergantung pada `selectedCategory`
  useEffect(() => {
    // Tentukan apa kategori yang seharusnya
    const isUrlCategoryValid = kategoriFromUrl && validCategories.has(kategoriFromUrl);

    if (isUrlCategoryValid) {
      // KASUS 1: URL valid (misal "Kuliner")
      // Panggil setState HANYA jika state-nya belum sama.
      setSelectedCategory(kategoriFromUrl);

    } else if (kategoriFromUrl && !isUrlCategoryValid) {
      // KASUS 2: URL ada tapi TIDAK valid (misal "makanan-enak" ATAU "Kuliner" tapi prop 'categories' belum dimuat)
      // Jika 'categories' SUDAH dimuat (size > 1), kita tahu URL-nya pasti salah. Reset ke "all".
      if (validCategories.size > 1) {
        setSelectedCategory("all");
      }
      // Jika 'categories' BELUM dimuat (size <= 1), kita biarkan dulu,
      // effect ini akan jalan lagi nanti saat 'validCategories' berubah.

    } else if (!kategoriFromUrl) {
      // KASUS 3: Tidak ada param URL. Pastikan "all".
      setSelectedCategory("all");
    }

    // ESLint akan mengeluh 'selectedCategory' tidak ada di array, tapi ini DISENGAJA.
    // Kita hanya ingin effect ini berjalan saat URL atau PROPS berubah.
  }, [kategoriFromUrl, validCategories]);
  // [!code --]


  // Cek apakah filter aktif (LENGKAP DENGAN 4 FILTER)
  const isDirty =
    searchQuery !== "" ||
    selectedCategory !== (kategoriFromUrl && validCategories.has(kategoriFromUrl) ? kategoriFromUrl : "all") || // Cek vs default yg benar
    sortBy !== "created_at" ||
    minRating !== undefined ||
    priceMin !== "" ||
    priceMax !== "";

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      "all": "🛍️", "Kuliner": "🍽️", "Fashion": "👕",
      "Retail": "🏪", "Kesehatan": "💊", "Kerajinan": "🎨"
    };
    return icons[category] || "📦";
  };

  const getCategoryName = (category: string) => {
    return category === "all" ? "Semua Kategori" : category;
  };

  // Kirim data filter ke parent (LENGKAP DENGAN 4 FILTER)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterSubmit({
      search: searchQuery,
      category: selectedCategory,
      sortBy: sortBy,
      minRating: minRating,
      priceRange: {
        min: priceMin ? parseInt(priceMin) : undefined,
        max: priceMax ? parseInt(priceMax) : undefined,
      }
    });
    setShowFilters(false);
  };

  // Reset semua state internal (LENGKAP DENGAN 4 FILTER)
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("created_at");
    setMinRating(undefined);
    setPriceMin("");
    setPriceMax("");
    onFilterReset();
    setShowFilters(false);
  };

  return (
    <form className="w-full max-w-3xl mx-auto" onSubmit={handleSubmit}>

      {/* Baris Atas: Search, Filter, Submit, Reset (Tidak Berubah) */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari produk, UMKM, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 transition-all duration-200 backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${showFilters ? "bg-blue-500 text-white" : "text-neutral-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            aria-label="Toggle Filters"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Cari"
          >
            Cari
          </motion.button>

          <AnimatePresence>
            {isDirty && (
              <motion.button
                type="button"
                onClick={handleReset}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: "0.5rem" }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200 shadow-lg whitespace-nowrap"
                aria-label="Reset Filter"
              >
                Reset
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Panel Filter Lanjutan (DENGAN 4 FILTER) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-4 p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-neutral-700/50"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Filter Lanjutan
              </h2>
            </div>

            {/* Grid 2x2 untuk 4 filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Urutkan */}
              <div className="relative group">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <SortAsc className="inline-block h-4 w-4 mr-1" /> Urutkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer"
                >
                  <option value="created_at">Relevansi (Terbaru)</option>
                  <option value="name">Nama A-Z</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>

              {/* Rating Minimum */}
              <div className="relative group">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Star className="inline-block h-4 w-4 mr-1" /> Rating Minimum
                </label>
                <select
                  value={minRating || ""}
                  onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer"
                >
                  {/* PERBARUI OPSI RATING */}
                  <option value="">Semua Rating</option>
                  <option value="1">⭐ 1.0+</option>
                  <option value="2">⭐ 2.0+</option>
                  <option value="3">⭐ 3.0+</option>
                  <option value="4">⭐ 4.0+</option>
                  <option value="4.5">⭐ 4.5+</option>
                </select>
              </div>

              {/* Kategori */}
              <div className="relative group">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Sparkles className="inline-block h-4 w-4 mr-1" /> Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rentang Harga (SUDAH BENAR) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  💸 Rentang Harga
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min (Rp)"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-1/2 px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70"
                  />
                  <span className="text-neutral-500">–</span>
                  <input
                    type="number"
                    placeholder="Max (Rp)"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-1/2 px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}