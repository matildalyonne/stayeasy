import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Hard timeout — if fetchRole doesn't resolve in 5 s, give up and default to student.
// This means a slow/broken profiles table can never cause a permanent loading screen.
function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const fetchRole = async (userId) => {
      if (!userId) return 'student'
      try {
        const result = await withTimeout(
          supabase.from('profiles').select('role').eq('id', userId).single()
        )
        return result?.data?.role ?? 'student'
      } catch {
        return 'student'
      }
    }

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted.current) return
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const r = await fetchRole(session.user.id)
          if (mounted.current) setRole(r)
        }
      })
      .catch(() => {})
      .finally(() => {
        // Always runs — even if getSession or fetchRole threw or timed out
        if (mounted.current) setLoading(false)
      })

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
