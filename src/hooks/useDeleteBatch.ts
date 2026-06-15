import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useDeleteBatch() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (batchId: string) => {
      if (!user) throw new Error('Not authenticated')

      // Delete associated readings first
      const { error: readingsError } = await supabase
        .from('readings')
        .delete()
        .eq('batch_id', batchId)
        .eq('user_id', user.id)
      if (readingsError) throw readingsError

      // Delete associated batch stages
      const { error: stagesError } = await supabase
        .from('batch_stages')
        .delete()
        .eq('batch_id', batchId)
        .eq('user_id', user.id)
      if (stagesError) throw stagesError

      // Delete the batch itself
      const { error: batchError } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId)
        .eq('user_id', user.id)
      if (batchError) throw batchError
    },
    onSuccess: (_data, batchId) => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['batch', batchId] })
      qc.invalidateQueries({ queryKey: ['readings', batchId] })
    },
  })
}