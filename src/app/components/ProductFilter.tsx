"use client";

import { Search, Filter, SortAsc, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function ProductFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}: ProductFilterProps) {
  
  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      "all": "🛍️",
      "Kuliner": "🍽️",
      "Fashion": "👕",
      "Retail": "🏪",
      "Kesehatan": "💊",
      "Kerajinan": "🎨"
    };
    return icons[category] || "📦";
  };

  const getCategoryName = (category: string) => {
    return category === "all" ? "Semua Kategori" : category;
  };

  return (
    <div className="mb-8">
      {/* Main Filter Container */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-neutral-700/50 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Filter & Pencarian
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              🔍 Cari Produk
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari produk atau nama toko..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative group"
          >
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              📂 Kategori
            </label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {getCategoryName(category)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Sort */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative group"
          >
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              ⚡ Urutkan
            </label>
            <div className="relative">
              <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5 group-focus-within:text-pink-500 transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/70 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
              >
                <option value="name">📝 Nama A-Z</option>
                <option value="price-low">💰 Harga Terendah</option>
                <option value="price-high">💎 Harga Tertinggi</option>
                <option value="rating">⭐ Rating Terbaik</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
        >
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
            🔥 Kategori Populer:
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1, 6).map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedCategory === category
                    ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600"
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}