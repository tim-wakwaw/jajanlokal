"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StatCard } from '@/app/components/ui/StatCard';
import { AdminSidebar } from '@/app/components/ui/AdminSidebar';
import { TrendingUMKMCard, ActivityItem } from '@/app/components/ui/DashboardCards';

interface DashboardStats {
  totalUMKM: number;
  activeUMKM: number;
  totalRevenue: string;
  averageRating: number;
  pendingRequests: number;
  totalReviews: number;
}

export default function EnhancedAdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUMKM: 0,
    activeUMKM: 0,
    totalRevenue: "0",
    averageRating: 0,
    pendingRequests: 0,
    totalReviews: 0
  });
  const [selectedTab, setSelectedTab] = useState('Semua');

  // Check admin access
  useEffect(() => {
    if (!loading && (!user || (profile?.role !== 'admin' && profile?.role !== 'super_admin'))) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch total UMKM
      const { count: totalUMKM } = await supabase
        .from('umkm_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch active UMKM (dengan produk)
      const { data: umkmWithProducts } = await supabase
        .from('umkm_requests')
        .select(`
          id,
          product_requests!inner(id, is_available)
        `)
        .eq('status', 'approved')
        .eq('product_requests.status', 'approved')
        .eq('product_requests.is_available', true);

      // Fetch pending requests
      const { count: pendingUMKM } = await supabase
        .from('umkm_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingProducts } = await supabase
        .from('product_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingFAQ } = await supabase
        .from('faq_questions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate mock revenue (you can replace with real data)
      const totalRevenue = (totalUMKM || 0) * 1500000; // Mock calculation

      setStats({
        totalUMKM: totalUMKM || 0,
        activeUMKM: umkmWithProducts?.length || 0,
        totalRevenue: `Rp ${(totalRevenue / 1000000).toFixed(1)}M`,
        averageRating: 4.7,
        pendingRequests: (pendingUMKM || 0) + (pendingProducts || 0) + (pendingFAQ || 0),
        totalReviews: 2847
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      title: 'Peta UMKM',
      href: '/peta-umkm',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      title: 'Direktori UMKM',
      href: '/admin/umkm-requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      badge: stats.pendingRequests
    },
    {
      title: 'Daftar UMKM',
      href: '/produk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ];

  const categories = [
    { name: 'Kuliner', count: 124, icon: '🍽️', color: 'text-orange-500' },
    { name: 'Fashion', count: 89, icon: '👕', color: 'text-purple-500' },
    { name: 'Jasa', count: 67, icon: '⚙️', color: 'text-green-500' },
    { name: 'Kerajinan', count: 45, icon: '🎨', color: 'text-pink-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <AdminSidebar menuItems={menuItems} categories={categories} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard UMKM</h1>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                Live
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari UMKM..."
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {stats.pendingRequests > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.pendingRequests}
                  </span>
                )}
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {profile?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {profile?.full_name?.[0] || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total UMKM"
              value={stats.totalUMKM.toLocaleString()}
              change="+12%"
              changeType="positive"
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              iconBg="bg-blue-100 dark:bg-blue-900/30"
            />

            <StatCard
              title="UMKM Aktif"
              value={stats.activeUMKM.toLocaleString()}
              change="+8%"
              changeType="positive"
              icon={
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              iconBg="bg-green-100 dark:bg-green-900/30"
            />

            <StatCard
              title="Total Omzet"
              value={stats.totalRevenue}
              change="+15%"
              changeType="positive"
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              iconBg="bg-purple-100 dark:bg-purple-900/30"
            />

            <StatCard
              title="Rating Rata-rata"
              value={stats.averageRating}
              change={`dari ${stats.totalReviews.toLocaleString()} review`}
              icon={
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
              iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            />
          </div>

          {/* Peta UMKM & UMKM Terpopuler */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Peta UMKM Interaktif */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Peta UMKM Interaktif</h2>
                <div className="flex gap-2">
                  {['Semua', 'Kuliner', 'Fashion'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTab === tab
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Placeholder untuk map */}
              <div className="relative h-80 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Peta interaktif akan muncul di sini</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UMKM Terpopuler */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">UMKM Terpopuler</h2>
              <div className="space-y-3">
                <TrendingUMKMCard
                  name="Warung Sate Bu Yani"
                  category="Kuliner"
                  rating={4.8}
                  trend="+24%"
                  trendType="up"
                  icon="🍽️"
                  iconBg="bg-orange-100 dark:bg-orange-900/30"
                />
                <TrendingUMKMCard
                  name="Batik Nusantara"
                  category="Fashion"
                  rating={4.6}
                  trend="+18%"
                  trendType="up"
                  icon="👕"
                  iconBg="bg-purple-100 dark:bg-purple-900/30"
                />
                <TrendingUMKMCard
                  name="Service Motor Jaya"
                  category="Jasa"
                  rating={4.9}
                  trend="+32%"
                  trendType="up"
                  icon="⚙️"
                  iconBg="bg-green-100 dark:bg-green-900/30"
                />
              </div>
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aktivitas Terbaru</h2>
            <div className="space-y-2">
              <ActivityItem
                title='UMKM baru "Kopi Kekinian" terdaftar'
                time="2 jam yang lalu"
                icon="➕"
                iconBg="bg-blue-100 dark:bg-blue-900/30"
              />
              <ActivityItem
                title='Review baru untuk "Bakso Malang"'
                time="4 jam yang lalu"
                icon="⭐"
                iconBg="bg-green-100 dark:bg-green-900/30"
              />
              <ActivityItem
                title='"Toko Elektronik" update profil'
                time="6 jam yang lalu"
                icon="✏️"
                iconBg="bg-purple-100 dark:bg-purple-900/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}