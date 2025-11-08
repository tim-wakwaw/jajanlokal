// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ProductRequestData, FormattedProduct, PaginationInfo } from '@/types/api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'

    const offset = (page - 1) * limit

    // Single optimized query
    let query = supabase
      .from('product_requests')
      .select(`
        id,
        name,
        price,
        image,
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
    if (category && category !== 'all') {
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

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    const formattedProducts: FormattedProduct[] = (data as unknown as ProductRequestData[] || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      stock: item.stock,
      isAvailable: item.is_available,
      umkmId: item.umkm_requests.id,
      umkmName: item.umkm_requests.name,
      category: item.umkm_requests.category,
      umkmImage: item.umkm_requests.image_url,
      umkmRating: 4.5,
      createdAt: item.created_at
    }))

    const totalPages = Math.ceil((count || 0) / limit)
    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: count || 0,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    // Set cache headers
    const response = NextResponse.json({
      success: true,
      data: formattedProducts,
      pagination
    })

    // Cache for 2 minutes
    response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=60')
    
    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}