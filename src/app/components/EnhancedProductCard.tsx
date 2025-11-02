'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { showLoginRequiredAlert, showToast, showErrorAlert } from '../../lib/sweetalert'

interface EnhancedProductCardProps {
  id: string
  name: string
  price: number
  image?: string | null
  stock: number
  umkmName: string
  umkmId: string
  category: string
  description?: string
  isAvailable?: boolean
}

export default function EnhancedProductCard({
  id,
  name,
  price,
  image,
  stock,
  umkmName,
  category,
  description,
  isAvailable = true
}: EnhancedProductCardProps) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBuyClick = async () => {
    if (!user) {
      const result = await showLoginRequiredAlert()
      if (result.isConfirmed) {
        // Redirect to login dengan parameter redirect ke produk
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
      return
    }

    if (stock < quantity) {
      showErrorAlert('Stok Tidak Cukup', `Stok tersedia: ${stock}`)
      return
    }

    setLoading(true)
    try {
      await addToCart(id, quantity)
      showToast(`${name} ditambahkan ke keranjang (${quantity}x)`, 'success')
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOutOfStock = stock === 0 || !isAvailable

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Habis
            </span>
          ) : stock < 10 ? (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Sisa {stock}
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Tersedia
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* UMKM Name */}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {umkmName}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          {formatPrice(price)}
        </div>

        {/* Stock Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="inline-flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOutOfStock ? 'bg-red-500' : stock < 10 ? 'bg-orange-500' : 'bg-green-500'
            }`}></div>
            {isOutOfStock ? 'Stok habis' : `Stok: ${stock} tersedia`}
          </span>
        </div>

        {/* Quantity & Buy Section */}
        {!isOutOfStock && (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Jumlah:
              </span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 py-1 text-center min-w-10 text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
                  disabled={quantity >= stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyClick}
              disabled={loading || isOutOfStock}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menambahkan...
                </div>
              ) : (
                `Tambah ke Keranjang`
              )}
            </button>
          </div>
        )}

        {/* Out of Stock Button */}
        {isOutOfStock && (
          <button
            disabled
            className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          >
            Stok Habis
          </button>
        )}
      </div>
    </motion.div>
  )
}