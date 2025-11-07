'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Menu, X, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/OptimizedAuthContext'
import { useCart } from '@/contexts/CartContext'
import { CartSidebar } from './CartSidebar'

export function FloatingActionButton() {
  const { user, profile } = useAuth()
  const { cartCount } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const menuItems = [
    ...(user ? [
      {
        icon: ShoppingCart,
        label: 'Keranjang',
        onClick: () => {
          setIsCartOpen(true)
          setIsExpanded(false)
        },
        badge: cartCount > 0 ? cartCount : undefined,
        color: 'bg-green-600 hover:bg-green-700'
      },
      ...(profile?.role === 'admin' || profile?.role === 'super_admin' ? [{
        icon: Settings,
        label: 'Admin Dashboard',
        onClick: () => {
          window.location.href = '/admin/dashboard'
          setIsExpanded(false)
        },
        color: 'bg-purple-600 hover:bg-purple-700'
      }] : [])
    ] : [
      {
        icon: User,
        label: 'Login untuk Belanja',
        onClick: () => {
          window.location.href = '/auth/login'
          setIsExpanded(false)
        },
        color: 'bg-blue-600 hover:bg-blue-700'
      }
    ])
  ]

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        {/* Menu Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end space-y-3"
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={item.onClick}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg 
                    transform transition-all duration-200 hover:scale-105 active:scale-95
                    ${item.color}
                  `}
                >
                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center min-w-6">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                  
                  <item.icon className="w-5 h-5" />
                  
                  {/* Label */}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            relative w-14 h-14 rounded-full shadow-lg text-white
            transform transition-all duration-200 hover:scale-110 active:scale-95
            ${isExpanded ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'}
          `}
          whileTap={{ scale: 0.9 }}
        >
          {/* Cart Badge on Main Button (when collapsed) */}
          {!isExpanded && cartCount > 0 && user && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center min-w-6"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </motion.div>
          )}
          
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.div>
        </motion.button>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}