import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  role: UserRole
  isAdmin: boolean
  isModerator: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  role: 'brewer',
  isAdmin: false,
  isModerator: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('brewer')

  // Fetch profile to check role
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    // Default to 'brewer' if role is null/undefined
    const fetchedRole: UserRole = data?.role ?? 'brewer'
    setRole(fetchedRole)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setRole('brewer')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setRole('brewer')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = role === 'super_admin'
  const isModerator = role === 'moderator' || role === 'super_admin'

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        role,
        isAdmin,
        isModerator,
        signOut: () => supabase.auth.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
