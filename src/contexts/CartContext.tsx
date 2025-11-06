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
      // Get cart items first
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)

      if (cartError) {
        if (cartError.code !== 'PGRST116' && cartError.code !== '42P01') {
          console.error('Cart query error:', cartError)
        }
        setCartItems([])
        return
      }

      if (!cartData || cartData.length === 0) {
        setCartItems([])
        return
      }

      // Fetch fresh product data for each cart item
      const productIds = cartData.map(item => item.product_id)
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image,
          stock,
          is_available,
          umkm:umkm_id (
            name
          )
        `)
        .in('id', productIds)

      // Map cart items with fresh product data
      const formattedItems: CartItem[] = cartData.map((item) => {
        const product = productsData?.find(p => p.id === item.product_id);
        const umkm = product?.umkm as { name?: string } | null;
        
        return {
          id: item.id,
          product_id: item.product_id,
          product_name: product?.name || item.product_name || 'Unknown Product',
          price: product?.price || item.price,
          product_price: product?.price || item.price,
          product_image: product?.image || item.image_url || undefined,
          umkm_name: umkm?.name || item.umkm_name || 'Unknown',
          quantity: item.quantity,
          stock: product?.stock || 999
        }
      })

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
  const addToCart = async (
    productId: string, 
    quantity: number = 1,
    productName?: string,
    price?: number,
    imageUrl?: string,
    umkmName?: string
  ) => {
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
        // Add new item to cart_items
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: productId,
            product_name: productName || 'Unknown Product',
            price: price || 0,
            quantity,
            image_url: imageUrl,
            umkm_name: umkmName
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
        .from('cart_items')
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
        .from('cart_items')
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
        .from('cart_items')
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