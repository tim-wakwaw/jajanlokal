import { supabase } from './supabase';
import Fuse from 'fuse.js';

interface OrderProduct {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  umkm_id?: string;
  umkm_name?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  is_available: boolean;
  umkm_id: string;
  created_at: string;
  updated_at: string;
}

interface UMKM {
  id: string;
  name: string;
  image: string;
  alamat: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface ProductWithUMKM extends Product {
  umkm: UMKM;
}

// ========================================
// AI-POWERED RECOMMENDATION ENGINE
// Using Fuse.js for fuzzy matching & content similarity
// ========================================

/**
 * Calculate similarity score between two products using multiple factors
 * Returns a score between 0-100 (higher is more similar)
 */
function calculateSimilarityScore(
  product: ProductWithUMKM,
  reference: ProductWithUMKM
): number {
  let score = 0;
  
  // 1. Category similarity (40 points)
  if (product.umkm?.category === reference.umkm?.category) {
    score += 40;
  }
  
  // 2. Price similarity (30 points)
  const priceDiff = Math.abs(product.price - reference.price);
  const avgPrice = (product.price + reference.price) / 2;
  const priceSimPct = Math.max(0, 1 - (priceDiff / avgPrice));
  score += priceSimPct * 30;
  
  // 3. Name/Description similarity using Fuse.js (20 points)
  const searchText = `${product.name} ${product.description || ''}`;
  const refText = `${reference.name} ${reference.description || ''}`;
  const fuse = new Fuse([{ text: refText }], {
    keys: ['text'],
    threshold: 0.4,
    includeScore: true,
  });
  const fuseResult = fuse.search(searchText);
  if (fuseResult.length > 0 && fuseResult[0].score !== undefined) {
    score += (1 - fuseResult[0].score) * 20;
  }
  
  // 4. Same UMKM bonus (10 points)
  if (product.umkm_id === reference.umkm_id) {
    score += 10;
  }
  
  return score;
}

// ========================================
// 1. AI-ENHANCED CONTENT-BASED FILTERING
// ========================================
export async function getSimilarProducts(productId: string, limit: number = 4): Promise<ProductWithUMKM[]> {
  try {
    // Get the reference product with its UMKM data
    const { data: referenceProduct, error: refError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .eq('id', productId)
      .single();

    if (refError || !referenceProduct) {
      console.error('❌ Reference product not found:', refError);
      return [];
    }

    console.log('🎯 AI Recommendation for:', referenceProduct.name);

    // Get ALL available products (we'll rank them with AI)
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .neq('id', productId)
      .eq('is_available', true)
      .limit(50); // Get a good pool to rank from

    if (productsError || !allProducts) {
      console.error('❌ Products fetch error:', productsError);
      return [];
    }

    // Calculate similarity scores for each product using AI algorithm
    const scoredProducts = allProducts.map(product => ({
      ...product,
      similarityScore: calculateSimilarityScore(
        product as ProductWithUMKM,
        referenceProduct as ProductWithUMKM
      )
    }));

    // Sort by similarity score (highest first)
    scoredProducts.sort((a, b) => b.similarityScore - a.similarityScore);

    // Log top recommendations for debugging
    console.log('🤖 Top AI Recommendations:');
    scoredProducts.slice(0, limit).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (Score: ${p.similarityScore.toFixed(1)})`);
    });

    // Return top N most similar products
    return scoredProducts.slice(0, limit) as ProductWithUMKM[];
  } catch (error) {
    console.error('❌ Error in AI getSimilarProducts:', error);
    return [];
  }
}

// ========================================
// 2. AI-ENHANCED COLLABORATIVE FILTERING (UMKM-based)
// ========================================

/**
 * Get similar UMKMs based on AI similarity scoring
 * Returns UMKM data directly (not products)
 */
export async function getSimilarUMKMByUMKM(umkmId: string, limit: number = 6): Promise<UMKM[]> {
  try {
    console.log('🏪 Starting AI-powered getSimilarUMKMByUMKM for:', umkmId);
    
    // Get the reference UMKM
    const { data: referenceUMKM, error: refError } = await supabase
      .from('umkm')
      .select('*')
      .eq('id', umkmId)
      .single();

    if (refError || !referenceUMKM) {
      console.error('❌ Reference UMKM not found:', refError);
      return [];
    }

    console.log('🏪 Reference UMKM:', referenceUMKM.name, 'Category:', referenceUMKM.category);

    // Get all other UMKMs
    const { data: allUMKMs, error: umkmsError } = await supabase
      .from('umkm')
      .select('*')
      .neq('id', umkmId)
      .limit(50);

    if (umkmsError || !allUMKMs) {
      console.error('❌ UMKMs fetch error:', umkmsError);
      return [];
    }

    // Use Fuse.js to find similar UMKMs
    const fuse = new Fuse(allUMKMs, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'category', weight: 0.3 },
      ],
      threshold: 0.5,
      includeScore: true,
    });

    const searchText = `${referenceUMKM.name} ${referenceUMKM.description || ''} ${referenceUMKM.category}`;
    const fuseResults = fuse.search(searchText);

    // Score each UMKM based on multiple factors
    const scoredUMKMs = fuseResults.map(result => {
      const umkm = result.item as UMKM;
      let score = 0;

      // 1. Fuse.js similarity (40 points)
      score += (1 - (result.score || 0)) * 40;

      // 2. Category exact match (35 points)
      if (umkm.category === referenceUMKM.category) {
        score += 35;
      }

      // 3. Rating bonus (15 points)
      score += ((umkm.rating || 0) / 5) * 15;

      // 4. Location proximity bonus (10 points)
      if (umkm.lat && umkm.lng && referenceUMKM.lat && referenceUMKM.lng) {
        const distance = Math.sqrt(
          Math.pow(umkm.lat - referenceUMKM.lat, 2) + 
          Math.pow(umkm.lng - referenceUMKM.lng, 2)
        );
        // Closer = higher score (max 10 points within ~0.1 degree)
        score += Math.max(0, 10 - distance * 100);
      }

      return { ...umkm, aiScore: score };
    });

    // Sort by AI score
    scoredUMKMs.sort((a, b) => b.aiScore - a.aiScore);

    console.log('🤖 Top Similar UMKMs:');
    scoredUMKMs.slice(0, limit).forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} - ${u.category} (Score: ${u.aiScore.toFixed(1)})`);
    });

    return scoredUMKMs.slice(0, limit);
  } catch (error) {
    console.error('❌ Error in AI getSimilarUMKMByUMKM:', error);
    return [];
  }
}

/**
 * Get similar products from different UMKMs (old function - kept for compatibility)
 */
export async function getSimilarUMKM(umkmId: string, limit: number = 4): Promise<ProductWithUMKM[]> {
  try {
    console.log('🏪 Starting AI-powered getSimilarUMKM for:', umkmId);
    
    // Get the reference UMKM
    const { data: referenceUMKM, error: refError } = await supabase
      .from('umkm')
      .select('*')
      .eq('id', umkmId)
      .single();

    if (refError || !referenceUMKM) {
      console.error('❌ Reference UMKM not found:', refError);
      return [];
    }

    console.log('🏪 Reference UMKM:', referenceUMKM.name, 'Category:', referenceUMKM.category);

    // Get products from other UMKMs
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .eq('is_available', true)
      .neq('umkm_id', umkmId)
      .limit(50);

    if (productsError || !allProducts) {
      console.error('❌ Products fetch error:', productsError);
      return [];
    }

    // Use Fuse.js to find UMKMs with similar names/descriptions
    const fuse = new Fuse(allProducts, {
      keys: [
        { name: 'umkm.name', weight: 0.4 },
        { name: 'umkm.description', weight: 0.2 },
        { name: 'umkm.category', weight: 0.4 },
      ],
      threshold: 0.4,
      includeScore: true,
    });

    const searchText = `${referenceUMKM.name} ${referenceUMKM.description || ''} ${referenceUMKM.category}`;
    const fuseResults = fuse.search(searchText);

    // Score each product based on multiple factors
    const scoredProducts = fuseResults.map(result => {
      const product = result.item as ProductWithUMKM;
      let score = 0;

      // 1. Fuse.js similarity (40 points)
      score += (1 - (result.score || 0)) * 40;

      // 2. Category exact match (30 points)
      if (product.umkm?.category === referenceUMKM.category) {
        score += 30;
      }

      // 3. Rating bonus (20 points)
      score += ((product.umkm?.rating || 0) / 5) * 20;

      // 4. Recency bonus (10 points)
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 10 - daysSinceCreated * 0.1);

      return { ...product, aiScore: score };
    });

    // Sort by AI score
    scoredProducts.sort((a, b) => b.aiScore - a.aiScore);

    console.log('🤖 Top UMKM Recommendations:');
    scoredProducts.slice(0, limit).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} from ${p.umkm?.name} (Score: ${p.aiScore.toFixed(1)})`);
    });

    return scoredProducts.slice(0, limit) as ProductWithUMKM[];
  } catch (error) {
    console.error('❌ Error in AI getSimilarUMKM:', error);
    return [];
  }
}

// ========================================
// 3. TRENDING PRODUCTS (Popular items - berdasarkan jumlah terjual)
// ========================================
export async function getTrendingProducts(limit: number = 5): Promise<ProductWithUMKM[]> {
  try {
    console.log('🔥 Starting getTrendingProducts...');
    
    // Get ALL orders first to see what we have
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('products, payment_status')
      .order('created_at', { ascending: false });

    console.log('🔥 ALL orders data:', { 
      count: allOrders?.length, 
      statuses: allOrders?.map(o => o.payment_status),
      error: allOrdersError 
    });

    // Get orders with products - Include pending since Xendit shows paid but DB still pending
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('products, payment_status')
      .in('payment_status', ['paid', 'completed', 'success', 'pending']) // ADD pending!
      .order('created_at', { ascending: false });

    console.log('🔥 Orders with products (including pending):', { count: orders?.length, error: ordersError });

    if (ordersError || !orders || orders.length === 0) {
      console.log('🔥 No orders found, using fallback...');
      // Fallback: return newest products if no sales data
      const { data: fallbackProducts } = await supabase
        .from('products')
        .select('*, umkm (*)')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return fallbackProducts || [];
    }

    // Count total quantity sold per product (matching admin dashboard logic)
    const productSales: Record<string, { quantity: number; productName: string }> = {};
    
    orders.forEach((order, orderIndex) => {
      console.log(`🔥 Processing order ${orderIndex}:`, order.products);
      const products = order.products as OrderProduct[];
      
      if (Array.isArray(products)) {
        products.forEach((product: OrderProduct) => {
          if (product.product_id && product.product_name) {
            const quantity = product.quantity || 1;
            const key = product.product_id;
            
            if (!productSales[key]) {
              productSales[key] = { quantity: 0, productName: product.product_name };
            }
            productSales[key].quantity += quantity;
            
            console.log(`🔥 Product ${product.product_name}: +${quantity} (total: ${productSales[key].quantity})`);
          }
        });
      }
    });

    // Debug log dengan nama produk
    const topSelling = Object.entries(productSales)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(([id, data]) => ({ id, productName: data.productName, quantity: data.quantity }));
      
    console.log('🔥 TOP SELLING PRODUCTS WITH NAMES:', topSelling);

    // Sort by total quantity sold and get top product IDs
    const topProductIds = Object.entries(productSales)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, limit)
      .map(([id]) => id);

    console.log('🔥 Top product IDs to fetch:', topProductIds);
    console.log('🔥 Top product IDs to fetch:', topProductIds);

    if (topProductIds.length === 0) {
      console.log('🔥 No product IDs found, using fallback...');
      // Fallback if no products found
      const { data: fallbackProducts } = await supabase
        .from('products')
        .select('*, umkm (*)')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return fallbackProducts || [];
    }

    // Fetch full product details with UMKM
    const { data: trendingProducts, error } = await supabase
      .from('products')
      .select('*, umkm (*)')
      .eq('is_available', true)
      .in('id', topProductIds);

    console.log('🔥 Fetched products:', trendingProducts?.map(p => ({ id: p.id, name: p.name })));

    if (error) {
      console.error('🔥 Trending products error:', error);
      return [];
    }

    // Sort by sales quantity (maintain order from topProductIds)
    const sortedProducts = topProductIds
      .map(id => trendingProducts?.find(p => p.id === id))
      .filter(Boolean) as ProductWithUMKM[];

    console.log('🔥 Final trending products:', sortedProducts.map(p => p.name));
    
    return sortedProducts;
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    return [];
  }
}

// ========================================
// 4. PERSONALIZED RECOMMENDATIONS
// ========================================
export async function getPersonalizedRecommendations(
  userId?: string,
  limit: number = 6
): Promise<ProductWithUMKM[]> {
  try {
    if (!userId) {
      // For non-authenticated users, return trending products
      return getTrendingProducts(limit);
    }

    // Fetch user's order history to understand preferences
    const { data: userOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('User orders error:', ordersError);
      return getTrendingProducts(limit);
    }    if (!userOrders || userOrders.length === 0) {
      // New user, return trending products
      return getTrendingProducts(limit);
    }

    // Extract product IDs, UMKM IDs, and categories from user's order history
    const orderedProductIds = new Set<string>();
    const orderedUMKMIds = new Set<string>();
    const preferredCategories = new Set<string>();

    // First, get all unique product IDs from orders
    const allProductIds = new Set<string>();
    userOrders.forEach(order => {
      if (Array.isArray(order.products)) {
        order.products.forEach((product: OrderProduct) => {
          if (product.product_id) {
            orderedProductIds.add(product.product_id);
            allProductIds.add(product.product_id);
          }
          if (product.umkm_id) {
            orderedUMKMIds.add(product.umkm_id);
          }
        });
      }
    });

    // Fetch full product details to get categories
    if (allProductIds.size > 0) {
      const { data: orderedProducts } = await supabase
        .from('products')
        .select('id, umkm(category)')
        .in('id', Array.from(allProductIds));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderedProducts?.forEach((product: any) => {
        if (product.umkm?.category) {
          preferredCategories.add(product.umkm.category);
        }
      });
    }

    // Debug log
    console.log('🎯 User preferred categories:', Array.from(preferredCategories));
    console.log('🎯 User ordered from UMKMs:', Array.from(orderedUMKMIds));

    // Build query for personalized products based on categories and UMKMs
    let query = supabase
      .from('products')
      .select('*, umkm (*)')
      .eq('is_available', true);

    // Filter by preferred categories
    if (preferredCategories.size > 0) {
      const categories = Array.from(preferredCategories);
      // Build OR filter: umkm.category.in.(category1,category2,...)
      query = query.in('umkm.category', categories);
    }

    // Exclude already purchased products
    if (orderedProductIds.size > 0) {
      query = query.not('id', 'in', `(${Array.from(orderedProductIds).join(',')})`);
    }

    const { data: personalizedProducts, error: personalizedError } = await query
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more for filtering

    if (personalizedError) {
      console.error('Personalized products error:', personalizedError);
      return getTrendingProducts(limit);
    }

    // Prioritize products from same UMKMs, then same categories
    const sortedProducts = (personalizedProducts || []).sort((a, b) => {
      const aFromPreferredUMKM = orderedUMKMIds.has(a.umkm_id) ? 1 : 0;
      const bFromPreferredUMKM = orderedUMKMIds.has(b.umkm_id) ? 1 : 0;
      
      if (aFromPreferredUMKM !== bFromPreferredUMKM) {
        return bFromPreferredUMKM - aFromPreferredUMKM;
      }
      
      // Both from preferred UMKM or both not, sort by rating
      return (b.umkm?.rating || 0) - (a.umkm?.rating || 0);
    }).slice(0, limit);

    // If not enough products, supplement with trending
    if (sortedProducts.length < limit) {
      const trendingProducts = await getTrendingProducts(limit - sortedProducts.length);
      return [...sortedProducts, ...trendingProducts] as ProductWithUMKM[];
    }

    return sortedProducts as ProductWithUMKM[];
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    return getTrendingProducts(limit);
  }
}

// ========================================
// 5. MIXED RECOMMENDATIONS (For Homepage)
// ========================================
export async function getMixedRecommendations(userId?: string) {
  try {
    const [trending, personalized] = await Promise.all([
      getTrendingProducts(4),
      getPersonalizedRecommendations(userId, 4)
    ]);

    return {
      trending,
      personalized,
      similar: [], // Will be populated on product detail pages
      umkm: [] // Will be populated on UMKM detail pages
    };
  } catch (error) {
    console.error('Error in getMixedRecommendations:', error);
    return {
      trending: [],
      personalized: [],
      similar: [],
      umkm: []
    };
  }
}