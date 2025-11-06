'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import { showSuccessAlert, showErrorAlert } from '../../lib/sweetalert'

export default function RequestUMKMPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'umkm' | 'product'>('umkm')

  // Check URL parameter for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'product') {
      setActiveTab('product')
    }
  }, [])
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    alamat: '',
    lat: '',
    lng: '',
    image_url: '',
    user_email: user?.email || ''
  })

  const [productData, setProductData] = useState({
    umkm_name: '',
    product_name: '',
    price: '',
    image_url: '',
    description: '',
    category: '',
    user_email: user?.email || ''
  })

  const categories = {
      "Kuliner": "🍽️",
      "Fashion": "👕",
      "Retail": "🏪",
      "Kesehatan": "💊",
      "Kerajinan": "🎨"
  }

  // Handle image upload untuk UMKM
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showErrorAlert('Error', 'Ukuran gambar maksimal 2MB')
      return
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      showErrorAlert('Error', 'File harus berupa gambar')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `umkm-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      showSuccessAlert('Berhasil!', 'Gambar berhasil diupload')
    } catch (error) {
      console.error('Upload error:', error)
      showErrorAlert('Error', 'Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  // Handle image upload untuk Product
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      showErrorAlert('Error', 'Ukuran gambar maksimal 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      showErrorAlert('Error', 'File harus berupa gambar')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      setProductData(prev => ({ ...prev, image_url: publicUrl }))
      showSuccessAlert('Berhasil!', 'Gambar produk berhasil diupload')
    } catch (error) {
      console.error('Upload error:', error)
      showErrorAlert('Error', 'Gagal upload gambar produk')
    } finally {
      setUploading(false)
    }
  }

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
          user_email: user.email,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          alamat: formData.alamat,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
          image_url: formData.image_url || null,
          status: 'pending'
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
        alamat: '',
        lat: '',
        lng: '',
        image_url: '',
        user_email: user.email || ''
      })

    } catch (error) {
      console.error('Error submitting UMKM request:', error)
      showErrorAlert('Error', 'Gagal mengirim permintaan UMKM')
    } finally {
      setLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showErrorAlert('Error', 'Anda harus login terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('product_requests')
        .insert([{
          user_id: user.id,
          user_email: user.email,
          umkm_name: productData.umkm_name,
          product_name: productData.product_name,
          price: parseFloat(productData.price),
          image_url: productData.image_url || null,
          description: productData.description,
          category: productData.category,
          status: 'pending'
        }])

      if (error) throw error

      showSuccessAlert(
        'Berhasil!', 
        'Permintaan produk Anda telah dikirim dan sedang menunggu persetujuan admin.'
      )
      
      // Reset form
      setProductData({
        umkm_name: '',
        product_name: '',
        price: '',
        image_url: '',
        description: '',
        category: '',
        user_email: user.email || ''
      })

    } catch (error) {
      console.error('Error submitting product request:', error)
      showErrorAlert('Error', 'Gagal mengirim permintaan produk')
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

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProductData(prev => ({
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
                Ajukan Permintaan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Daftarkan UMKM baru atau tambahkan produk ke UMKM yang sudah ada
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl p-2 mb-6 border border-white/20">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('umkm')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'umkm'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Daftar UMKM Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('product')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'product'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Tambah Produk
                </button>
              </div>
            </div>

            {/* UMKM Form */}
            {activeTab === 'umkm' && (
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
                    {Object.keys(categories).map((cat) => (
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
                    name="alamat"
                    value={formData.alamat}
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

                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gambar UMKM
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                  {uploading && (
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Mengupload gambar...
                    </div>
                  )}
                  {formData.image_url && (
                    <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <Image
                        src={formData.image_url}
                        alt="Preview UMKM"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Maksimal 2MB. Format: JPG, PNG, WebP
                  </p>
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
                    disabled={loading || uploading}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      loading || uploading
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
                      'Kirim Permintaan UMKM'
                    )}
                  </button>
                </div>
              </form>
            </div>
            )}

            {/* Product Form */}
            {activeTab === 'product' && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-white/20">
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  {/* Nama UMKM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama UMKM *
                    </label>
                    <input
                      type="text"
                      name="umkm_name"
                      value={productData.umkm_name}
                      onChange={handleProductInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Nama UMKM yang sudah ada"
                    />
                  </div>

                  {/* Nama Produk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={productData.product_name}
                      onChange={handleProductInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Contoh: Kerupuk Udang Original"
                    />
                  </div>

                  {/* Harga */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productData.price}
                      onChange={handleProductInputChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="15000"
                    />
                  </div>

                  {/* Kategori Produk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kategori Produk *
                    </label>
                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleProductInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Pilih kategori produk</option>
                      {Object.keys(categories).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deskripsi Produk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deskripsi Produk *
                    </label>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleProductInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Jelaskan detail produk, bahan, varian, dll..."
                    />
                  </div>

                  {/* Upload Gambar Produk */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gambar Produk
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploading}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                    />
                    {uploading && (
                      <div className="text-sm text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        Mengupload gambar...
                      </div>
                    )}
                    {productData.image_url && (
                      <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src={productData.image_url}
                          alt="Preview Produk"
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Maksimal 2MB. Format: JPG, PNG, WebP
                    </p>
                  </div>

                  {/* Info */}
                  <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-purple-600 dark:text-purple-400 text-xl">ℹ️</div>
                      <div className="text-sm text-purple-800 dark:text-purple-200">
                        <p className="font-medium mb-1">Informasi Penting:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Pastikan UMKM sudah terdaftar di platform</li>
                          <li>Produk akan direview admin dalam 1-3 hari kerja</li>
                          <li>Gunakan foto produk yang jelas dan menarik</li>
                          <li>Harga yang dicantumkan harus akurat</li>
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
                      disabled={loading || uploading}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        loading || uploading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mengirim...
                        </div>
                      ) : (
                        'Kirim Permintaan Produk'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}