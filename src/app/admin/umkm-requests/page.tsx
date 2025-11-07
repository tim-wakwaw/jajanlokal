'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../../contexts/OptimizedAuthContext'
import { supabase } from '../../../lib/supabase'
import { motion } from 'framer-motion'
import { showSuccessAlert, showErrorAlert } from '../../../lib/sweetalert'
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface UMKMRequest {
  id: string
  name: string
  category: string
  description: string
  alamat: string
  lat?: number
  lng?: number
  image_url?: string
  status: string
  user_email: string
  user_id: string
  admin_notes?: string
  created_at: string
  updated_at?: string
}

export default function UMKMRequestsPage() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState<UMKMRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<UMKMRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('umkm_requests')
        .select('*')

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      showErrorAlert('Failed to load UMKM requests. Please try again.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      fetchRequests()
    }
  }, [profile, fetchRequests])

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('umkm_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      showSuccessAlert('Berhasil!', 'Permintaan UMKM telah disetujui')
      fetchRequests()
      setSelectedRequest(null)
      
    } catch (error) {
      console.error('Error approving request:', error)
      showErrorAlert('Error', 'Gagal menyetujui permintaan')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('umkm_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      showSuccessAlert('Berhasil!', 'Permintaan UMKM telah ditolak')
      fetchRequests()
      setSelectedRequest(null)
      
    } catch (error) {
      console.error('Error rejecting request:', error)
      showErrorAlert('Error', 'Gagal menolak permintaan')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Disetujui' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Ditolak' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const RequestCard = ({ request }: { request: UMKMRequest }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {request.name}
            </h3>
            {getStatusBadge(request.status)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Kategori: <span className="font-medium">{request.category}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Pengaju: <span className="font-medium">{request.user_email}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tanggal: {new Date(request.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        
        {request.image_url && (
          <Image 
            src={request.image_url} 
            alt={request.name}
            width={80}
            height={80}
            className="object-cover rounded-lg ml-4"
          />
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {request.description}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRequest(request)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <EyeIcon className="w-4 h-4" />
          Detail
        </button>

        {request.status === 'pending' && (
          <>
            <button
              onClick={() => handleApprove(request.id)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Setujui
            </button>

            <button
              onClick={() => handleReject(request.id)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <XCircleIcon className="w-4 h-4" />
              Tolak
            </button>
          </>
        )}
      </div>
    </motion.div>
  )

  // Check authorization
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'moderator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Akses Ditolak</h2>
          <p className="text-gray-600 dark:text-gray-400">Anda tidak memiliki izin untuk mengakses halaman ini</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Kelola Permintaan UMKM
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review dan kelola permintaan pendaftaran UMKM baru
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
          >
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Filter:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'Semua' : 
                   status === 'pending' ? 'Pending' :
                   status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </button>
              ))}
              <div className="ml-auto">
                <button
                  onClick={fetchRequests}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Requests Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tidak ada permintaan
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada permintaan UMKM untuk status {filter}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detail Permintaan UMKM
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama UMKM
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deskripsi
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alamat
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.alamat}</p>
                </div>

                {selectedRequest.lat && selectedRequest.lng && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Koordinat
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedRequest.lat}, {selectedRequest.lng}
                    </p>
                  </div>
                )}

                {selectedRequest.image_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gambar
                    </label>
                    <Image 
                      src={selectedRequest.image_url} 
                      alt={selectedRequest.name}
                      width={600}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pengaju
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRequest.user_email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Pengajuan
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedRequest.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Setujui Permintaan
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Tolak Permintaan
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}