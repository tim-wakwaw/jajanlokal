import { supabase } from './supabase'

// Service untuk manage products dari JSON data
export class ProductService {
  static async seedFromJSON() {
    try {
      // Fetch JSON data
      const response = await fetch('/data/umkmData.json')
      const umkmData = await response.json()

      console.log('Starting to seed data from JSON...')

      for (const umkm of umkmData) {
        // 1. Insert/Update UMKM
        const { data: umkmRecord, error: umkmError } = await supabase
          .from('umkm_requests')
          .upsert({
            id: `json-${umkm.id}`, // prefix untuk distinguish dari user requests
            user_id: 'system', // system user - bisa dibuat admin user
            name: umkm.name,
            category: umkm.category,
            description: umkm.description,
            address: umkm.alamat,
            lat: umkm.lat,
            lng: umkm.lng,
            image_url: umkm.image,
            status: 'approved', // Auto approved karena dari JSON
            created_at: new Date().toISOString()
          }, 
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
          .single()

        if (umkmError) {
          console.error('Error inserting UMKM:', umkm.name, umkmError)
          continue
        }

        console.log('Inserted UMKM:', umkm.name)

        // 2. Insert Products
        if (umkm.products && umkm.products.length > 0) {
          for (const product of umkm.products) {
            const { error: productError } = await supabase
              .from('product_requests')
              .upsert({
                id: `json-${umkm.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`,
                user_id: 'system',
                umkm_request_id: umkmRecord.id,
                name: product.name,
                price: product.price,
                description: product.description || '',
                image_url: product.image,
                stock: product.stock || Math.floor(Math.random() * 50) + 10, // Random stock 10-60
                is_available: true,
                status: 'approved',
                created_at: new Date().toISOString()
              },
              { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })

            if (productError) {
              console.error('Error inserting product:', product.name, productError)
            } else {
              console.log('Inserted product:', product.name)
            }
          }
        }
      }

      console.log('Data seeding completed!')
      return { success: true, message: 'Data berhasil di-seed dari JSON' }

    } catch (error) {
      console.error('Error seeding data:', error)
      return { success: false, error: error }
    }
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
        .from('product_requests')
        .select(`
          id,
          name,
          price,
          description,
          image_url,
          stock,
          is_available,
          status,
          created_at,
          umkm_requests!inner(
            id,
            name,
            category,
            image_url
          )
        `)
        .eq('status', 'approved')
        .eq('is_available', true)

      // Apply filters
      if (filters?.category) {
        query = query.eq('umkm_requests.category', filters.category)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,umkm_requests.name.ilike.%${filters.search}%`)
      }

      if (filters?.umkmName) {
        query = query.eq('umkm_requests.name', filters.umkmName)
      }

      // Pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Format data - cast to any to avoid TypeScript issues for now
      const formattedProducts = (data as any[]).map((item: any) => ({
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

      return { success: true, data: formattedProducts }

    } catch (error) {
      console.error('Error fetching products:', error)
      return { success: false, error: error }
    }
  }

  static async getProductById(productId: string) {
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

      // Cast to any to avoid TypeScript issues
      const product = data as any

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

      return { success: true, data: formattedProduct }

    } catch (error) {
      console.error('Error fetching product:', error)
      return { success: false, error: error }
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
          callback((payload.new as any).stock)
        }
      )
      .subscribe()

    return channel
  }

  static unsubscribeFromStockUpdates(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel)
  }
}