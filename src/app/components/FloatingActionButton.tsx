'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/OptimizedAuthContext'
import { useCart } from '@/contexts/CartContext'
import { CartSidebar } from './CartSidebar'

export function FloatingActionButton() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleCartClick = () => {
    if (!user) {
      // Jika belum login, redirect ke login
      router.push('/auth/login')
      return
    }

    // Buka CartSidebar (user bisa lihat, edit, atau checkout dari sini)
    setIsCartOpen(true)
  }

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        onClick={handleCartClick}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg text-white transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        {/* Cart Badge */}
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center min-w-7"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </motion.div>
        )}
        
        <ShoppingCart className="w-7 h-7" />
      </motion.button>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}