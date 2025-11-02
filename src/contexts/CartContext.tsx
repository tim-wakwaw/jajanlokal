'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './OptimizedAuthContext'
import { supabase } from '../lib/supabase'
import { showErrorAlert, showToast } from '../lib/sweetalert'

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image?: string | null
  umkm_name: string
  quantity: number
  stock: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch cart data
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          id,
          product_id,
          quantity,
          product_requests!inner(
            id,
            name,
            price,
            image_url,
            stock,
            is_available,
            umkm_requests!inner(name)
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Cart query error:', error)
        // If error because no data, just set empty cart
        setCartItems([])
        return
      }

      if (!data || data.length === 0) {
        setCartItems([])
        return
      }

      // Type assertion for Supabase query result  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedItems: CartItem[] = data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_requests.name,
        product_price: item.product_requests.price,
        product_image: item.product_requests.image_url || undefined,
        umkm_name: item.product_requests.umkm_requests.name,
        quantity: item.quantity,
        stock: item.product_requests.stock || 0
      }))

      setCartItems(formattedItems)
    } catch (error: unknown) {
      console.error('Error fetching cart:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat keranjang belanja'
      showErrorAlert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Add to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Check if item already in cart
      const existingItem = cartItems.find(item => item.product_id === productId)
      
      if (existingItem) {
        // Update quantity
        await updateQuantity(productId, existingItem.quantity + quantity)
      } else {
        // Add new item
        const { error } = await supabase
          .from('shopping_cart')
          .insert([{
            user_id: user.id,
            product_id: productId,
            quantity
          }])

        if (error) throw error

        await refreshCart()
        showToast('Produk ditambahkan ke keranjang', 'success')
      }
    } catch (error: unknown) {
      console.error('Error adding to cart:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan ke keranjang'
      showErrorAlert('Error', errorMessage)
      throw error
    }
  }

  // Update quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return

    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      const { error } = await supabase
        .from('shopping_cart')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      await refreshCart()
    } catch (error: unknown) {
      console.error('Error updating quantity:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah jumlah produk'
      showErrorAlert('Error', errorMessage)
    }
  }

  // Remove from cart
  const removeFromCart = async (productId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error

      await refreshCart()
      showToast('Produk dihapus dari keranjang', 'success')
    } catch (error: unknown) {
      console.error('Error removing from cart:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus dari keranjang'
      showErrorAlert('Error', errorMessage)
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
    } catch (error: unknown) {
      console.error('Error clearing cart:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengosongkan keranjang'
      showErrorAlert('Error', errorMessage)
    }
  }

  // Calculate totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0)

  // Load cart when user changes
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Real-time updates for cart
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('shopping-cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_cart',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshCart()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refreshCart])

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}