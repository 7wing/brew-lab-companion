import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  if (user) {
    return <Navigate to="/" replace />
  }

  const mode = searchParams.get('mode')
  const initialView = mode === 'signup' ? 'sign_up' : 'sign_in'

  return (
    <div className="h-svh flex items-center justify-center px-4 py-4 overflow-hidden">
      <div className="glass-panel rounded-2xl p-4 sm:p-6 w-full max-w-md">
        <h1 className="font-slab text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-4">
          Homebrew Haven
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'apple']}
          view={initialView}
          redirectTo={window.location.origin + '/auth/callback'}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: 'Sign in with {{provider}}',
              },
              sign_up: {
                social_provider_text: 'Sign up with {{provider}}',
              },
            },
          }}
        />
      </div>
    </div>
  )
}
