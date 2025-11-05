'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/OptimizedAuthContext'
import { supabase } from '../../../lib/supabase'
import { motion } from 'framer-motion'
import { 
  ClipboardDocumentListIcon, 
  ShoppingBagIcon, 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  pendingUmkm: number
  pendingProducts: number
  pendingFaq: number
  totalUsers: number
  approvedUmkm: number
  approvedProducts: number
}

interface PendingRequest {
  id: string
  name: string
  type: 'umkm' | 'product' | 'faq'
  created_at: string
  status: string
  user_email?: string
  priority?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    pendingUmkm: 0,
    pendingProducts: 0,
    pendingFaq: 0,
    totalUsers: 0,
    approvedUmkm: 0,
    approvedProducts: 0
  })
  const [recentRequests, setRecentRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      fetchDashboardData()
    }
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const [
        { count: pendingUmkm },
        { count: pendingProducts }, 
        { count: pendingFaq },
        { count: totalUsers },
        { count: approvedUmkm },
        { count: approvedProducts }
      ] = await Promise.all([
        supabase.from('umkm_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('product_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('faq_questions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('umkm_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('product_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      ])

      setStats({
        pendingUmkm: pendingUmkm || 0,
        pendingProducts: pendingProducts || 0,
        pendingFaq: pendingFaq || 0,
        totalUsers: totalUsers || 0,
        approvedUmkm: approvedUmkm || 0,
        approvedProducts: approvedProducts || 0
      })

      // Fetch recent requests
      const { data: umkmRequests } = await supabase
        .from('umkm_requests')
        .select('id, name, created_at, status, priority')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: productRequests } = await supabase
        .from('product_requests')
        .select('id, name, created_at, status, priority')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: faqRequests } = await supabase
        .from('faq_questions')
        .select('id, question, created_at, status, email')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      const faqRequestsArray = faqRequests || []
      
      const allRequests: PendingRequest[] = [
        ...(umkmRequests?.map(req => ({ ...req, type: 'umkm' as const })) || []),
        ...(productRequests?.map(req => ({ ...req, type: 'product' as const })) || []),
        ...faqRequestsArray.map(req => ({ 
          id: req.id,
          name: req.question,
          created_at: req.created_at,
          status: req.status,
          user_email: req.email,
          type: 'faq' as const, 
          priority: 1 
        }))
      ]

      setRecentRequests(allRequests.slice(0, 10))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirect jika bukan admin
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
          <p className="mb-4">Silakan login terlebih dahulu</p>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
          <p className="mb-4">Anda tidak memiliki izin untuk mengakses halaman admin</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    subtitle?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '100')} dark:${color.replace('text', 'bg').replace('600', '900')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  )

  const RequestItem = ({ request }: { request: PendingRequest }) => {
    const getIcon = () => {
      switch (request.type) {
        case 'umkm': return ClipboardDocumentListIcon
        case 'product': return ShoppingBagIcon
        case 'faq': return QuestionMarkCircleIcon
        default: return ClockIcon
      }
    }

    const getTypeLabel = () => {
      switch (request.type) {
        case 'umkm': return 'UMKM'
        case 'product': return 'Produk'
        case 'faq': return 'FAQ'
        default: return 'Unknown'
      }
    }

    const Icon = getIcon()

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {request.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
              {getTypeLabel()}
            </span>
            <span>{new Date(request.created_at).toLocaleDateString('id-ID')}</span>
            {request.user_email && <span>• {request.user_email}</span>}
          </div>
        </div>
        {request.priority && request.priority > 1 && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs">
            Prioritas
          </div>
        )}
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
            Memuat dashboard admin...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selamat datang, {profile?.full_name || profile?.email}! Kelola permintaan UMKM, produk, dan FAQ di sini.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Permintaan UMKM"
              value={stats.pendingUmkm}
              icon={ClipboardDocumentListIcon}
              color="text-blue-600"
              subtitle={`${stats.approvedUmkm} disetujui`}
            />
            <StatCard
              title="Permintaan Produk"
              value={stats.pendingProducts}
              icon={ShoppingBagIcon}
              color="text-green-600"
              subtitle={`${stats.approvedProducts} disetujui`}
            />
            <StatCard
              title="Pertanyaan FAQ"
              value={stats.pendingFaq}
              icon={QuestionMarkCircleIcon}
              color="text-purple-600"
            />
            <StatCard
              title="Total Pengguna"
              value={stats.totalUsers}
              icon={UserGroupIcon}
              color="text-orange-600"
            />
            <StatCard
              title="UMKM Aktif"
              value={stats.approvedUmkm}
              icon={CheckCircleIcon}
              color="text-emerald-600"
            />
            <StatCard
              title="Produk Aktif"
              value={stats.approvedProducts}
              icon={ChartBarIcon}
              color="text-indigo-600"
            />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/umkm-requests')}
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
              >
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Kelola UMKM</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingUmkm} pending</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/product-requests')}
                className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
              >
                <ShoppingBagIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Kelola Produk</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingProducts} pending</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/faq-management')}
                className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors"
              >
                <QuestionMarkCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Kelola FAQ</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.pendingFaq} pending</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/blog-management')}
                className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-lg transition-colors"
              >
                <NewspaperIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Kelola Blog</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Buat artikel baru</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Recent Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Permintaan Terbaru
              </h2>
              <button
                onClick={fetchDashboardData}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Refresh
              </button>
            </div>
            
            {recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <RequestItem key={`${request.type}-${request.id}`} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Tidak ada permintaan pending saat ini
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}