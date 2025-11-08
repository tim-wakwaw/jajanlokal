import { supabase } from './supabase';

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
// 1. CONTENT-BASED FILTERING
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
      console.error('Reference product not found:', refError);
      return [];
    }

    // Find similar products from the same UMKM first
    const { data: sameUmkmProducts, error: sameUmkmError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .eq('umkm_id', referenceProduct.umkm_id)
      .neq('id', productId)
      .eq('is_available', true)
      .limit(2);

    if (sameUmkmError) {
      console.error('Same UMKM products error:', sameUmkmError);
    }

    // Find products in similar price range from other UMKMs
    const priceRange = referenceProduct.price * 0.3; // 30% price range
    const { data: similarPriceProducts, error: priceError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .neq('umkm_id', referenceProduct.umkm_id)
      .gte('price', referenceProduct.price - priceRange)
      .lte('price', referenceProduct.price + priceRange)
      .eq('is_available', true)
      .limit(limit);

    if (priceError) {
      console.error('Similar price products error:', priceError);
    }

    // Combine and deduplicate results
    const allSimilar = [
      ...(sameUmkmProducts || []),
      ...(similarPriceProducts || [])
    ];

    // Remove duplicates and limit results
    const uniqueProducts = allSimilar
      .filter((product, index, self) => 
        self.findIndex(p => p.id === product.id) === index
      )
      .slice(0, limit);

    return uniqueProducts as ProductWithUMKM[];
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    return [];
  }
}

// ========================================
// 2. COLLABORATIVE FILTERING (UMKM-based)
// ========================================
export async function getSimilarUMKM(umkmId: string, limit: number = 4): Promise<ProductWithUMKM[]> {
  try {
    console.log('🏪 Starting getSimilarUMKM for:', umkmId);
    
    // Get the reference UMKM
    const { data: referenceUMKM, error: refError } = await supabase
      .from('umkm')
      .select('*')
      .eq('id', umkmId)
      .single();

    if (refError || !referenceUMKM) {
      console.error('🏪 Reference UMKM not found:', refError);
      return [];
    }

    console.log('🏪 Reference UMKM:', referenceUMKM.name, 'Category:', referenceUMKM.category);

    // Find products from UMKMs in the same category (excluding current UMKM)
    const { data: similarProducts, error: similarError } = await supabase
      .from('products')
      .select(`
        *,
        umkm (*)
      `)
      .eq('is_available', true)
      .neq('umkm_id', umkmId)
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Get more to filter by category

    if (similarError) {
      console.error('🏪 Similar products error:', similarError);
      return [];
    }

    // Filter by same category and prioritize by UMKM rating
    const filteredProducts = (similarProducts || [])
      .filter(product => product.umkm?.category === referenceUMKM.category)
      .sort((a, b) => (b.umkm?.rating || 0) - (a.umkm?.rating || 0))
      .slice(0, limit);

    console.log('🏪 Found similar products:', filteredProducts.map(p => `${p.name} (${p.umkm?.name})`));

    return filteredProducts as ProductWithUMKM[];
  } catch (error) {
    console.error('Error in getSimilarUMKM:', error);
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