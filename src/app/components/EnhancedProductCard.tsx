'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { useAuth } from '../../contexts/OptimizedAuthContext'
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

const EnhancedProductCard = memo(function EnhancedProductCard({
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Stock badge - hanya jika stok rendah */}
        {stock > 0 && stock <= 5 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Stok: {stock}
          </div>
        )}
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* Product name */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-14">
          {name}
        </h3>

        {/* UMKM name */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
          {umkmName}
        </p>

        {/* Description - hanya jika ada */}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Spacer untuk push price dan buttons ke bawah */}
        <div className="flex-1"></div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(price)}
          </span>
        </div>

        {/* Quantity dan Buy button */}
        <div className="flex items-center gap-3">
          {!isOutOfStock && (
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={loading}
              >
                -
              </button>
              <span className="px-3 py-1 text-center min-w-12 border-x border-gray-300 dark:border-gray-600">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={loading || quantity >= stock}
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={handleBuyClick}
            disabled={isOutOfStock || loading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : isOutOfStock ? (
              'Stok Habis'
            ) : (
              'Tambah'
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

export default EnhancedProductCard