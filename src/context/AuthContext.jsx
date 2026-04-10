import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  // Prevent the onAuthStateChange INITIAL_SESSION event from double-fetching
  const initialised = useRef(false)

  const fetchRole = async (userId) => {
    if (!userId) { setRole(null); return }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(data?.role ?? 'student')
  }

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION synchronously on mount,
    // so we use it as the single source of truth and skip getSession().
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!initialised.current) {
        // First event (INITIAL_SESSION) — fetch role then clear the loading screen
        initialised.current = true
        await fetchRole(session?.user?.id)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchRole(session?.user?.id)
      } else if (event === 'SIGNED_OUT') {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = (email, password, metadata) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
