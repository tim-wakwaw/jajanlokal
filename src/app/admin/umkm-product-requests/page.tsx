'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '../../../contexts/OptimizedAuthContext'
import { supabase } from '../../../lib/supabase'
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../../lib/sweetalert'
import { motion } from 'framer-motion'

interface UMKMRequest {
  id: string
  name: string
  image_url: string
  alamat: string
  category: string
  lat: number | null
  lng: number | null
  description: string
  user_email: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

interface ProductRequest {
  id: string
  umkm_name: string
  product_name: string
  price: number
  image_url: string
  description: string
  category: string
  user_email: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default function UMKMProductRequestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'umkm' | 'product'>('umkm')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const [umkmRequests, setUmkmRequests] = useState<UMKMRequest[]>([])
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<UMKMRequest | ProductRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<UMKMRequest | ProductRequest>>({})

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchRequests()

    // Setup Realtime subscriptions for instant updates
    const umkmChannel = supabase
      .channel('umkm_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'umkm_requests'
        },
        (payload) => {
          console.log('🔄 UMKM Request changed:', payload)
          fetchRequests() // Refresh data
        }
      )
      .subscribe()

    const productChannel = supabase
      .channel('product_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_requests'
        },
        (payload) => {
          console.log('🔄 Product Request changed:', payload)
          fetchRequests() // Refresh data
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(umkmChannel)
      supabase.removeChannel(productChannel)
    }
  }, [user, router])

  const fetchRequests = async () => {
    try {
      setLoading(true)

      // Fetch UMKM requests
      const { data: umkmData, error: umkmError } = await supabase
        .from('umkm_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (umkmError) throw umkmError

      // Fetch Product requests
      const { data: productData, error: productError } = await supabase
        .from('product_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (productError) throw productError

      setUmkmRequests(umkmData || [])
      setProductRequests(productData || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      showErrorAlert('Error', 'Gagal memuat data permintaan')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', type: 'umkm' | 'product') => {
    const result = await showConfirmAlert(
      `${status === 'approved' ? 'Setujui' : 'Tolak'} Permintaan`,
      `Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} permintaan ini?`
    )

    if (!result.isConfirmed) return

    try {
      const table = type === 'umkm' ? 'umkm_requests' : 'product_requests'
      
      // Update request status
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      // If approved, copy to main table
      if (status === 'approved' && selectedRequest) {
        if (type === 'umkm') {
          const umkmData = selectedRequest as UMKMRequest
          console.log('📍 Copying UMKM to main table:', umkmData.name)
          
          const { data: insertedData, error: insertError } = await supabase
            .from('umkm')
            .upsert({
              id: umkmData.id,
              name: umkmData.name,
              image: umkmData.image_url,
              alamat: umkmData.alamat,
              category: umkmData.category,
              lat: umkmData.lat,
              lng: umkmData.lng,
              description: umkmData.description,
              rating: 4.5
            }, {
              onConflict: 'id'
            })
            .select()

          if (insertError) {
            console.error('❌ Error copying to umkm:', insertError)
            console.error('❌ Error code:', insertError.code)
            console.error('❌ Error message:', insertError.message)
            console.error('❌ Error details:', insertError.details)
            console.error('❌ Error hint:', insertError.hint)
            await showErrorAlert(`Gagal copy ke tabel umkm: ${insertError.message}`)
          } else {
            console.log('✅ UMKM copied successfully:', insertedData)
            await showSuccessAlert('UMKM berhasil dicopy ke tabel utama!')
          }
        } else {
          const productData = selectedRequest as ProductRequest
          console.log('Copying Product to main table:', productData.product_name)
          
          // First, find or create the UMKM
          const { data: umkmData } = await supabase
            .from('umkm')
            .select('id')
            .eq('name', productData.umkm_name)
            .single()

          let umkmId = umkmData?.id

          // If UMKM doesn't exist, create it
          if (!umkmId) {
            console.log('🏪 UMKM not found, creating new UMKM:', productData.umkm_name)
            const { data: newUmkm, error: createError } = await supabase
              .from('umkm')
              .insert({
                name: productData.umkm_name,
                alamat: 'Belum diset',
                category: productData.category,
                description: `UMKM untuk ${productData.umkm_name}`,
                rating: 4.5
              })
              .select('id')
              .single()

            if (createError) {
              console.error('Error creating UMKM:', createError)
              throw createError
            }
            umkmId = newUmkm.id
            console.log('UMKM created with ID:', umkmId)
          } else {
            console.log('Found existing UMKM with ID:', umkmId)
          }

          // Insert product
          const { data: insertedProduct, error: insertError } = await supabase
            .from('products')
            .upsert({
              id: productData.id,
              umkm_id: umkmId,
              name: productData.product_name,
              price: productData.price,
              image: productData.image_url,
              description: productData.description,
              stock: 999,
              is_available: true
            }, {
              onConflict: 'id'
            })
            .select()

          if (insertError) {
            console.error('Error copying to products:', insertError)
          } else {
            console.log('Product copied successfully:', insertedProduct)
          }
        }
      }

      showSuccessAlert('Berhasil!', `Permintaan ${status === 'approved' ? 'disetujui' : 'ditolak'}${status === 'approved' ? ' dan data sudah ditambahkan' : ''}`)
      setSelectedRequest(null)
      setAdminNotes('')
      fetchRequests()
    } catch (error) {
      console.error('Error updating status:', error)
      showErrorAlert('Error', 'Gagal mengupdate status permintaan')
    }
  }

  const handleDelete = async (id: string, type: 'umkm' | 'product') => {
    try {
      const requestTable = type === 'umkm' ? 'umkm_requests' : 'product_requests'
      const mainTable = type === 'umkm' ? 'umkm' : 'products'
      
      console.log(`🗑️ Attempting to delete ${type} with ID:`, id)
      
      // Check if request exists and its status
      const { data: requestData, error: requestCheckError } = await supabase
        .from(requestTable)
        .select('status')
        .eq('id', id)
        .single()
      
      if (requestCheckError) {
        console.error('Error checking request:', requestCheckError)
        throw requestCheckError
      }
      
      console.log('📋 Request status:', requestData?.status)
      
      // If approved, check if data exists in main table
      let mainDataExists = false
      if (requestData?.status === 'approved') {
        const { data: mainData, error: mainCheckError } = await supabase
          .from(mainTable)
          .select('id')
          .eq('id', id)
          .single()
        
        mainDataExists = !!mainData && !mainCheckError
        console.log(`📋 Data exists in ${mainTable}:`, mainDataExists)
        
        // If UMKM, check how many products are attached
        if (type === 'umkm' && mainDataExists) {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact' })
            .eq('umkm_id', id)
          
          console.log(`📦 Products attached to UMKM:`, count)
          
          if (count && count > 0) {
            const confirmProducts = await showConfirmAlert(
              'Hapus UMKM dan Produk',
              `UMKM ini memiliki ${count} produk. Semua produk juga akan dihapus. Lanjutkan?`
            )
            
            if (!confirmProducts.isConfirmed) return
          }
        }
      }
      
      // Final confirmation
      const result = await showConfirmAlert(
        'Hapus Permintaan',
        `Apakah Anda yakin ingin menghapus permintaan ini?${mainDataExists ? ' Data di tabel utama juga akan dihapus.' : ''}`
      )

      if (!result.isConfirmed) return
      
      // Delete from main table if approved (using same ID because of upsert)
      if (mainDataExists) {
        console.log(`🗑️ Deleting from ${mainTable} table...`)
        const { error: mainError } = await supabase
          .from(mainTable)
          .delete()
          .eq('id', id)
        
        if (mainError) {
          console.error(`❌ Error deleting from ${mainTable}:`, mainError)
          // If it's a foreign key violation, try to give better error message
          if (mainError.code === '23503') {
            showErrorAlert('Error', 'Tidak bisa menghapus karena masih ada data terkait. Hapus produk terlebih dahulu.')
            return
          }
          throw mainError
        }
        console.log(`✅ Deleted from ${mainTable}`)
      }
      
      // Delete from request table
      console.log(`🗑️ Deleting from ${requestTable} table...`)
      const { error: requestError } = await supabase
        .from(requestTable)
        .delete()
        .eq('id', id)

      if (requestError) {
        console.error(`❌ Error deleting from ${requestTable}:`, requestError)
        throw requestError
      }

      console.log(`✅ Successfully deleted request ID: ${id}`)
      showSuccessAlert('Berhasil!', 'Permintaan dan data terkait berhasil dihapus')
      setSelectedRequest(null)
      fetchRequests()
    } catch (error) {
      console.error('❌ Error deleting request:', error)
      showErrorAlert('Error', `Gagal menghapus permintaan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (request: UMKMRequest | ProductRequest) => {
    setEditData(request)
    setEditMode(true)
    setSelectedRequest(request)
  }

  const handleUpdate = async () => {
    if (!editData || !selectedRequest) return

    try {
      const isProduct = 'umkm_name' in editData
      const requestTable = isProduct ? 'product_requests' : 'umkm_requests'
      
      // Update request table
      const { error: requestError } = await supabase
        .from(requestTable)
        .update(editData)
        .eq('id', selectedRequest.id)

      if (requestError) throw requestError

      // If status is approved, also update main table
      if (selectedRequest.status === 'approved') {
        if (isProduct) {
          // Update product in main table
          const productData = editData as ProductRequest
          const { error: mainError } = await supabase
            .from('products')
            .update({
              name: productData.product_name,
              price: productData.price,
              image: productData.image_url,
              description: productData.description,
              stock: 999,
              is_available: true
            })
            .eq('id', selectedRequest.id)
          
          if (mainError) {
            console.log('Main table update error:', mainError)
          } else {
            console.log('✅ Updated product in main table')
          }
        } else {
          // Update UMKM in main table
          const umkmData = editData as UMKMRequest
          const { error: mainError } = await supabase
            .from('umkm')
            .update({
              name: umkmData.name,
              image: umkmData.image_url,
              alamat: umkmData.alamat,
              category: umkmData.category,
              lat: umkmData.lat,
              lng: umkmData.lng,
              description: umkmData.description
            })
            .eq('id', selectedRequest.id)
          
          if (mainError) {
            console.log('Main table update error:', mainError)
          } else {
            console.log('✅ Updated UMKM in main table')
          }
        }
      }

      showSuccessAlert('Berhasil!', 'Permintaan dan data terkait berhasil diupdate')
      setEditMode(false)
      setSelectedRequest(null)
      setEditData({})
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      showErrorAlert('Error', 'Gagal mengupdate permintaan')
    }
  }

  const filteredUmkmRequests = umkmRequests.filter(req => 
    filterStatus === 'all' ? true : req.status === filterStatus
  )

  const filteredProductRequests = productRequests.filter(req => 
    filterStatus === 'all' ? true : req.status === filterStatus
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kelola Permintaan UMKM & Produk
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review dan kelola permintaan dari pengguna
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Kembali
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('umkm')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'umkm'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🏪 UMKM ({umkmRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'product'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🛍️ Produk ({productRequests.length})
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'Semua' : status === 'pending' ? 'Pending' : status === 'approved' ? 'Disetujui' : 'Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {/* UMKM Requests */}
        {activeTab === 'umkm' && (
          <div className="space-y-4">
            {filteredUmkmRequests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Tidak ada permintaan UMKM</p>
              </div>
            ) : (
              filteredUmkmRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                      {request.image_url ? (
                        <Image
                          src={request.image_url}
                          alt={`Gambar ${request.name}`}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📷
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {request.name}
                          </h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Kategori:</strong> {request.category}</p>
                        <p><strong>Alamat:</strong> {request.alamat}</p>
                        {request.lat && request.lng && (
                          <p><strong>Koordinat:</strong> {request.lat}, {request.lng}</p>
                        )}
                        <p><strong>Deskripsi:</strong> {request.description}</p>
                        <p><strong>Email Pengirim:</strong> {request.user_email}</p>
                        <p><strong>Tanggal:</strong> {new Date(request.created_at).toLocaleString('id-ID')}</p>
                        {request.admin_notes && (
                          <p className="text-orange-600 dark:text-orange-400">
                            <strong>Catatan Admin:</strong> {request.admin_notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(request)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(request.id, 'umkm')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Product Requests */}
        {activeTab === 'product' && (
          <div className="space-y-4">
            {filteredProductRequests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Tidak ada permintaan produk</p>
              </div>
            ) : (
              filteredProductRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                      {request.image_url ? (
                        <Image
                          src={request.image_url}
                          alt={`Gambar ${request.product_name}`}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {request.product_name}
                          </h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>UMKM:</strong> {request.umkm_name}</p>
                        <p><strong>Harga:</strong> Rp {request.price.toLocaleString('id-ID')}</p>
                        <p><strong>Kategori:</strong> {request.category}</p>
                        <p><strong>Deskripsi:</strong> {request.description}</p>
                        <p><strong>Email Pengirim:</strong> {request.user_email}</p>
                        <p><strong>Tanggal:</strong> {new Date(request.created_at).toLocaleString('id-ID')}</p>
                        {request.admin_notes && (
                          <p className="text-orange-600 dark:text-orange-400">
                            <strong>Catatan Admin:</strong> {request.admin_notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(request)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(request.id, 'product')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Review/Edit Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editMode ? 'Edit Permintaan' : 'Review Permintaan'}
              </h3>

              {editMode ? (
                /* Edit Form */
                <div className="space-y-4">
                  {/* UMKM Fields */}
                  {'alamat' in editData && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nama UMKM</label>
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Alamat</label>
                        <input
                          type="text"
                          value={editData.alamat || ''}
                          onChange={(e) => setEditData({...editData, alamat: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kategori</label>
                        <input
                          type="text"
                          value={editData.category || ''}
                          onChange={(e) => setEditData({...editData, category: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deskripsi</label>
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </>
                  )}

                  {/* Product Fields */}
                  {'umkm_name' in editData && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nama UMKM</label>
                        <input
                          type="text"
                          value={(editData as ProductRequest).umkm_name || ''}
                          onChange={(e) => setEditData({...editData, umkm_name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nama Produk</label>
                        <input
                          type="text"
                          value={(editData as ProductRequest).product_name || ''}
                          onChange={(e) => setEditData({...editData, product_name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Harga</label>
                        <input
                          type="number"
                          value={(editData as ProductRequest).price || 0}
                          onChange={(e) => setEditData({...editData, price: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kategori</label>
                        <input
                          type="text"
                          value={editData.category || ''}
                          onChange={(e) => setEditData({...editData, category: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deskripsi</label>
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setSelectedRequest(null)
                        setEditData({})
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* Review Form */
                <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan Admin (Opsional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tambahkan catatan jika perlu..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(
                    selectedRequest.id,
                    'approved',
                    'umkm_name' in selectedRequest ? 'product' : 'umkm'
                  )}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  ✓ Setujui
                </button>
                <button
                  onClick={() => handleUpdateStatus(
                    selectedRequest.id,
                    'rejected',
                    'umkm_name' in selectedRequest ? 'product' : 'umkm'
                  )}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  ✗ Tolak
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null)
                    setAdminNotes('')
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
              </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
