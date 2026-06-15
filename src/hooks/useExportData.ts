import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ExportedData {
  profile: any
  batches: any[]
  recipes: any[]
  posts: any[]
  yeastBank: any[]
  settings: any
  privacy: any
  exportDate: string
}

export function useExportData() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const userId = user.id

      const [profileRes, batchesRes, recipesRes, postsRes, yeastRes, settingsRes, privacyRes] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('batches').select('*').eq('user_id', userId),
          supabase.from('recipes').select('*').eq('author_id', userId),
          supabase.from('posts').select('*').eq('author_id', userId),
          supabase.from('yeast_bank').select('*').eq('user_id', userId),
          supabase.from('user_settings').select('*').eq('user_id', userId).single(),
          supabase.from('user_privacy').select('*').eq('user_id', userId).single(),
        ])

      const data: ExportedData = {
        profile: profileRes.data ?? null,
        batches: batchesRes.data ?? [],
        recipes: recipesRes.data ?? [],
        posts: postsRes.data ?? [],
        yeastBank: yeastRes.data ?? [],
        settings: settingsRes.data ?? null,
        privacy: privacyRes.data ?? null,
        exportDate: new Date().toISOString(),
      }

      // Trigger JSON download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `homebrew-haven-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return data
    },
    onSuccess: () => {
      toast.success('Data exported successfully.')
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Failed to export data.')
    },
  })
}