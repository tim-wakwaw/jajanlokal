import { supabase } from './supabase'
import type { ProductData } from '@/types/api'

// Type definitions
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

// Service untuk manage products dari JSON data
export class ProductService {
  // Simple cache untuk categories
  private static categoriesCache: string[] | null = null;
  private static cacheTimestamp: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  // NOTE: Use SeedDataFromJson component instead of this function
  // This is kept for backward compatibility only
  static async seedFromJSON() {
    console.warn('seedFromJSON is deprecated. Use SeedDataFromJson component instead.')
    return { success: false, error: 'Use SeedDataFromJson component for seeding data' }
  }

  static async getAllProducts(filters?: {
    category?: string
    search?: string
    umkmName?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          image,
          stock,
          is_available,
          created_at,
          umkm!inner(
            id,
            name,
            category,
            image,
            rating
          )
        `)
        .eq('is_available', true)

      // Apply filters
      if (filters?.category) {
        query = query.eq('umkm.category', filters.category)
      }

      if (filters?.search) {
        // Simple search in product name only (no OR with umkm.name to avoid 400 error)
        query = query.ilike('name', `%${filters.search}%`)
      }

      if (filters?.umkmName) {
        query = query.eq('umkm.name', filters.umkmName)
      }

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        // Silent fail for missing tables
        return { success: true, data: [] }
      }

      // Format data
      const formattedProducts: FormattedProduct[] = (data as unknown as ProductData[]).map((item: ProductData) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        stock: item.stock,
        isAvailable: item.is_available,
        umkmId: item.umkm.id,
        umkmName: item.umkm.name,
        category: item.umkm.category,
        umkmImage: item.umkm.image,
        umkmRating: item.umkm.rating || 0, // Gunakan rating asli
        createdAt: item.created_at
      }))

      return { success: true, data: formattedProducts }

    } catch {
      return { success: true, data: [] }
    }
  }

  // Optimized method untuk pagination 
  static async getProductsPaginated(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
    // [!code ++]
    // AKTIFKAN KEMBALI FILTER INI
    minRating?: number;
    priceRange?: { min?: number; max?: number };
    // [!code --]
  } = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        sortBy = 'created_at',
        // [!code ++]
        // DESTRUCTURE FILTER BARU
        minRating,
        priceRange
        // [!code --]
      } = options

      const offset = (page - 1) * limit

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image,
          stock,
          is_available,
          description,
          created_at,
          umkm!inner(
            id,
            name,
            category,
            image,
            rating
          )
        `, { count: 'exact' }) // TAMBAHKAN 'rating'
        .eq('is_available', true)

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('umkm.category', category)
      }

      // Apply search filter
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // [!code ++]
      // TAMBAHKAN LOGIKA FILTER RATING DAN HARGA
      if (minRating) {
        query = query.gte('umkm.rating', minRating)
      }

      if (priceRange?.min) {
        query = query.gte('price', priceRange.min)
      }

      if (priceRange?.max) {
        query = query.lte('price', priceRange.max)
      }
      // [!code --]

      // Apply sorting
      const orderColumn = sortBy === 'price-low' || sortBy === 'price-high' ? 'price' :
        // [!code ++]
        sortBy === 'rating' ? 'umkm.rating' : // Tambah sort by rating
          // [!code --]
          sortBy === 'stock' ? 'stock' : 'created_at'

      const ascending = sortBy === 'price-low' ? true :
        sortBy === 'name' ? true : false

      // [!code ++]
      // Modifikasi query order untuk handle join rating
      if (sortBy === 'rating') {
        query = query
          .order('rating', { foreignTable: 'umkm', ascending: false })
      } else {
        query = query
          .order(orderColumn, { ascending })
      }

      query = query.order('id', { ascending: true }) // Secondary sort by id
        // [!code --]
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase query error:', error);
        return {
          success: true,
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasNextPage: false
        }
      }

      // Format data
      const formattedProducts: FormattedProduct[] = (data as unknown as ProductData[]).map((item: ProductData) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        stock: item.stock,
        isAvailable: item.is_available,
        umkmId: item.umkm.id,
        umkmName: item.umkm.name,
        category: item.umkm.category,
        umkmImage: item.umkm.image,
        // [!code ++]
        umkmRating: item.umkm.rating || 0, // Gunakan rating asli
        // [!code --]
        createdAt: item.created_at
      }))

      // Remove any potential duplicates based on ID
      const uniqueProducts = formattedProducts.filter((product, index, arr) =>
        arr.findIndex(p => p.id === product.id) === index
      )

      return {
        success: true,
        data: uniqueProducts,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: (count || 0) > offset + limit
      }

    } catch (err) {
      console.error("Service error:", err);
      return {
        success: true,
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false
      }
    }
  }

  // Cache untuk kategori dengan optimasi
  static async getCategories() {
    try {
      // Check cache first
      const now = Date.now();
      if (this.categoriesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        return { success: true, data: this.categoriesCache };
      }

      const { data, error } = await supabase
        .from('umkm')
        .select('category')

      if (error) {
        console.error('Error fetching categories:', error)
        return { success: true, data: [] }
      }

      const categories = [...new Set(data.map(item => item.category))];

      // Update cache
      this.categoriesCache = categories;
      this.cacheTimestamp = now;

      return { success: true, data: categories }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error }
    }
  }

  static async getProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          image,
          stock,
          is_available,
          umkm!inner(
            id,
            name,
            category,
            description,
            alamat,
            lat,
            lng,
            image,
            rating
          )
        `) // TAMBAHKAN 'rating'
        .eq('id', productId)
        .single()

      if (error) {
        return { success: false, error: error }
      }

      // Type assertion untuk product data
      const product = data as unknown as ProductData

      const formattedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        stock: product.stock,
        isAvailable: product.is_available,
        umkm: {
          id: product.umkm.id,
          name: product.umkm.name,
          category: product.umkm.category,
          description: product.umkm.description || '',
          address: product.umkm.alamat || '',
          lat: product.umkm.lat || 0,
          lng: product.umkm.lng || 0,
          image: product.umkm.image,
          rating: product.umkm.rating || 0 // Gunakan rating asli
        }
      }

      return { success: true, data: formattedProduct }

    } catch {
      return { success: false, error: 'Product not found' }
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
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          const newData = payload.new as { stock: number }
          callback(newData.stock)
        }
      )
      .subscribe()

    return channel
  }

  static unsubscribeFromStockUpdates(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel)
  }
}