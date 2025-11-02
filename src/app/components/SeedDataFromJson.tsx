'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { showSuccessAlert, showErrorAlert } from '../../lib/sweetalert'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import MagicBorderButton from './ui/MagicBorderButton'

// Type definitions
interface Product {
  name: string
  price: number
  image?: string
  description?: string
  stock?: number
}

interface UMKMData {
  id: number
  name: string
  category: string
  description?: string
  alamat?: string
  lat?: number
  lng?: number
  image?: string
  products?: Product[]
}

export default function SeedDataFromJson() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const seedData = async () => {
    if (!user) {
      showErrorAlert('Error!', 'Anda harus login terlebih dahulu untuk import data')
      return
    }

    setLoading(true)
    
    try {
      console.log('🚀 Starting data import from JSON...')
      
      const response = await fetch('/data/umkmData.json')
      const umkmData: UMKMData[] = await response.json()
      
      console.log(`📦 Found ${umkmData.length} UMKM to import`)
      
      const currentUserId = user.id
      
      let successCount = 0
      let totalProducts = 0
      
      for (const umkm of umkmData) {
        console.log(`📝 Processing ${umkm.name}...`)
        
        const umkmUuid = `00000000-0000-0000-0000-${umkm.id.toString().padStart(12, '0')}`
        
        const { error: umkmError } = await supabase
          .from('umkm_requests')
          .upsert([{
            id: umkmUuid,
            user_id: currentUserId,
            name: umkm.name,
            category: umkm.category,
            description: umkm.description || `UMKM ${umkm.name} menyediakan produk ${umkm.category} berkualitas`,
            address: umkm.alamat || 'Indonesia',
            lat: umkm.lat || -6.2088,
            lng: umkm.lng || 106.8456,
            image_url: umkm.image,
            status: 'approved',
            priority: 1
          }], { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })

        if (umkmError) {
          console.error(`UMKM Error for ${umkm.name}:`, umkmError)
          continue
        }

        console.log(`${umkm.name} UMKM created`)
        successCount++

        if (umkm.products && umkm.products.length > 0) {
          const productsToInsert = umkm.products.map((product: Product, index: number) => {
            const productUuid = `00000000-0000-0001-0000-${(umkm.id * 1000 + index).toString().padStart(12, '0')}`
            
            return {
              id: productUuid,
              user_id: currentUserId,
              umkm_request_id: umkmUuid,
              name: product.name,
              price: product.price,
              image_url: product.image || null,
              description: product.description || `${product.name} - produk unggulan dari ${umkm.name}`,
              stock: product.stock || Math.floor(Math.random() * 50) + 20,
              is_available: true,
              status: 'approved'
            }
          })

          const { error: productsError } = await supabase
            .from('product_requests')
            .upsert(productsToInsert, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })

          if (productsError) {
            console.error(`Products Error for ${umkm.name}:`, productsError)
          } else {
            console.log(`${umkm.name}: ${umkm.products.length} products created`)
            totalProducts += umkm.products.length
          }
        }
      }
      
      console.log(`Import completed: ${successCount} UMKM, ${totalProducts} products`)
      
      showSuccessAlert(
        'Import Berhasil!', 
        `${successCount} UMKM dan ${totalProducts} produk berhasil diimport ke database`
      )
      
    } catch (error) {
      console.error('Seed Error:', error)
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat import data'
      showErrorAlert('Error Import!', message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Import Data UMKM
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Anda harus login terlebih dahulu untuk menggunakan fitur import data
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Import Data UMKM
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Import data UMKM dan produk dari file JSON ke database 
        </p>
        
        <MagicBorderButton
          onClick={seedData}
          disabled={loading}
          className="mx-auto"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing Data...
            </div>
          ) : (
            'Import Data UMKM dari JSON'
          )}
        </MagicBorderButton>

        {loading && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>⏳ Sedang mengimport data...</p>
            <p>Mohon tunggu, proses ini membutuhkan waktu beberapa detik</p>
          </div>
        )}
      </div>
    </div>
  )
}
