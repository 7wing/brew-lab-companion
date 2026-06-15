import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { LifecycleStatus } from '@/lib/lifecycle'

export function useUpdateBatchStage() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ batchId, status }: { batchId: string; status: LifecycleStatus }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('batches')
        .update({ status })
        .eq('id', batchId)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['batch', variables.batchId] })
      qc.invalidateQueries({ queryKey: ['readings', variables.batchId] })
    },
  })
}