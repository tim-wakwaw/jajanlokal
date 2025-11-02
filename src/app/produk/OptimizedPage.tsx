"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import EnhancedProductCard from "@/app/components/EnhancedProductCard";
import ProductFilter from "@/app/components/ProductFilter";
import { OptimizedApiService } from "../../lib/OptimizedApiService";

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
}

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 animate-pulse">
    <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
  </div>
);

// Stats component untuk menampilkan info loading
const StatsCard = ({ title, value, loading }: { title: string; value: number; loading: boolean }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-blue-600">
      {loading ? (
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
      ) : (
        `${value}+`
      )}
    </div>
    <div className="text-sm text-neutral-500">{title}</div>
  </div>
);

function ProductsContent() {
  const [allProducts, setAllProducts] = useState<ProductWithUmkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ 
    currentPage: number; 
    totalPages: number; 
    totalItems?: number;
    hasNextPage: boolean; 
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Prefetch on mount
  useEffect(() => {
    OptimizedApiService.prefetchPopularContent();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await OptimizedApiService.getCategories();
        if (!result.error && result.categories) {
          setCategories(['all', ...result.categories.map(cat => cat.name)]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number = 1, reset: boolean = true) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const result = await OptimizedApiService.getProducts({
        page,
        limit: 12,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy !== 'newest' ? sortBy : undefined
      });

      if (!result.error && result.products) {
        const formattedProducts = result.products.map(product => ({
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
        }));

        if (reset || page === 1) {
          setAllProducts(formattedProducts);
        } else {
          setAllProducts(prev => [...prev, ...formattedProducts]);
        }

        setPagination(result.pagination);
      } else {
        setError(result.error || 'Gagal memuat produk');
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Unexpected error loading products');
      setAllProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Fetch products when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1, true);
  }, [selectedCategory, searchQuery, sortBy, fetchProducts]);

  // Load more products
  const loadMore = () => {
    if (!loadingMore && pagination?.hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  // Memoized filtered products for client-side search
  const displayProducts = useMemo(() => {
    if (searchQuery && allProducts.length > 0) {
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.umkmName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return allProducts;
  }, [allProducts, searchQuery]);

  // Loading state
  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="relative z-10 pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-6 max-w-md mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-8 max-w-2xl mx-auto animate-pulse"></div>
              
              {/* Stats Skeleton */}
              <div className="flex justify-center gap-8 mt-8">
                {[1, 2, 3].map(i => (
                  <StatsCard key={i} title="Loading..." value={0} loading={true} />
                ))}
              </div>
            </div>

            {/* Filter Skeleton */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-4 mb-6 animate-pulse">
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Ada Masalah</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProducts(1, true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Coba Lagi
          </button>
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
              <StatsCard
                title="Produk" 
                value={pagination?.totalItems || allProducts.length} 
                loading={false}
              />
              <StatsCard
                title="UMKM" 
                value={new Set(allProducts.map(p => p.umkmName)).size} 
                loading={false}
              />
              <StatsCard
                title="Kategori" 
                value={categories.length - 1} 
                loading={false}
              />
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
                📦 Menampilkan <span className="text-blue-600 font-bold">{displayProducts.length}</span> produk
                {selectedCategory !== "all" && (
                  <span className="text-purple-600 font-semibold"> dari kategori {selectedCategory}</span>
                )}
                {pagination && (
                  <span className="text-gray-500 ml-2">
                    (Halaman {pagination.currentPage} dari {pagination.totalPages})
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Products Grid */}
          {displayProducts.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={`${product.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.1 * (index % 8)
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
              </motion.div>

              {/* Load More Button */}
              {pagination && pagination.hasNextPage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-8"
                >
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      loadingMore
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memuat...
                      </div>
                    ) : (
                      'Muat Lebih Banyak'
                    )}
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Produk Tidak Ditemukan
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Coba ubah filter pencarian atau kategori Anda
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OptimizedProdukPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}