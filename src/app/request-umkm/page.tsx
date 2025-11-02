'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import { showSuccessAlert, showErrorAlert } from '../../lib/sweetalert'

export default function RequestUMKMPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    image_url: ''
  })

  const categories = [
    'Makanan & Minuman',
    'Fashion & Pakaian',
    'Kerajinan Tangan',
    'Elektronik',
    'Kecantikan & Kesehatan',
    'Pertanian',
    'Jasa',
    'Lainnya'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showErrorAlert('Error', 'Anda harus login terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('umkm_requests')
        .insert([{
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          address: formData.address,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
          image_url: formData.image_url || null,
          status: 'pending',
          priority: 1
        }])

      if (error) throw error

      showSuccessAlert(
        'Berhasil!', 
        'Permintaan UMKM Anda telah dikirim dan sedang menunggu persetujuan admin.'
      )
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        description: '',
        address: '',
        lat: '',
        lng: '',
        image_url: ''
      })

    } catch (error) {
      console.error('Error submitting UMKM request:', error)
      showErrorAlert('Error', 'Gagal mengirim permintaan UMKM')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Anda harus login terlebih dahulu untuk mengajukan permintaan UMKM
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Daftarkan UMKM Anda
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Bergabunglah dengan platform Jajan Lokal dan jangkau lebih banyak pelanggan
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama UMKM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama UMKM *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Contoh: Toko Kerupuk Bu Sari"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih kategori UMKM Anda</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi UMKM *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ceritakan tentang UMKM Anda, produk yang dijual, dan keunggulannya..."
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Alamat lengkap UMKM Anda"
                  />
                </div>

                {/* Koordinat (Optional) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Latitude (Opsional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="-6.2088"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Longitude (Opsional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="lng"
                      value={formData.lng}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="106.8456"
                    />
                  </div>
                </div>

                {/* URL Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Gambar UMKM (Opsional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/gambar-umkm.jpg"
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Informasi Penting:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Permintaan Anda akan direview oleh admin dalam 1-3 hari kerja</li>
                        <li>Pastikan informasi yang diisi akurat dan lengkap</li>
                        <li>Setelah UMKM disetujui, Anda dapat menambahkan produk</li>
                        <li>Koordinat membantu pelanggan menemukan lokasi UMKM Anda</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mengirim...
                      </div>
                    ) : (
                      'Kirim Permintaan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}