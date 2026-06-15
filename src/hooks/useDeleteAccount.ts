import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function useDeleteAccount() {
  const { user, signOut } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const userId = user.id

      // Delete all user data from all tables.
      // Order matters: delete children before parents to respect FK constraints.
      // batch_readings is CASCADE from batches, so deleting batches covers it.
      await supabase.from('follows').delete().eq('follower_id', userId)
      await supabase.from('follows').delete().eq('following_id', userId)
      await supabase.from('notifications').delete().eq('user_id', userId)
      await supabase.from('notification_settings').delete().eq('user_id', userId)
      await supabase.from('user_privacy').delete().eq('user_id', userId)
      await supabase.from('user_settings').delete().eq('user_id', userId)
      await supabase.from('badge_awards').delete().eq('user_id', userId)
      await supabase.from('yeast_bank').delete().eq('user_id', userId)
      await supabase.from('post_comments').delete().eq('author_id', userId)
      await supabase.from('post_likes').delete().eq('user_id', userId)
      await supabase.from('posts').delete().eq('author_id', userId)
      await supabase.from('recipe_readings').delete().eq('user_id', userId)
      await supabase.from('recipes').delete().eq('author_id', userId)
      // batch_readings CASCADE from batches, so delete batches first
      await supabase.from('batches').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)

      // Attempt admin delete of the auth user (service role required).
      // If not available (RLS), log warning and fall back to sign-out.
      try {
        const { error: adminError } =
          await supabase.auth.admin.deleteUser(userId)
        if (adminError) {
          console.warn(
            'Auth user deletion unavailable (requires service role):',
            adminError.message
          )
        }
      } catch {
        // Edge function or admin API not configured — ignore
      }

      return true
    },
    onSuccess: () => {
      qc.clear()
      signOut()
      toast.success(
        'Account data deleted. You have been signed out. If your account still exists, please delete it manually in the Supabase dashboard.'
      )
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Failed to delete account.')
    },
  })
}