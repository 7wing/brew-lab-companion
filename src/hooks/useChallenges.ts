import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, challenge_entries(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useJoinChallenge() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ challengeId, batchId }: { challengeId: string; batchId?: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('challenge_entries')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          batch_id: batchId ?? null,
        })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  })
}
