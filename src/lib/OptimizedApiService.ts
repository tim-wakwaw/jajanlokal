// src/lib/OptimizedApiService.ts
import { APIResponse, FormattedProduct, FormattedUMKM, PaginationInfo } from '@/types/api'

interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  sortBy?: string
}

interface UMKMFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
}

interface Category {
  name: string
  count: number
  slug: string
}

export class OptimizedApiService {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  
  private static getCacheKey(endpoint: string, params?: Record<string, string | number>): string {
    const paramStr = params ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return `${endpoint}${paramStr ? `?${paramStr}` : ''}`
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private static setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  private static async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  static async getProducts(filters: ProductFilters = {}): Promise<{
    products: FormattedProduct[]
    pagination: PaginationInfo | null
    error?: string
  }> {
    const filterParams: Record<string, string | number> = {}
    if (filters.page) filterParams.page = filters.page
    if (filters.limit) filterParams.limit = filters.limit
    if (filters.category) filterParams.category = filters.category
    if (filters.search) filterParams.search = filters.search
    if (filters.sortBy) filterParams.sortBy = filters.sortBy

    const cacheKey = this.getCacheKey('/api/products', filterParams)
    const cached = this.getFromCache<{ products: FormattedProduct[]; pagination: PaginationInfo }>(cacheKey)
    
    if (cached) {
      return {
        products: cached.products,
        pagination: cached.pagination
      }
    }

    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)

    const response = await this.fetchApi<FormattedProduct[]>(`/api/products?${params}`)

    if (!response.success || !response.data) {
      return {
        products: [],
        pagination: null,
        error: response.error
      }
    }

    const result = {
      products: response.data,
      pagination: response.pagination || null
    }

    // Cache for 2 minutes
    this.setCache(cacheKey, result, 2 * 60 * 1000)

    return result
  }

  static async getProductById(id: string): Promise<{
    product: FormattedProduct | null
    error?: string
  }> {
    const cacheKey = this.getCacheKey(`/api/products/${id}`)
    const cached = this.getFromCache<FormattedProduct>(cacheKey)
    
    if (cached) {
      return { product: cached }
    }

    const response = await this.fetchApi<FormattedProduct>(`/api/products/${id}`)

    if (!response.success || !response.data) {
      return {
        product: null,
        error: response.error
      }
    }

    // Cache for 5 minutes
    this.setCache(cacheKey, response.data, 5 * 60 * 1000)

    return { product: response.data }
  }

  static async getCategories(): Promise<{
    categories: Category[]
    error?: string
  }> {
    const cacheKey = this.getCacheKey('/api/products/categories')
    const cached = this.getFromCache<Category[]>(cacheKey)
    
    if (cached) {
      return { categories: cached }
    }

    const response = await this.fetchApi<Category[]>('/api/products/categories')

    if (!response.success || !response.data) {
      return {
        categories: [],
        error: response.error
      }
    }

    // Cache for 5 minutes
    this.setCache(cacheKey, response.data, 5 * 60 * 1000)

    return { categories: response.data }
  }

  static async getUMKMs(filters: UMKMFilters = {}): Promise<{
    umkms: FormattedUMKM[]
    pagination: PaginationInfo | null
    error?: string
  }> {
    const filterParams: Record<string, string | number> = {}
    if (filters.page) filterParams.page = filters.page
    if (filters.limit) filterParams.limit = filters.limit
    if (filters.category) filterParams.category = filters.category
    if (filters.search) filterParams.search = filters.search

    const cacheKey = this.getCacheKey('/api/umkm', filterParams)
    const cached = this.getFromCache<{ umkms: FormattedUMKM[]; pagination: PaginationInfo }>(cacheKey)
    
    if (cached) {
      return {
        umkms: cached.umkms,
        pagination: cached.pagination
      }
    }

    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)

    const response = await this.fetchApi<FormattedUMKM[]>(`/api/umkm?${params}`)

    if (!response.success || !response.data) {
      return {
        umkms: [],
        pagination: null,
        error: response.error
      }
    }

    const result = {
      umkms: response.data,
      pagination: response.pagination || null
    }

    // Cache for 3 minutes
    this.setCache(cacheKey, result, 3 * 60 * 1000)

    return result
  }

  // Prefetch popular content
  static async prefetchPopularContent(): Promise<void> {
    try {
      // Prefetch first page of products
      this.getProducts({ page: 1, limit: 12 })
      
      // Prefetch categories
      this.getCategories()
      
      // Prefetch popular categories
      const categoriesResult = await this.getCategories()
      if (categoriesResult.categories.length > 0) {
        const topCategory = categoriesResult.categories[0]
        this.getProducts({ page: 1, limit: 8, category: topCategory.name })
      }
    } catch (error) {
      console.error('Prefetch error:', error)
    }
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}