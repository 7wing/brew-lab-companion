import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, onboardingCompleted, loadingOnboarding } = useAuth()
  const location = useLocation()

  if (loading || loadingOnboarding) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    sessionStorage.setItem('redirectTo', location.pathname + location.search)
    return <Navigate to="/auth" replace />
  }

  // Authenticated but onboarding not complete — redirect to /onboarding
  // Skip this check for /onboarding itself to avoid infinite loops
  if (onboardingCompleted === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}