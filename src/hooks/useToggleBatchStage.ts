import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useToggleBatchStage() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ stageId, completed }: { stageId: string; completed: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('batch_stages')
        .update({ completed })
        .eq('id', stageId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['batch'] })
    },
  })
}
