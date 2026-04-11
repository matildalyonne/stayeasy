import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const fetchRole = async (userId) => {
      if (!userId) return null
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      return data?.role ?? 'student'
    }

    // Step 1: read whatever session is already in storage.
    // getSession() always resolves immediately and never hangs,
    // even with an expired or missing token.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted.current) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRole(session.user.id)
        if (mounted.current) setRole(r)
      }
      if (mounted.current) setLoading(false)
    })

    // Step 2: listen only for changes that happen AFTER the initial load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setRole(null)
        } else if (session?.user) {
          const r = await fetchRole(session.user.id)
          if (mounted.current) setRole(r)
        }
      }
    )

    return () => {
      mounted.current = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = (email, password, metadata) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  // Clear state immediately so UI responds at once, then invalidate server-side.
  const signOut = async () => {
    setUser(null)
    setSession(null)
    setRole(null)
    await supabase.auth.signOut()
  }

  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
