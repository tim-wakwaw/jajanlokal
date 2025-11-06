"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import EnhancedProductCard from "./EnhancedProductCard";
import { ProductService } from "../../lib/productService";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  isAvailable: boolean;
  description?: string;
  umkmName: string;
  umkmId: string;
  category: string;
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await ProductService.getProductsPaginated({
          page: 1,
          limit: 8,
          sortBy: 'created_at' // Latest products
        });

        if (result.success && result.data) {
          setProducts(result.data);
          setTotalCount(result.totalCount || 0);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    //  Setup Realtime subscription for products table
    const { supabase } = require('@/lib/supabase');
    const channel = supabase
      .channel('homepage_products_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'products'
        },
        (payload: any) => {
          console.log('🔄 Homepage product changed:', payload)
          fetchProducts() // Refresh products
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Produk UMKM Lokal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-lg"
          >
            Temukan beragam produk berkualitas dari UMKM terpercaya di sekitar Anda
          </motion.p>
          
          {totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                {totalCount}+ Produk Tersedia
              </span>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 dark:bg-neutral-800 rounded-xl h-80"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EnhancedProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    stock={product.stock}
                    umkmName={product.umkmName}
                    umkmId={product.umkmId}
                    category={product.category}
                    description={product.description}
                    isAvailable={product.isAvailable}
                  />
                </motion.div>
              ))}
            </div>

            {/* See All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                href="/produk"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Lihat Semua Produk</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Belum ada produk
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              Produk akan muncul setelah admin menyetujui permintaan
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
