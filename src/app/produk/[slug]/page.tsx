"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { Star, MapPin, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import LazyImage from '@/app/components/LazyImage';
import { SimilarProducts } from '@/app/components/RecommendationSection';
import { CartButton } from '@/app/components/CartButton';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  stock: number;
  is_available: boolean;
  description?: string;
  umkm_id: string;
  umkm: {
    id: string;
    name: string;
    category: string;
    alamat?: string;
    rating?: number;
    lat?: number;
    lng?: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch product by slug/id
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            umkm:umkm_id (
              id,
              name,
              category,
              alamat,
              rating,
              lat,
              lng
            )
          `)
          .eq('id', slug)
          .eq('is_available', true)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          console.error('Product not found');
          return;
        }

        // Fix: Handle umkm as array or object
        const umkmData = Array.isArray(data.umkm) ? data.umkm[0] : data.umkm;
        
        setProduct({
          ...data,
          umkm: umkmData || {
            id: data.umkm_id,
            name: 'Unknown UMKM',
            category: 'Unknown',
            alamat: '',
            rating: 0
          }
        });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || !product.is_available || product.stock <= 0) return;

    try {
      await addToCart(
        product.id,
        quantity,
        product.name,
        product.price,
        product.image_url || product.image,
        product.umkm.name
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Produk yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link 
            href="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/produk" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Produk
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            href="/produk"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Produk
          </Link>
        </motion.div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
              <LazyImage
                src={product.image_url || product.image || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Stock Warning */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                  Sisa {product.stock}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <Link 
                  href={`/peta-umkm?umkm=${product.umkm.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{product.umkm.name}</span>
                </Link>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {product.umkm.category}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Deskripsi Produk
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Jumlah
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Stok tersedia: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || product.stock <= 0}
                className={`flex-1 px-6 py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                  product.is_available && product.stock > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.is_available && product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </button>
              
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* UMKM Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Informasi UMKM
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.umkm.alamat || 'Alamat tidak tersedia'}
                  </span>
                </div>
                {product.umkm.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.umkm.rating} / 5.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🤖 Similar Products Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SimilarProducts
            productId={product.id}
            umkmId={product.umkm_id}
            title="Produk Serupa Yang Mungkin Anda Suka"
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          />
        </motion.div>
      </div>

      {/* Cart Button - Fixed Position */}
      <CartButton />
    </div>
  );
}