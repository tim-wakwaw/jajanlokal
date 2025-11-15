"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Phone, Clock, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LazyImage from "../../components/LazyImage";
import UMKMDetailProduct from "../../components/UMKMDetailProduct";
import UMKMDetailReview from "../../components/UMKMDetailReview";
import { SimilarUMKM } from "../../components/RecommendationSection";
import { UMKM } from "../../components/UMKMDetailCard";

interface UMKMDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  address?: string;
  alamat?: string; // Support both naming conventions
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  lat: number;
  lng: number;
  rating: number;
  image?: string;
  image_url?: string;
  created_at: string;
  is_verified?: boolean;
  business_hours?: string;
  comments?: Array<{
    user: string;
    text: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    is_available?: boolean;
    stock?: number;
  }>;
}

export default function UMKMDetailPage() {
  const params = useParams();
  const umkmId = params.id as string;
  
  const [umkm, setUmkm] = useState<UMKMDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews' | 'similar'>('overview');

  useEffect(() => {
    const fetchUMKM = async () => {
      try {
        const { data, error } = await supabase
          .from('umkm')
          .select(`
            *,
            products (
              id, name, price, image_url, description, is_available, stock
            )
          `)
          .eq('id', umkmId)
          .single();

        if (error) throw error;
        setUmkm(data);
      } catch (error) {
        console.error('Error fetching UMKM:', error);
      } finally {
        setLoading(false);
      }
    };

    if (umkmId) {
      fetchUMKM();
    }
  }, [umkmId]);

  // Helper function to convert UMKMDetail to UMKM format
  const convertToUMKM = (umkmDetail: UMKMDetail): UMKM => ({
    ...umkmDetail,
    alamat: umkmDetail.address || umkmDetail.alamat || '',
    comments: umkmDetail.comments || [],
    image: umkmDetail.image_url || umkmDetail.image,
    products: (umkmDetail.products || []).map(product => ({
      ...product,
      stock: product.stock ?? 0,  // Provide default value for undefined stock
      is_available: product.is_available ?? true,  // Provide default value
      image: product.image_url  // Only use image_url since product.image doesn't exist
    }))
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            UMKM Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            UMKM yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link 
            href="/peta-umkm"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Peta UMKM
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/peta-umkm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Peta UMKM
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {umkm.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link 
            href="/peta-umkm"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Peta UMKM
          </Link>
        </motion.div>

        {/* UMKM Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* UMKM Image */}
            <div className="lg:col-span-2">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                {umkm.image_url ? (
                  <LazyImage
                    src={umkm.image_url}
                    alt={umkm.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Globe className="w-8 h-8" />
                      </div>
                      <p>Tidak ada gambar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* UMKM Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {umkm.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {umkm.category}
                  </span>
                  {umkm.is_verified && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      ✓ Terverifikasi
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white">{umkm.rating}</span>
                <span className="text-gray-600 dark:text-gray-400">/ 5.0</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{umkm.address || umkm.alamat}</span>
                </div>
                
                {umkm.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{umkm.phone}</span>
                  </div>
                )}

                {umkm.business_hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{umkm.business_hours}</span>
                  </div>
                )}
              </div>

              {umkm.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Deskripsi
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {umkm.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Produk ({umkm.products?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Review
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'similar'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                UMKM Serupa
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Tentang {umkm.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {umkm.description || 'Belum ada deskripsi untuk UMKM ini.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Informasi Kontak
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Email:</strong> {umkm.email || 'Tidak tersedia'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Telepon:</strong> {umkm.phone || 'Tidak tersedia'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Website:</strong> {umkm.website || 'Tidak tersedia'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Statistik
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Produk:</strong> {umkm.products?.length || 0} produk
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Rating:</strong> {umkm.rating}/5.0
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Bergabung:</strong> {new Date(umkm.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UMKMDetailProduct umkm={convertToUMKM(umkm)} />
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UMKMDetailReview umkm={convertToUMKM(umkm)} />
              </motion.div>
            )}

            {activeTab === 'similar' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SimilarUMKM 
                  umkmId={umkm.id.toString()}
                  title="UMKM Serupa di Area Anda"
                  className="bg-transparent"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}