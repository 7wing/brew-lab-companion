import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function ProtectedRouteAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isModerator } = useAuth()
  const location = useLocation()

  if (loading) {
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

  if (!isAdmin && !isModerator) {
    toast.error('Access denied. Admins and moderators only.')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}