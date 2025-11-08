import Fuse from 'fuse.js';
import type { FuseResult, FuseResultMatch } from 'fuse.js';
import { supabase } from './supabase';

// ========================================
// TYPES & INTERFACES
// ========================================

interface SearchableProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  is_available: boolean;
  umkm_id: string;
  umkm: {
    id: string;
    name: string;
    category: string;
    alamat: string;
    lat?: number;
    lng?: number;
    rating: number;
  };
}

interface SearchResult extends SearchableProduct {
  searchScore?: number;
  matches?: readonly FuseResultMatch[];
  highlightedName?: string;
}

interface SearchOptions {
  maxResults?: number;
  priceRange?: { min: number; max: number };
  category?: string;
  minRating?: number;
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating';
}

export type { SearchableProduct, SearchResult, SearchOptions };

// ========================================
// SMART SEARCH CLASS
// ========================================

export class SmartSearch {
  private fuse: Fuse<SearchableProduct> | null = null;
  private products: SearchableProduct[] = [];
  private lastFetchTime: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initialize();
  }

  /**
   * Initialize search engine by fetching products from database
   */
  async initialize(forceRefresh: boolean = false): Promise<void> {
    const now = Date.now();
    
    // Use cached data if available and not expired
    if (!forceRefresh && this.fuse && (now - this.lastFetchTime) < this.cacheTimeout) {
      console.log('📦 Using cached search data');
      return;
    }

    try {
      console.log('🔄 Fetching products for search...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image,
          stock,
          is_available,
          umkm_id,
          umkm (
            id,
            name,
            category,
            alamat,
            lat,
            lng,
            rating
          )
        `)
        .eq('is_available', true);

      if (error) throw error;

      this.products = (data || []).map(product => ({
        ...product,
        umkm: Array.isArray(product.umkm) ? product.umkm[0] : product.umkm
      })) as SearchableProduct[];

      // Configure Fuse.js with intelligent weights
      this.fuse = new Fuse(this.products, {
        keys: [
          { name: 'name', weight: 0.4 },              // Product name highest priority
          { name: 'umkm.name', weight: 0.3 },         // UMKM name second
          { name: 'umkm.category', weight: 0.15 },    // Category third
          { name: 'description', weight: 0.1 },       // Description
          { name: 'umkm.alamat', weight: 0.05 }       // Location lowest
        ],
        threshold: 0.4,           // 0.0 = perfect match, 1.0 = match anything
        includeScore: true,       // Include relevance score
        includeMatches: true,     // Include matched text positions
        minMatchCharLength: 2,    // Minimum characters to match
        ignoreLocation: true,     // Search in entire text
        useExtendedSearch: false, // Enable for advanced queries
      });

      this.lastFetchTime = now;
      console.log(`✅ Search initialized with ${this.products.length} products`);
      
    } catch (error) {
      console.error('❌ Error initializing search:', error);
      throw error;
    }
  }

  /**
   * Perform fuzzy search with advanced filtering
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const {
      maxResults = 20,
      priceRange,
      category,
      minRating,
      sortBy = 'relevance'
    } = options;

    // Perform fuzzy search
    let results = this.fuse.search(query.trim());

    // Apply price filter
    if (priceRange) {
      results = results.filter(result => {
        const price = result.item.price;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Apply category filter
    if (category) {
      results = results.filter(result =>
        result.item.umkm.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply rating filter
    if (minRating) {
      results = results.filter(result =>
        result.item.umkm.rating >= minRating
      );
    }

    // Sort results
    const sortedResults = this.sortResults(results, sortBy);

    // Limit results and format
    return sortedResults.slice(0, maxResults).map(result => ({
      ...result.item,
      searchScore: result.score,
      matches: result.matches,
      highlightedName: this.highlightMatches(result.item.name, result.matches)
    }));
  }

  /**
   * Sort search results
   */
  private sortResults(
    results: FuseResult<SearchableProduct>[],
    sortBy: SearchOptions['sortBy']
  ): FuseResult<SearchableProduct>[] {
    switch (sortBy) {
      case 'price-low':
        return results.sort((a, b) => a.item.price - b.item.price);
      
      case 'price-high':
        return results.sort((a, b) => b.item.price - a.item.price);
      
      case 'rating':
        return results.sort((a, b) => b.item.umkm.rating - a.item.umkm.rating);
      
      case 'relevance':
      default:
        return results; // Already sorted by relevance
    }
  }

  /**
   * Highlight matched text in search results
   */
  private highlightMatches(text: string, matches?: readonly FuseResultMatch[]): string {
    if (!matches || matches.length === 0) return text;

    // Find matches for the 'name' field
    const nameMatches = matches.find(m => m.key === 'name');
    if (!nameMatches || !nameMatches.indices) return text;

    // Build highlighted string
    let highlightedText = '';
    let lastIndex = 0;

    nameMatches.indices.forEach(([start, end]: [number, number]) => {
      // Add text before match
      highlightedText += text.substring(lastIndex, start);
      // Add highlighted match
      highlightedText += `<mark class="bg-yellow-200 dark:bg-yellow-600">${text.substring(start, end + 1)}</mark>`;
      lastIndex = end + 1;
    });

    // Add remaining text
    highlightedText += text.substring(lastIndex);

    return highlightedText;
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(query: string, maxSuggestions: number = 5): string[] {
    if (!query.trim() || query.length < 2) {
      return this.getPopularSearchTerms();
    }

    // Get unique product and UMKM names that match
    const suggestions = new Set<string>();

    this.products.forEach(product => {
      const lowerQuery = query.toLowerCase();
      
      // Check product name
      if (product.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.name);
      }
      
      // Check UMKM name
      if (product.umkm.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.umkm.name);
      }
      
      // Check category
      if (product.umkm.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.umkm.category);
      }
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Get popular search terms
   */
  private getPopularSearchTerms(): string[] {
    return [
      'Nasi Gudeg',
      'Bakso',
      'Sate Ayam',
      'Gado-gado',
      'Rujak',
      'Es Campur',
      'Martabak',
      'Keripik'
    ];
  }

  /**
   * Search by category
   */
  async searchByCategory(category: string): Promise<SearchResult[]> {
    if (!this.products.length) {
      await this.initialize();
    }

    return this.products
      .filter(product => 
        product.umkm.category.toLowerCase().includes(category.toLowerCase())
      )
      .map(product => ({
        ...product,
        searchScore: 1.0 // Perfect match for category
      }));
  }

  /**
   * Search by location (nearby products)
   */
  async searchNearby(
    userLocation: { lat: number; lng: number },
    radiusKm: number = 5,
    query?: string
  ): Promise<SearchResult[]> {
    if (!this.products.length) {
      await this.initialize();
    }

    // Filter products by distance
    const nearbyProducts = this.products.filter(product => {
      if (!product.umkm.lat || !product.umkm.lng) return false;

      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        product.umkm.lat,
        product.umkm.lng
      );

      return distance <= radiusKm;
    });

    // If query provided, search within nearby products
    if (query && query.trim()) {
      const nearbyFuse = new Fuse(nearbyProducts, {
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'umkm.name', weight: 0.3 },
          { name: 'umkm.category', weight: 0.2 }
        ],
        threshold: 0.4,
        includeScore: true
      });

      return nearbyFuse.search(query).map(result => ({
        ...result.item,
        searchScore: result.score
      }));
    }

    // Return all nearby products
    return nearbyProducts.map(product => ({
      ...product,
      searchScore: 1.0
    }));
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get search statistics
   */
  getStats() {
    return {
      totalProducts: this.products.length,
      categories: Array.from(new Set(this.products.map(p => p.umkm.category))),
      umkmCount: Array.from(new Set(this.products.map(p => p.umkm.id))).length,
      lastUpdated: new Date(this.lastFetchTime).toISOString()
    };
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

// Create and export singleton instance
export const smartSearch = new SmartSearch();
