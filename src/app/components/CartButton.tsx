'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { CartSidebar } from './CartSidebar'

export function CartButton() {
  const { cartCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      {/* Cart Button */}
      <motion.button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag className="w-6 h-6" />
        
        {/* Cart Count Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-5"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          // Navigate to checkout page
          window.location.href = '/checkout'
        }}
      />
    </>
  )
}