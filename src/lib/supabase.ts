import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types untuk TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'super_admin' | 'admin' | 'moderator' | 'umkm_owner' | 'user'
          status: 'active' | 'suspended' | 'pending'
          avatar_url: string | null
          phone: string | null
          permissions: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'super_admin' | 'admin' | 'moderator' | 'umkm_owner' | 'user'
          status?: 'active' | 'suspended' | 'pending'
          avatar_url?: string | null
          phone?: string | null
          permissions?: string[]
          metadata?: Record<string, unknown>
        }
        Update: {
          full_name?: string | null
          role?: 'super_admin' | 'admin' | 'moderator' | 'umkm_owner' | 'user'
          status?: 'active' | 'suspended' | 'pending'
          avatar_url?: string | null
          phone?: string | null
          permissions?: string[]
          metadata?: Record<string, unknown>
          updated_at?: string
        }
      }
      umkm_requests: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          assigned_admin_id: string | null
          name: string
          category: 'Kuliner' | 'Fashion' | 'Retail' | 'Jasa' | 'Kerajinan' | 'Kesehatan'
          description: string
          address: string
          lat: number | null
          lng: number | null
          image_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          priority: number
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          umkm_id: string
          products: Array<{
            id: string
            name: string
            price: number
            quantity: number
          }>
          total_amount: number
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          delivery_address: string
          phone: string
          notes: string | null
          order_date: string
          confirmed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}