import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useRecipes(filter?: string, search?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recipes', filter, search],
    queryFn: async () => {
      if (!user) return []
      let q = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter && filter !== 'all') {
        q = q.eq('type', filter)
      }
      if (search && search.trim()) {
        q = q.textSearch('fts', search.trim(), { type: 'websearch' })
      }

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      recipe: Omit<
        import('@/types/database').Database['public']['Tables']['recipes']['Insert'],
        'user_id' | 'id'
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('recipes')
        .insert({ ...recipe, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useUpdateRecipe() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string
    } & Partial<
      import('@/types/database').Database['public']['Tables']['recipes']['Update']
    >) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('recipes')
        .update(fields)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      qc.invalidateQueries({ queryKey: ['recipe', variables.id] })
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}
