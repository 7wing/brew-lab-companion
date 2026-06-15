import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database'

type UserSettings = Database['public']['Tables']['user_settings']['Row']
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
type UserPrivacy = Database['public']['Tables']['user_privacy']['Row']
type UserPrivacyUpdate = Database['public']['Tables']['user_privacy']['Update']

export function useUserSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async (): Promise<UserSettings | null> => {
      if (!user) return null
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (fields: UserSettingsUpdate) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...fields })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user_settings', user?.id] })
    },
  })
}

export function useUserPrivacy() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user_privacy', user?.id],
    queryFn: async (): Promise<UserPrivacy | null> => {
      if (!user) return null
      const { data, error } = await supabase
        .from('user_privacy')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUpdatePrivacy() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (fields: UserPrivacyUpdate) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('user_privacy')
        .upsert({ user_id: user.id, ...fields })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user_privacy', user?.id] })
    },
  })
}

export function useNotificationSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['notification_settings', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      type,
      in_app_enabled,
      email_enabled,
    }: {
      type: string
      in_app_enabled?: boolean
      email_enabled?: boolean
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          type,
          in_app_enabled,
          email_enabled,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification_settings', user?.id] })
    },
  })
}