// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Single query to get product with UMKM details
    const { data, error } = await supabase
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
          image_url,
          description,
          address,
          contact_phone,
          created_at
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const productData = data as unknown as {
      id: string
      name: string
      price: number
      description: string
      image_url: string
      stock: number
      is_available: boolean
      created_at: string
      umkm_requests: {
        id: string
        name: string
        category: string
        image_url: string
        description: string
        address: string
        contact_phone: string
        created_at: string
      }
    }

    const formattedProduct = {
      id: productData.id,
      name: productData.name,
      price: productData.price,
      description: productData.description,
      image: productData.image_url,
      stock: productData.stock,
      isAvailable: productData.is_available,
      umkm: {
        id: productData.umkm_requests.id,
        name: productData.umkm_requests.name,
        category: productData.umkm_requests.category,
        image: productData.umkm_requests.image_url,
        description: productData.umkm_requests.description,
        address: productData.umkm_requests.address,
        contact: productData.umkm_requests.contact_phone,
        rating: 4.5,
        createdAt: productData.umkm_requests.created_at
      },
      createdAt: productData.created_at
    }

    // Set cache headers
    const response = NextResponse.json({
      success: true,
      data: formattedProduct
    })

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=150')
    
    return response

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}