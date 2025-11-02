export interface ProductRequestData {
  id: string
  name: string
  price: number
  image_url: string
  stock: number
  is_available: boolean
  description: string
  created_at: string
  umkm_requests: {
    id: string
    name: string
    category: string
    image_url: string
    description?: string
    address?: string
    contact_phone?: string
    created_at?: string
  }
}

export interface UMKMRequestData {
  id: string
  name: string
  category: string
  image_url: string
  description: string
  address: string
  contact_phone: string
  created_at: string
  product_requests?: Array<{
    id: string
    is_available: boolean
    status: string
  }>
}

export interface CategoryData {
  category: string
  product_requests: Array<{ id: string }>
}

export interface FormattedProduct {
  id: string
  name: string
  price: number
  description: string
  image: string
  stock: number
  isAvailable: boolean
  umkmId: string
  umkmName: string
  category: string
  umkmImage: string
  umkmRating: number
  createdAt: string
}

export interface FormattedUMKM {
  id: string
  name: string
  category: string
  image: string
  description: string
  address: string
  contact: string
  productCount: number
  rating: number
  createdAt: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  pagination?: PaginationInfo
  error?: string
}