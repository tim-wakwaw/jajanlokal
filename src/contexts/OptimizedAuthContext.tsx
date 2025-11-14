// src/contexts/OptimizedAuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  status?: string
  avatar_url: string | null
  phone: string | null
  address?: string | null
  date_of_birth?: string | null
  permissions?: string[]
  metadata: Record<string, unknown>
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  signIn: (email: string, password: string, redirectTo?: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function OptimizedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Cache untuk profile data - GUNAKAN useRef SUPAYA TIDAK TRIGGER RE-RENDER
  const profileCacheRef = useRef<Map<string, UserProfile>>(new Map())

    // Optimized profile fetch dengan caching
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Check cache first
    if (profileCacheRef.current.has(userId)) {
      setProfile(profileCacheRef.current.get(userId)!)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          role: data.role || 'user',
          phone: data.phone,
          address: data.address,
          date_of_birth: data.date_of_birth,
          metadata: data.metadata || {}
        }
        
        // Cache the profile - UPDATE REF, TIDAK TRIGGER RE-RENDER
        profileCacheRef.current.set(userId, userProfile)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
    }
  }, []) // ✅ EMPTY DEPENDENCIES - fetchUserProfile tidak berubah!

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        // RETRY MECHANISM for production reliability
        let session = null
        let attempts = 0
        const maxAttempts = 3
        
        while (attempts < maxAttempts && !session) {
          const { data } = await supabase.auth.getSession()
          session = data.session
          
          if (!session && attempts < maxAttempts - 1) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 100 * (attempts + 1)))
          }
          attempts++
        }
        
        console.log('🔐 Session check result:', session ? 'FOUND' : 'NOT FOUND', `(${attempts} attempts)`)
        
        if (!mounted) return

        if (session?.user) {
          console.log('🔐 Setting user from session:', session.user.email)
          setUser(session.user)
          // Non-blocking profile fetch
          fetchUserProfile(session.user.id).catch(console.error)
        } else {
          console.log('🔐 No session found, user remains null')
        }
      } catch (error) {
        console.error('🔐 Error getting session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Auth state listener dengan optimized handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔐 Auth state changed:', event, session ? `User: ${session.user.email}` : 'No session')
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔐 Fetching profile for user:', session.user.email)
          // Non-blocking profile fetch
          fetchUserProfile(session.user.id).catch(console.error)
        } else {
          console.log('🔐 Clearing user data (logout/no session)')
          setProfile(null)
          profileCacheRef.current.clear() // Clear cache on logout
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ✅ EMPTY - hanya run sekali saat mount, fetchUserProfile stabil dengan useCallback([])

  // Helper functions
  const isAdmin = () => profile?.role === 'admin' || profile?.role === 'super_admin'
  const isSuperAdmin = () => profile?.role === 'super_admin'

  // Auth methods - sama seperti sebelumnya tapi optimized
  const signIn = async (email: string, password: string, redirectTo?: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    // Check user role after login
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      // Redirect based on role
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          if (profileData?.role === 'admin' || profileData?.role === 'super_admin' || profileData?.role === 'moderator') {
            window.location.href = '/admin/dashboard'
          } else if (redirectTo) {
            window.location.href = redirectTo
          } else {
            window.location.href = '/'
          }
        }, 100)
      }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear cache
    profileCacheRef.current.clear()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
    
    // Update cache and state
    if (profile) {
      const updatedProfile = { ...profile, ...updates }
      profileCacheRef.current.set(user.id, updatedProfile)
      setProfile(updatedProfile)
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isSuperAdmin,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}