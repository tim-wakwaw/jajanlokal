"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import ProductCard from "@/app/components/ProductCard";
import ProductFilter from "@/app/components/ProductFilter";

interface Product {
  name: string;
  price: number;
  image?: string;
}

interface UmkmData {
  id: number;
  name: string;
  image?: string;
  category: string;
  description: string;
  products: Product[];
  rating: number;
}

interface ProductWithUmkm extends Product {
  umkmName: string;
  umkmId: number;
  umkmCategory: string;
  umkmRating: number;
}

export default function ProdukPage() {
  const [allProducts, setAllProducts] = useState<ProductWithUmkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    fetch("/data/umkmData.json")
      .then((response) => response.json())
      .then((data: UmkmData[]) => {
        // Flatten semua produk dari semua UMKM
        const products: ProductWithUmkm[] = [];
        
        data.forEach((umkm) => {
          umkm.products.forEach((product) => {
            products.push({
              ...product,
              umkmName: umkm.name,
              umkmId: umkm.id,
              umkmCategory: umkm.category,
              umkmRating: umkm.rating
            });
          });
        });

        setAllProducts(products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, []);

  // Filter dan search logic menggunakan useMemo
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.umkmCategory === selectedCategory);
    }

    // Search by product name or UMKM name
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.umkmName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.umkmRating - a.umkmRating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const categories = ["all", ...new Set(allProducts.map(p => p.umkmCategory))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
            Memuat produk UMKM...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header dengan animasi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Produk UMKM Lokal
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Temukan beragam produk berkualitas dari UMKM terpercaya di sekitar Anda. 
              Dukung ekonomi lokal dengan berbelanja langsung dari produsen.
            </p>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center gap-8 mt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {allProducts.length}+
                </div>
                <div className="text-sm text-neutral-500">Produk</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(allProducts.map(p => p.umkmName)).size}+
                </div>
                <div className="text-sm text-neutral-500">UMKM</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-neutral-500">Kategori</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Filter Component dengan animasi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </motion.div>

          {/* Results Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-neutral-700/50">
              <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                📦 Menampilkan <span className="text-blue-600 font-bold">{filteredProducts.length}</span> produk
                {selectedCategory !== "all" && (
                  <span className="text-purple-600 font-semibold"> dari kategori {selectedCategory}</span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={`${product.umkmId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.1 * (index % 8) // Animasi bertahap per baris
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-12 border border-white/20 dark:border-neutral-700/50 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
                >
                  Reset Filter
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}