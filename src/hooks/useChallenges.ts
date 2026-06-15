import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, challenge_entries(*, profiles(username, avatar_url))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useChallengeDetail(challengeId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, challenge_entries(*, profiles(username, avatar_url)), creator:profiles!created_by(username, avatar_url)')
        .eq('id', challengeId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!challengeId,
  })
}

export function useChallengeEntries(challengeId: string) {
  return useQuery({
    queryKey: ['challenge-entries', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_entries')
        .select('*, profiles(username, avatar_url), batch:batches(name, type, star_rating)')
        .eq('challenge_id', challengeId)
        .order('rating', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!challengeId,
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
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['challenge', vars.challengeId] })
      qc.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useSubmitChallengeEntry() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ challengeId, batchId, postId }: { challengeId: string; batchId?: string; postId: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('challenge_entries')
        .update({
          batch_id: batchId ?? null,
          submission_post_id: postId,
          submitted_at: new Date().toISOString(),
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['challenge', vars.challengeId] })
      qc.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useDeleteChallenge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ challengeId }: { challengeId: string }) => {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}