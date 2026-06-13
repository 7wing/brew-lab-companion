import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useReadings(batchId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['readings', batchId],
    queryFn: async () => {
      if (!user || !batchId) return []
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('batch_id', batchId)
        .eq('user_id', user.id)
        .order('read_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user && !!batchId,
  })
}

export function useCreateReading() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      reading: Omit<
        import('@/types/database').Database['public']['Tables']['readings']['Insert'],
        'user_id' | 'id'
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('readings')
        .insert({
          ...reading,
          user_id: user.id,
          read_at: reading.read_at ?? new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['readings', variables.batch_id] })
    },
  })
}
