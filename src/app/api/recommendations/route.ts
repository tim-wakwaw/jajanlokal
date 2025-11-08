import { NextRequest, NextResponse } from 'next/server';
import { 
  getMixedRecommendations, 
  getSimilarProducts, 
  getSimilarUMKM, 
  getTrendingProducts, 
  getPersonalizedRecommendations 
} from '@/lib/recommendations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const umkmId = searchParams.get('umkm_id');
    const type = searchParams.get('type'); // 'personalized', 'similar', 'trending', 'all'
    const limit = parseInt(searchParams.get('limit') || '4');

    // Get recommendations based on type
    if (type === 'similar' && productId) {
      const similar = await getSimilarProducts(productId, limit);
      return NextResponse.json({
        success: true,
        data: similar,
        type: 'similar_products'
      });
    }

    if (type === 'umkm' && umkmId) {
      const similar = await getSimilarUMKM(umkmId, limit);
      return NextResponse.json({
        success: true,
        data: similar,
        type: 'similar_umkm'
      });
    }

    if (type === 'trending') {
      const trending = await getTrendingProducts(limit);
      return NextResponse.json({
        success: true,
        data: trending,
        type: 'trending_products'
      });
    }

    if (type === 'personalized') {
      const personalized = await getPersonalizedRecommendations(userId || undefined, limit);
      return NextResponse.json({
        success: true,
        data: personalized,
        type: 'personalized_recommendations'
      });
    }

    // Default: Get mixed recommendations
    const mixed = await getMixedRecommendations(userId || undefined);
    return NextResponse.json({
      success: true,
      data: {
        trending: mixed.trending,
        personalized: mixed.personalized,
        similar: mixed.similar,
        umkm: mixed.umkm
      },
      type: 'mixed'
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, product_id, umkm_id, limit } = body;

    // Same logic as GET but with POST body
    if (type === 'similar' && product_id) {
      const similar = await getSimilarProducts(product_id, limit || 4);
      return NextResponse.json({
        success: true,
        data: similar,
        type: 'similar_products'
      });
    }

    if (type === 'umkm' && umkm_id) {
      const similar = await getSimilarUMKM(umkm_id, limit || 4);
      return NextResponse.json({
        success: true,
        data: similar,
        type: 'similar_umkm'
      });
    }

    if (type === 'trending') {
      const trending = await getTrendingProducts(limit || 8);
      return NextResponse.json({
        success: true,
        data: trending,
        type: 'trending_products'
      });
    }

    if (type === 'personalized') {
      const personalized = await getPersonalizedRecommendations(user_id, limit || 6);
      return NextResponse.json({
        success: true,
        data: personalized,
        type: 'personalized_recommendations'
      });
    }

    // Default: Get mixed recommendations
    const mixed = await getMixedRecommendations(user_id);
    return NextResponse.json({
      success: true,
      data: {
        trending: mixed.trending,
        personalized: mixed.personalized,
        similar: mixed.similar,
        umkm: mixed.umkm
      },
      type: 'mixed'
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}