import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  onboardingCompleted: boolean | null
  loadingOnboarding: boolean
  role: UserRole
  isAdmin: boolean
  isModerator: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  onboardingCompleted: null,
  loadingOnboarding: true,
  role: 'brewer',
  isAdmin: false,
  isModerator: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  const [loadingOnboarding, setLoadingOnboarding] = useState(true)
  const [role, setRole] = useState<UserRole>('brewer')

  // Fetch profile to check onboarding_completed and role
  const fetchProfile = async (userId: string) => {
    setLoadingOnboarding(true)
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', userId)
      .single()
    // Treat missing profile or null/true/undefined as NOT completed (false)
    setOnboardingCompleted(data?.onboarding_completed === true)
    // Default to 'brewer' if role is null/undefined
    const fetchedRole: UserRole = data?.role ?? 'brewer'
    setRole(fetchedRole)
    setLoadingOnboarding(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoadingOnboarding(false)
        setOnboardingCompleted(null)
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
        setLoadingOnboarding(false)
        setOnboardingCompleted(null)
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
        onboardingCompleted,
        loadingOnboarding,
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
