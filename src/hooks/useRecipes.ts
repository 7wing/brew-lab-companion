import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface RecipeFilters {
  type?: string
  style?: string
  difficulty?: number
  batchSize?: number
  abvMin?: number
  abvMax?: number
  curated?: boolean
  sort?: 'most_brewed' | 'highest_rated' | 'newest' | 'quickest'
  search?: string
}

export function useRecipes(filters?: RecipeFilters) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      if (!user) return []
      let q = supabase
        .from('recipes')
        .select('*, profiles:user_id(id, username, avatar_url, display_name)')
        .eq('moderation_status', 'approved')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (filters?.type && filters.type !== 'All') {
        q = q.eq('type', filters.type.toLowerCase())
      }
      if (filters?.style) {
        q = q.ilike('style', `%${filters.style}%`)
      }
      if (filters?.difficulty) {
        q = q.eq('difficulty', filters.difficulty)
      }
      if (filters?.batchSize) {
        q = q.eq('batch_size', filters.batchSize)
      }
      if (filters?.abvMin != null) {
        q = q.gte('abv', filters.abvMin)
      }
      if (filters?.abvMax != null) {
        q = q.lte('abv', filters.abvMax)
      }
      if (filters?.curated === true) {
        q = q.eq('curated', true)
      }
      if (filters?.search && filters.search.trim()) {
        q = q.textSearch('fts', filters.search.trim(), { type: 'websearch' })
      }

      // Sorting
      switch (filters?.sort) {
        case 'most_brewed':
          // Order by number of batches using this recipe — fall back to brew_count if available
          // We don't have brew_count in recipes table, so order by starred count / usage
          q = q.order('starred', { ascending: false }).order('created_at', { ascending: false })
          break
        case 'highest_rated':
          // Order by star_rating desc
          q = q.order('star_rating', { ascending: false } as any).order('created_at', { ascending: false })
          break
        case 'newest':
          q = q.order('created_at', { ascending: false })
          break
        case 'quickest':
          q = q.order('estimated_days', { ascending: true } as any).order('created_at', { ascending: false })
          break
        default:
          q = q.order('created_at', { ascending: false })
      }

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export function useRecipe(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!user || !id) return null
      const { data, error } = await supabase
        .from('recipes')
        .select('*, profiles:user_id(id, display_name, username, avatar_url)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user && !!id,
  })
}

export function useRecipeStages(recipeId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recipe_stages', recipeId],
    queryFn: async () => {
      if (!user || !recipeId) return []
      const { data, error } = await supabase
        .from('recipe_stages')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('day', { ascending: true })
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user && !!recipeId,
  })
}

export function useFeaturedRecipes() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['recipes', 'featured'],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('curated', true)
        .eq('is_public', true)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5)
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