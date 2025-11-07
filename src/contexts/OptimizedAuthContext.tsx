// src/contexts/OptimizedAuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

  // Cache untuk profile data
  const [profileCache, setProfileCache] = useState<Map<string, UserProfile>>(new Map())

    // Optimized profile fetch dengan caching
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Check cache first
    if (profileCache.has(userId)) {
      setProfile(profileCache.get(userId)!)
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
        
        // Cache the profile
        setProfileCache(prev => new Map(prev.set(userId, userProfile)))
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
    }
  }, [profileCache])

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        // Quick session check without waiting
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          // Non-blocking profile fetch
          fetchUserProfile(session.user.id).catch(console.error)
        }
      } catch (error) {
        console.error('Error getting session:', error)
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

        console.log('Auth state changed:', event)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Non-blocking profile fetch
          fetchUserProfile(session.user.id).catch(console.error)
        } else {
          setProfile(null)
          setProfileCache(new Map()) // Clear cache on logout
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

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
    setProfileCache(new Map())
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
      setProfileCache(prev => new Map(prev.set(user.id, updatedProfile)))
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