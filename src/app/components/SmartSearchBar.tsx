'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, MapPin, Filter } from 'lucide-react';
import { smartSearch } from '@/lib/smart-search';
import type { SearchOptions } from '@/lib/smart-search';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image: string;
  umkm: {
    name: string;
    category: string;
    alamat: string;
  };
  searchScore?: number;
  highlightedName?: string;
}

export default function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize search on mount
  useEffect(() => {
    smartSearch.initialize();
  }, []);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions(smartSearch.getSuggestions(''));
      return;
    }

    setIsSearching(true);

    try {
      // Build search options
      const options: SearchOptions = {
        maxResults: 10,
        sortBy
      };

      if (priceRange) options.priceRange = priceRange;
      if (selectedCategory) options.category = selectedCategory;
      if (minRating) options.minRating = minRating;

      // Perform search
      const searchResults = await smartSearch.search(searchQuery, options);
      setResults(searchResults as SearchResult[]);
      
      // Get suggestions
      const searchSuggestions = smartSearch.getSuggestions(searchQuery);
      setSuggestions(searchSuggestions);
      
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [sortBy, priceRange, selectedCategory, minRating]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSuggestions(smartSearch.getSuggestions(''));
    inputRef.current?.focus();
  };

  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            placeholder="Cari produk, UMKM, atau kategori..."
            className="w-full pl-12 pr-24 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     transition-all duration-200"
          />

          <div className="absolute right-2 flex items-center gap-2">
            {query && (
              <button
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
              aria-label="Toggle filters"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price-low' | 'price-high' | 'rating')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="relevance">Relevansi</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating Minimum
                  </label>
                  <select
                    value={minRating || ''}
                    onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Semua Rating</option>
                    <option value="4">⭐ 4.0+</option>
                    <option value="4.5">⭐ 4.5+</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="Cari kategori..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rentang Harga
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange?.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ 
                        min: Number(e.target.value), 
                        max: prev?.max || 1000000 
                      }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange?.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ 
                        min: prev?.min || 0, 
                        max: Number(e.target.value) 
                      }))}
                      className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (query || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     rounded-xl shadow-2xl max-h-96 overflow-y-auto"
          >
            {/* Loading State */}
            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2">Mencari...</p>
              </div>
            )}

            {/* Suggestions (when no query or no results) */}
            {!isSearching && suggestions.length > 0 && results.length === 0 && (
              <div className="p-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <TrendingUp size={16} />
                  {query ? 'Saran Pencarian' : 'Pencarian Populer'}
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                             text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {!isSearching && results.length > 0 && (
              <div className="p-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {results.length} produk ditemukan
                </div>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/produk/${result.id}`}
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {result.image && (
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium text-gray-900 dark:text-white truncate"
                          dangerouslySetInnerHTML={{ 
                            __html: result.highlightedName || result.name 
                          }}
                        />
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin size={14} />
                          <span className="truncate">{result.umkm.name}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(result.price)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.umkm.category}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isSearching && query && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium">Tidak ada hasil</p>
                <p className="text-sm mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
