import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useBatches() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('batches')
        .select('*, recipe:recipes(id, title), batch_stages(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export function useBatch(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      if (!user || !id) return null
      const { data, error } = await supabase
        .from('batches')
        .select('*, recipe:recipes(id, title), batch_stages(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user && !!id,
  })
}

export function useCreateBatch() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      batch: Omit<
        import('@/types/database').Database['public']['Tables']['batches']['Insert'],
        'user_id' | 'id'
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('batches')
        .insert({ ...batch, user_id: user.id })
        .select()
        .single()
      if (error) throw error

      // If a recipe_id was provided, copy recipe_stages to batch_stages
      if (batch.recipe_id && data) {
        const { data: stages, error: stagesError } = await supabase
          .from('recipe_stages')
          .select('*')
          .eq('recipe_id', batch.recipe_id)
          .order('day', { ascending: true })
          .order('sort_order', { ascending: true })

        if (stagesError) throw stagesError

        if (stages && stages.length > 0) {
          const batchStages = stages.map((stage) => {
            const startDate = batch.start_date ? new Date(batch.start_date) : new Date()
            const scheduledDate = new Date(startDate)
            scheduledDate.setDate(scheduledDate.getDate() + stage.day)
            return {
              batch_id: data.id,
              name: stage.action,
              notes: stage.notes ?? null,
              scheduled: scheduledDate.toISOString().split('T')[0],
              sort_order: stage.sort_order ?? null,
            }
          })

          const { error: insertError } = await supabase
            .from('batch_stages')
            .insert(batchStages)

          if (insertError) throw insertError
        }
      }

      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  })
}

export function useUpdateBatch() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string
    } & Partial<
      import('@/types/database').Database['public']['Tables']['batches']['Update']
    >) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('batches')
        .update(fields)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['batch', variables.id] })
    },
  })
}
