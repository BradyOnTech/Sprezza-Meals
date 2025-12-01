'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type AuthUser = {
  id: string
  email?: string | null
  name?: string | null
}

type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token?: string
}) => Promise<void>
type ForgotPassword = (args: { email: string }) => Promise<void>
type Create = (args: {
  email: string
  password: string
  passwordConfirm: string
}) => Promise<AuthUser | null>
type Login = (args: { email: string; password: string }) => Promise<AuthUser>
type Logout = () => Promise<void>

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: AuthUser | null) => void
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: AuthUser | null
}

const Context = createContext({} as AuthContext)

const mapUser = (supabaseUser: User): AuthUser => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  name: supabaseUser.user_metadata?.full_name || supabaseUser.email || null,
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [user, setUser] = useState<AuthUser | null>()
  const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | undefined>()

  const create = useCallback<Create>(
    async (args) => {
      const { email, password, passwordConfirm } = args
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: email },
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/account`
              : process.env.NEXT_PUBLIC_SITE_URL,
        },
      })

      if (error) {
        throw error
      }

      const mapped = data.user ? mapUser(data.user) : null
      if (mapped) {
        setUser(mapped)
        setStatus('loggedIn')
      }

      return mapped
    },
    [supabase],
  )

  const login = useCallback<Login>(
    async (args) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: args.email,
        password: args.password,
      })

      if (error || !data.user) {
        throw error || new Error('Invalid login')
      }

      const mapped = mapUser(data.user)
      setUser(mapped)
      setStatus('loggedIn')
      return mapped
    },
    [supabase],
  )

  const logout = useCallback<Logout>(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStatus('loggedOut')
  }, [supabase])

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session?.user) {
        setUser(mapUser(data.session.user))
        setStatus('loggedIn')
      } else {
        setStatus('loggedOut')
        setUser(null)
      }
    }

    void fetchSession()
  }, [supabase])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user))
        setStatus('loggedIn')
      } else {
        setUser(null)
        setStatus('loggedOut')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const forgotPassword = useCallback<ForgotPassword>(
    async (args) => {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(args.email, {
        redirectTo,
      })

      if (error) {
        throw error
      }
    },
    [supabase],
  )

  const resetPassword = useCallback<ResetPassword>(
    async (args) => {
      if (args.password !== args.passwordConfirm) {
        throw new Error('Passwords do not match')
      }

      const { error } = await supabase.auth.updateUser({
        password: args.password,
      })

      if (error) {
        throw error
      }
    },
    [supabase],
  )

  return (
    <Context.Provider
      value={{
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        status,
        user,
      }}
    >
      {children}
    </Context.Provider>
  )
}

type UseAuth = () => AuthContext

export const useAuth: UseAuth = () => useContext(Context)
