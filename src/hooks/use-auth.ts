'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export interface AuthActions {
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const supabase = createClient()

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        // Fetch profile if user exists
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        }

        setLoading(false)
      } catch (err) {
        console.error('Auth initialization error:', err)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        setError(null)

        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with GitHub
  const signInWithGitHub = async (): Promise<void> => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'repo user:email'
        }
      })

      if (error) {
        setError(error)
        throw error
      }
    } catch (err) {
      console.error('GitHub sign in error:', err)
      throw err
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error)
        throw error
      }

      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      console.error('Sign out error:', err)
      throw err
    }
  }

  // Refresh profile data
  const refreshProfile = async (): Promise<void> => {
    if (!user?.id) return

    try {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    } catch (err) {
      console.error('Profile refresh error:', err)
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    error,
    signInWithGitHub,
    signOut,
    refreshProfile,
  }
}