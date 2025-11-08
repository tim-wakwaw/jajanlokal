"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, TrendingUp, Users, Sparkles } from 'lucide-react';
import { 
  getSimilarProducts, 
  getSimilarUMKM, 
  getTrendingProducts, 
  getPersonalizedRecommendations 
} from '@/lib/recommendations';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock?: number;
  is_available?: boolean;
  umkm?: {
    name?: string;
    category?: string;
    image?: string;
  };
}

interface RecommendationSectionProps {
  productId?: string;
  umkmId?: string;
  className?: string;
  title?: string;
  showPersonalized?: boolean;
  showSimilarProducts?: boolean;
  showSimilarUMKM?: boolean;
  showTrending?: boolean;
}

export default function RecommendationSection({ 
  productId, 
  umkmId, 
  className = "",
  title,
  showPersonalized = true,
  showSimilarProducts = true,
  showSimilarUMKM = true,
  showTrending = true
}: RecommendationSectionProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<{
    similar_products: Product[];
    similar_umkm: Product[];
    trending_products: Product[];
    personalized_recommendations: Product[];
  }>({
    similar_products: [],
    similar_umkm: [],
    trending_products: [],
    personalized_recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Silently handle location errors - recommendations can work without location
          console.debug('Location not available:', error.message);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    }
  }, []);

  // Fetch recommendations with debounce
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        if (productId && showSimilarProducts) {
          const similar = await getSimilarProducts(productId, 6);
          setRecommendations(prev => ({ ...prev, similar_products: similar }));
        }
        
        if (umkmId && showSimilarUMKM) {
          console.log('🏪 Fetching similar UMKM for:', umkmId, 'showSimilarUMKM:', showSimilarUMKM);
          const similar = await getSimilarUMKM(umkmId, 6);
          console.log('🏪 Got similar UMKM results:', similar);
          setRecommendations(prev => ({ ...prev, similar_umkm: similar }));
        }
        
        if (showTrending) {
          const trending = await getTrendingProducts(5); // Top 5 best sellers
          setRecommendations(prev => ({ ...prev, trending_products: trending }));
        }
        
        if (showPersonalized) {
          const personalized = await getPersonalizedRecommendations(user?.id, 5); // Top 5 personalized
          setRecommendations(prev => ({ ...prev, personalized_recommendations: personalized }));
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to prevent multiple requests
    const timeoutId = setTimeout(() => {
      fetchRecommendations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [user?.id, productId, umkmId, userLocation, showPersonalized, showSimilarProducts, showSimilarUMKM, showTrending]);

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const RecommendationBlock = ({ 
    title, 
    icon, 
    items, 
    description,
    gradientFrom,
    gradientTo,
    layout = 'grid',
    maxItems = 6
  }: { 
    title: string; 
    icon: React.ReactNode; 
    items: Product[]; 
    description: string;
    gradientFrom: string;
    gradientTo: string;
    layout?: 'grid' | 'horizontal';
    maxItems?: number;
  }) => {
    if (items.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-linear-to-r ${gradientFrom} ${gradientTo} rounded-2xl text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-xl md:text-2xl text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">{description}</p>
          </div>
        </div>
        
        {layout === 'horizontal' ? (
          /* Horizontal layout - pas dengan ukuran layar, tidak perlu scroll */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.slice(0, maxItems).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
                style={{ pointerEvents: 'auto' }}
              >
                <ProductCard 
                  product={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image || item.umkm?.image,
                    umkmName: item.umkm?.name || 'UMKM',
                    umkmCategory: item.umkm?.category || 'Produk',
                    stock: item.stock || 1,
                    is_available: item.is_available ?? true
                  }}
                  showReason={false}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Grid layout - untuk similar products dan similar UMKM */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, maxItems).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
                style={{ pointerEvents: 'auto' }}
              >
                <ProductCard 
                  product={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image || item.umkm?.image,
                    umkmName: item.umkm?.name || 'UMKM',
                    umkmCategory: item.umkm?.category || 'Produk',
                    stock: item.stock || 1,
                    is_available: item.is_available ?? true
                  }}
                  showReason={false}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const hasAnyRecommendations = 
    (showPersonalized && user && recommendations.personalized_recommendations.length > 0) ||
    (showSimilarProducts && productId && recommendations.similar_products.length > 0) ||
    (showSimilarUMKM && umkmId && recommendations.similar_umkm.length > 0) ||
    (showTrending && recommendations.trending_products.length > 0);

  if (!hasAnyRecommendations) {
    return null;
  }

  return (
    <div className={`space-y-16 ${className}`}>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {title}
          </h2>
        </motion.div>
      )}

      {/* Personalized Recommendations - 5 produk horizontal */}
      {showPersonalized && user && (
        <RecommendationBlock
          title="🎯 Rekomendasi Untuk Anda"
          icon={<Sparkles className="h-6 w-6" />}
          items={recommendations.personalized_recommendations}
          description="Berdasarkan pesanan dan preferensi Anda"
          gradientFrom="from-purple-500"
          gradientTo="to-pink-500"
          layout="horizontal"
          maxItems={5}
        />
      )}

      {/* Similar Products - Grid layout biar keliatan rapi */}
      {showSimilarProducts && productId && (
        <RecommendationBlock
          title="⭐ Produk Serupa"
          icon={<Star className="h-6 w-6" />}
          items={recommendations.similar_products}
          description="Produk lain yang mungkin Anda suka"
          gradientFrom="from-blue-500"
          gradientTo="to-indigo-500"
          layout="grid"
          maxItems={6}
        />
      )}

      {/* Similar UMKM - Horizontal layout */}
      {showSimilarUMKM && umkmId && (
        <>
          {console.log('🏪 Rendering UMKM Serupa:', { 
            showSimilarUMKM, 
            umkmId, 
            itemsCount: recommendations.similar_umkm.length,
            items: recommendations.similar_umkm 
          })}
          <RecommendationBlock
            title="🏪 UMKM Serupa"
            icon={<Users className="h-6 w-6" />}
            items={recommendations.similar_umkm}
            description="UMKM lain di area dan kategori yang sama"
            gradientFrom="from-green-500"
            gradientTo="to-emerald-500"
            layout="horizontal"
            maxItems={5}
          />
        </>
      )}

      {/* Trending Products - 5 produk horizontal */}
      {showTrending && (
        <RecommendationBlock
          title="🔥 Trending Hari Ini"
          icon={<TrendingUp className="h-6 w-6" />}
          items={recommendations.trending_products}
          description="Produk paling populer minggu ini"
          gradientFrom="from-orange-500"
          gradientTo="to-red-500"
          layout="horizontal"
          maxItems={5}
        />
      )}
    </div>
  );
}

// Export individual recommendation components for flexibility
export const PersonalizedRecommendations = (props: Omit<RecommendationSectionProps, 'showSimilarProducts' | 'showSimilarUMKM' | 'showTrending'>) => (
  <RecommendationSection {...props} showSimilarProducts={false} showSimilarUMKM={false} showTrending={false} />
);

export const SimilarProducts = (props: Omit<RecommendationSectionProps, 'showPersonalized' | 'showSimilarUMKM' | 'showTrending'>) => (
  <RecommendationSection {...props} showPersonalized={false} showSimilarUMKM={false} showTrending={false} />
);

export const SimilarUMKM = (props: Omit<RecommendationSectionProps, 'showPersonalized' | 'showSimilarProducts' | 'showTrending'>) => (
  <RecommendationSection {...props} showPersonalized={false} showSimilarProducts={false} showTrending={false} />
);

export const TrendingProducts = (props: Omit<RecommendationSectionProps, 'showPersonalized' | 'showSimilarProducts' | 'showSimilarUMKM'>) => (
  <RecommendationSection {...props} showPersonalized={false} showSimilarProducts={false} showSimilarUMKM={false} />
);