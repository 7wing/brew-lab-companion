import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useTastingMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['tasting-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return []
      const { data, error } = await supabase
        .from('tasting_messages')
        .select('*, profiles(username, avatar_url)')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!sessionId,
  })
}

export function useSendTastingMessage(sessionId: string | undefined) {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (message: string) => {
      if (!user || !sessionId) throw new Error('Missing user or session')
      const { error } = await supabase.from('tasting_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        message,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasting-messages', sessionId] })
    },
  })
}
