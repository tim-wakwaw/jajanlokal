// src/app/api/umkm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UMKMRequestData, FormattedUMKM, PaginationInfo } from '@/types/api'

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

    const offset = (page - 1) * limit

    // Single optimized query with product counts
    let query = supabase
      .from('umkm_requests')
      .select(`
        id,
        name,
        category,
        image_url,
        description,
        address,
        contact_phone,
        created_at,
        product_requests!left(id, is_available, status)
      `, { count: 'exact' })
      .eq('status', 'approved')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    const formattedUMKMs: FormattedUMKM[] = (data as unknown as UMKMRequestData[] || []).map((item) => {
      const availableProducts = item.product_requests?.filter(
        (p) => p.is_available && p.status === 'approved'
      ) || []

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        image: item.image_url,
        description: item.description,
        address: item.address,
        contact: item.contact_phone,
        productCount: availableProducts.length,
        rating: 4.5, // Mock rating
        createdAt: item.created_at
      }
    })

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
      data: formattedUMKMs,
      pagination
    })

    // Cache for 3 minutes
    response.headers.set('Cache-Control', 'public, max-age=180, stale-while-revalidate=90')
    
    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}