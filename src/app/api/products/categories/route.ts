// src/app/api/products/categories/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CategoryData } from '@/types/api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get unique categories with product counts in a single query
    const { data, error } = await supabase
      .from('umkm_requests')
      .select(`
        category,
        product_requests!inner(id)
      `)
      .eq('status', 'approved')
      .eq('product_requests.status', 'approved')
      .eq('product_requests.is_available', true)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    // Count products per category
    const categoryCount: { [key: string]: number } = {};
    (data as unknown as CategoryData[] || []).forEach((item: CategoryData) => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      }
    })

    // Format categories
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))

    // Sort by product count
    categories.sort((a, b) => b.count - a.count)

    // Set cache headers
    const response = NextResponse.json({
      success: true,
      data: categories
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