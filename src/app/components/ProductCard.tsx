"use client";

import { Star, MapPin, ShoppingCart, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { showSuccessAlert, showErrorAlert } from "@/lib/sweetalert";

interface Product {
  id?: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string; // Support both naming conventions
  umkmName: string;
  umkmId?: number | string;
  umkmCategory: string;
  umkmRating?: number;
  stock?: number;
  is_available?: boolean;
}

interface ProductCardProps {
  product: Product;
  showReason?: boolean;
  reason?: string;
  className?: string;
}

export default function ProductCard({ 
  product, 
  showReason = false, 
  reason, 
  className = "" 
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  // Log setiap kali component di-render
  useEffect(() => {
    console.log('🔄 ProductCard rendered:', product.name, 'ID:', product.id);
  }, [product.id, product.name]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 TOMBOL BELI DIKLIK!', product.name);
    console.log('🛒 Event details:', {
      type: e.type,
      button: e.button,
      target: e.target,
      currentTarget: e.currentTarget
    });
    
    if (adding) {
      console.log('🛒 Sedang menambah, tunggu...');
      return;
    }
    
    setAdding(true);
    
    try {
      console.log('🛒 Menambahkan ke cart:', {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || product.image,
        umkm: product.umkmName
      });

      await addToCart(
        product.id || '',
        1,
        product.name,
        product.price,
        product.image_url || product.image,
        product.umkmName
      );
      
      console.log('✅ BERHASIL DITAMBAHKAN KE CART!');
      
      // Sweet Alert Success (CartContext sudah punya showToast, tapi kita tambah ini untuk lebih jelas)
      await showSuccessAlert(
        'Berhasil!',
        `${product.name} berhasil ditambahkan ke keranjang`
      );
      
    } catch (error) {
      console.error('❌ ERROR MENAMBAH KE CART:', error);
      
      // Sweet Alert Error
      await showErrorAlert(
        'Gagal!',
        'Terjadi kesalahan saat menambahkan produk ke keranjang'
      );
    } finally {
      setAdding(false);
      console.log('🛒 Adding state reset');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPlaceholderImage = (category: string): string => {
    const placeholders: { [key: string]: string } = {
      "Kuliner": "/assets/actor.png",
      "Fashion": "/assets/tailor.png", 
      "Retail": "/assets/movie-director.png",
      "Kesehatan": "/assets/actor.png",
      "Kerajinan": "/assets/tailor.png",
    };
    return placeholders[category] || "/assets/movie-director.png";
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      "Kuliner": "from-orange-400 to-red-500",
      "Fashion": "from-pink-400 to-purple-500",
      "Retail": "from-blue-400 to-indigo-500",
      "Kesehatan": "from-green-400 to-teal-500",
      "Kerajinan": "from-yellow-400 to-orange-500",
    };
    return colors[category] || "from-gray-400 to-gray-500";
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      "Kuliner": "🍽️",
      "Fashion": "👕",
      "Retail": "🏪",
      "Kesehatan": "💊",
      "Kerajinan": "🎨"
    };
    return icons[category] || "📦";
  };

  return (
    <div
      className={`group relative ${className} hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-full`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Glowing Background Effect */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur"></div>
      
      {/* Main Card */}
      <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-neutral-700/50 overflow-hidden transition-all duration-500 group-hover:shadow-2xl h-full flex flex-col">
        
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
          {/* Recommendation Reason Badge */}
          {showReason && reason && (
            <div className="absolute top-2 left-2 z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 bg-linear-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-white/20"
              >
                {reason}
              </motion.div>
            </div>
          )}

          {/* Stock Warning Badge */}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2 z-20">
              <div className="px-2 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                Sisa {product.stock}
              </div>
            </div>
          )}

          {/* Image */}
          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0,
              scale: imageLoaded ? 1 : 1.1 
            }}
            transition={{ duration: 0.5 }}
            src={product.image || product.image_url || getPlaceholderImage(product.umkmCategory)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(product.umkmCategory);
              setImageLoaded(true);
            }}
          />
          
          {/* Loading Shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse">
              <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Heart 
              className={`h-5 w-5 transition-colors duration-200 ${
                isLiked 
                  ? "text-red-500 fill-current" 
                  : "text-neutral-600 dark:text-neutral-400"
              }`} 
            />
          </motion.button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-3 py-1.5 rounded-full bg-linear-to-r ${getCategoryColor(product.umkmCategory)} text-white text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 ${showReason ? 'mt-12' : ''}`}>
              <span>{getCategoryIcon(product.umkmCategory)}</span>
              <span>{product.umkmCategory}</span>
            </div>
          </div>

          {/* Rating Badge */}
          {product.umkmRating && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full shadow-lg">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                {product.umkmRating}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 flex flex-col flex-1">
          {/* Product Name */}
          <h3 className="font-bold text-xl text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 min-h-14 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* UMKM Info */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mb-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 line-clamp-1">
                {product.umkmName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.is_available || (product.stock !== undefined && product.stock <= 0) || adding}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                product.is_available && (product.stock === undefined || product.stock > 0) && !adding
                  ? 'bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>
                {adding 
                  ? 'Menambah...'
                  : product.is_available && (product.stock === undefined || product.stock > 0) 
                    ? 'Beli' 
                    : 'Habis'
                }
              </span>
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl transition-all duration-200 border border-neutral-200 dark:border-neutral-600 backdrop-blur-sm"
            >
              Detail
            </motion.button>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
}