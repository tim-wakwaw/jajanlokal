"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import EnhancedProductCard from "@/app/components/EnhancedProductCard";
import SmartSearchBar from "@/app/components/SmartSearchBar";
import { ProductService } from "../../lib/productService";
import { supabase } from "@/lib/supabase";

interface ProductWithUmkm {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  is_available: boolean;
  description?: string;
  umkmName: string;
  umkmId: string;
  umkmCategory: string;
  _uniqueKey?: string;
}

export default function ProdukPage() {
  const [products, setProducts] = useState<ProductWithUmkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy] = useState<string>("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const ITEMS_PER_PAGE = 8; // kurangi jumlah item untuk loading lebih cepat

  // Fetch products with pagination - dengan error handling yang lebih baik
  const fetchProducts = useCallback(async (page: number = 1, reset: boolean = true) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await ProductService.getProductsPaginated({
        page,
        limit: ITEMS_PER_PAGE,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy
      });

      if (result.success && result.data) {
        const formattedProducts = result.data.map((product, idx) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image,
          stock: product.stock,
          is_available: product.isAvailable,
          description: product.description,
          umkmName: product.umkmName,
          umkmId: product.umkmId,
          umkmCategory: product.category,
          // Add unique identifier to prevent key collision
          _uniqueKey: `${product.id}-${page}-${idx}`,
        }));

        // Debug: Check for duplicate IDs
        const ids = formattedProducts.map(p => p.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.warn('Duplicate product IDs found:', duplicates);
        }

        if (reset || page === 1) {
          setProducts(formattedProducts);
        } else {
          // Prevent duplicates when loading more
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = formattedProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }

        setCurrentPage(result.currentPage || 1);
        setHasNextPage(result.hasNextPage || false);
      } else {
        // Jika tidak ada data, set empty array
        if (reset || page === 1) {
          setProducts([]);
        }
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Set empty state pada error
      if (reset || page === 1) {
        setProducts([]);
      }
      setHasNextPage(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Initial load + Realtime subscription
  useEffect(() => {
    fetchProducts(1, true);

    // 🔥 Setup Realtime subscription for products table
    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('🔄 Product changed:', payload)
          fetchProducts(1, true) // Refresh from page 1
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts]);

  // Load more products
  const loadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchProducts(currentPage + 1, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="relative z-10 pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="text-center mb-12">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-3xl mx-auto mb-8 animate-pulse"></div>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Filter skeleton */}
            <div className="mb-8 space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header - tanpa animasi berlebihan */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Produk UMKM Lokal
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Temukan beragam produk berkualitas dari UMKM terpercaya di sekitar Anda.
            </p>
            
            {/* Smart Search */}
            <div className="max-w-3xl mx-auto mb-8">
              <SmartSearchBar />
            </div>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {products.length}+
                </div>
                <div className="text-sm text-neutral-500">Produk</div>
              </div>
            </div>
          </div>

          {/* Products Grid - optimized rendering */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product._uniqueKey || `${product.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: Math.min(index * 0.05, 0.5) // Limit delay
                    }}
                  >
                    <EnhancedProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image_url}
                      stock={product.stock}
                      umkmName={product.umkmName}
                      umkmId={product.umkmId}
                      category={product.umkmCategory}
                      description={product.description}
                      isAvailable={product.is_available}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memuat...</span>
                      </>
                    ) : (
                      <>
                        <span>Muat Lebih Banyak</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
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
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}