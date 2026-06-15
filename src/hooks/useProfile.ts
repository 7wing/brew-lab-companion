import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database'

// Onboarding field types
type FermentType = Database['public']['Enums']['ferment_type']
export type BrewType = FermentType
export type ExperienceLevel =
  | 'just_starting'
  | '1-2_years'
  | '3-5_years'
  | '5plus_years'

export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*, batches(count), recipes(count)')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      fields: Partial<
        Database['public']['Tables']['profiles']['Update']
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

/** Hook for onboarding-specific profile updates: brew_types, experience_level, onboarding_completed */
export function useOnboarding() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('brew_types, experience_level, onboarding_completed, brewing_since, favourite_styles')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as {
        brew_types: FermentType[] | null
        experience_level: string | null
        onboarding_completed: boolean | null
        brewing_since: string | null
        favourite_styles: string | null
      }
    },
    enabled: !!user,
  })
}

export function useUpdateOnboarding() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (fields: {
      brew_types?: FermentType[]
      experience_level?: string
      onboarding_completed?: boolean
      brewing_since?: string
      favourite_styles?: string
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
