'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/OptimizedAuthContext'
import { formatPrice } from '@/lib/utils'
import { showErrorAlert, showToast } from '../../lib/sweetalert'
import MagicBorderButton from './ui/MagicBorderButton'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Close on outside click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle quantity update with validation
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId)
      return
    }

    setIsLoading(true)
    try {
      await updateQuantity(productId, newQuantity)
      showToast('Quantity berhasil diupdate', 'success')
    } catch {
      showErrorAlert('Gagal mengupdate quantity')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle remove item with confirmation
  const handleRemoveItem = async (productId: string) => {
    setIsLoading(true)
    try {
      await removeFromCart(productId)
      showToast('Item berhasil dihapus dari keranjang', 'success')
    } catch {
      showErrorAlert('Gagal menghapus item')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (!user) {
      showErrorAlert('Silakan login terlebih dahulu untuk checkout')
      return
    }

    if (cartCount === 0) {
      showErrorAlert('Tambahkan produk ke keranjang terlebih dahulu')
      return
    }

    onCheckout?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleOverlayClick}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keranjang ({cartCount})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {cartCount === 0 ? (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Keranjang Kosong
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 mb-4">
                      Belum ada produk di keranjang Anda
                    </p>
                    <MagicBorderButton
                      onClick={onClose}
                      className="mx-auto"
                    >
                      Mulai Belanja
                    </MagicBorderButton>
                  </div>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                        >
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <div className="w-16 h-16 relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ShoppingBag className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {item.product_name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.umkm_name}
                              </p>
                              <p className="text-lg font-semibold text-green-600 mt-1">
                                {formatPrice(item.product_price)}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                    disabled={isLoading || item.quantity <= 1}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  
                                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                    {item.quantity}
                                  </span>
                                  
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                    disabled={isLoading || item.quantity >= item.stock}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveItem(item.product_id)}
                                  disabled={isLoading}
                                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Stock Warning */}
                              {item.stock <= 5 && (
                                <p className="text-xs text-orange-500 mt-1">
                                  Stok tersisa {item.stock}
                                </p>
                              )}

                              {/* Item Total */}
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                Total: {formatPrice(item.product_price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Summary & Checkout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    {/* Total */}
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-green-600">{formatPrice(cartTotal)}</span>
                    </div>

                    {/* Checkout Button */}
                    <MagicBorderButton
                      onClick={handleCheckout}
                      disabled={isLoading || cartCount === 0}
                      className="w-full"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Checkout
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </MagicBorderButton>

                    {!user && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Login diperlukan untuk checkout
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}