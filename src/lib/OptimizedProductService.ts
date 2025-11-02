import { supabase } from './supabase'

// Type definitions
interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UMKMRequest {
  id: string
  name: string
  category: string
  description?: string
  address?: string
  lat?: number
  lng?: number
  image_url?: string
}

interface ProductRequest {
  id: string
  name: string
  price: number
  description?: string
  image_url?: string
  stock: number
  is_available: boolean
  status: string
  created_at: string
  umkm_requests: UMKMRequest
}

interface FormattedProduct {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  stock: number
  isAvailable: boolean
  umkmId: string
  umkmName: string
  category: string
  umkmImage?: string
  umkmRating: number
  createdAt: string
}

// Cache for static data
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

const CACHE_TTL = {
  categories: 5 * 60 * 1000, // 5 minutes
  products: 2 * 60 * 1000,   // 2 minutes
  productDetail: 1 * 60 * 1000 // 1 minute
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCachedData<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

// Optimized service dengan caching dan batching
export class OptimizedProductService {
  
  // Batch fetch categories dengan cache
  static async getCategories() {
    const cacheKey = 'categories'
    const cached = getCachedData(cacheKey)
    
    if (cached) {
      return { success: true, data: cached }
    }

    try {
      const { data, error } = await supabase
        .from('umkm_requests')
        .select('category')
        .eq('status', 'approved')

      if (error) throw error

      const categories = [...new Set(data?.map(item => item.category) || [])]
      setCachedData(cacheKey, categories, CACHE_TTL.categories)
      
      return { success: true, data: categories }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error }
    }
  }

  // Optimized paginated products dengan single query
  static async getProductsPaginated({
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'created_at'
  }: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
  } = {}) {
    
    const cacheKey = `products-${page}-${limit}-${category}-${search}-${sortBy}`
    const cached = getCachedData<{ products: FormattedProduct[]; pagination: PaginationInfo }>(cacheKey)
    
    if (cached) {
      return { success: true, products: cached.products, pagination: cached.pagination }
    }

    try {
      const offset = (page - 1) * limit

      // Single optimized query dengan join
      let query = supabase
        .from('product_requests')
        .select(`
          id,
          name,
          price,
          image_url,
          stock,
          is_available,
          description,
          created_at,
          umkm_requests!inner(
            id,
            name,
            category,
            image_url
          )
        `, { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_available', true)
        .range(offset, offset + limit - 1)

      // Apply filters
      if (category) {
        query = query.eq('umkm_requests.category', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,umkm_requests.name.ilike.%${search}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'stock':
          query = query.order('stock', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw error

      const formattedProducts: FormattedProduct[] = (data as unknown as ProductRequest[] || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image_url,
        stock: item.stock,
        isAvailable: item.is_available,
        umkmId: item.umkm_requests.id,
        umkmName: item.umkm_requests.name,
        category: item.umkm_requests.category,
        umkmImage: item.umkm_requests.image_url,
        umkmRating: 4.5, // Default rating
        createdAt: item.created_at
      }))

      const totalPages = Math.ceil((count || 0) / limit)
      const pagination = {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }

      const result = { products: formattedProducts, pagination }
      setCachedData(cacheKey, result, CACHE_TTL.products)

      return { success: true, data: formattedProducts, pagination }

    } catch (error) {
      console.error('Error fetching products:', error)
      return { success: false, error }
    }
  }

  // Optimized single product fetch
  static async getProductById(productId: string) {
    const cacheKey = `product-${productId}`
    const cached = getCachedData(cacheKey)
    
    if (cached) {
      return { success: true, data: cached }
    }

    try {
      const { data, error } = await supabase
        .from('product_requests')
        .select(`
          id,
          name,
          price,
          description,
          image_url,
          stock,
          is_available,
          umkm_requests!inner(
            id,
            name,
            category,
            description,
            address,
            lat,
            lng,
            image_url
          )
        `)
        .eq('id', productId)
        .eq('status', 'approved')
        .single()

      if (error) throw error

      const product = data as unknown as ProductRequest

      const formattedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image_url,
        stock: product.stock,
        isAvailable: product.is_available,
        umkm: {
          id: product.umkm_requests.id,
          name: product.umkm_requests.name,
          category: product.umkm_requests.category,
          description: product.umkm_requests.description,
          address: product.umkm_requests.address,
          lat: product.umkm_requests.lat,
          lng: product.umkm_requests.lng,
          image: product.umkm_requests.image_url
        }
      }

      setCachedData(cacheKey, formattedProduct, CACHE_TTL.productDetail)
      return { success: true, data: formattedProduct }

    } catch (error) {
      console.error('Error fetching product:', error)
      return { success: false, error }
    }
  }

  // Optimized stock update dengan cache invalidation
  static async updateProductStock(productId: string, newStock: number) {
    try {
      const { error } = await supabase
        .from('product_requests')
        .update({ stock: newStock })
        .eq('id', productId)

      if (error) throw error

      // Invalidate related cache
      const keysToInvalidate = Array.from(cache.keys()).filter(key => 
        key.includes('products-') || key === `product-${productId}`
      )
      keysToInvalidate.forEach(key => cache.delete(key))

      return { success: true }
    } catch (error) {
      console.error('Error updating stock:', error)
      return { success: false, error }
    }
  }

  // Real-time subscription untuk stock updates
  static subscribeToStockUpdates(productId: string, callback: (stock: number) => void) {
    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_requests',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          const newData = payload.new as { stock: number }
          callback(newData.stock)
          
          // Invalidate cache
          cache.delete(`product-${productId}`)
        }
      )
      .subscribe()

    return channel
  }

  static unsubscribeFromStockUpdates(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel)
  }

  // Clear all cache (useful for admin operations)
  static clearCache() {
    cache.clear()
  }

  // Prefetch popular products
  static async prefetchPopularProducts() {
    try {
      // Load first page with default settings
      await this.getProductsPaginated({ page: 1, limit: 8 })
      
      // Load categories
      await this.getCategories()
      
      console.log('Popular products prefetched')
    } catch (error) {
      console.error('Error prefetching products:', error)
    }
  }
}