import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useLatestTastingSession() {
  return useQuery({
    queryKey: ['tasting-session'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasting_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useCreateTastingSession() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (title: string = 'Live Tasting') => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasting_sessions')
        .insert({
          host_id: user.id,
          title,
          is_live: true,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasting-session'] }),
  })
}

export function useCreateTastingNote() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      sessionId,
      aroma,
      flavor,
      mouthfeel,
      overall,
    }: {
      sessionId: string
      aroma?: string
      flavor?: string
      mouthfeel?: string
      overall?: string
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasting_notes')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          aroma: aroma || null,
          flavor: flavor || null,
          mouthfeel: mouthfeel || null,
          overall: overall || null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasting-notes'] }),
  })
}

export function useTastingSessions(batchId?: string) {
  const { user } = useAuth()
  return {
    createSession: async (title: string) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasting_sessions')
        .insert({
          host_id: user.id,
          batch_id: batchId ?? null,
          title,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
  }
}
