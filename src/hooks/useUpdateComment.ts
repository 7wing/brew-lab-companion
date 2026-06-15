import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useUpdateComment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      postId,
    }: {
      commentId: string
      content: string
      postId: string
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] })
    },
  })
}