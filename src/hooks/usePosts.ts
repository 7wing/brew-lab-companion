import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const PAGE_SIZE = 20

export type SortOption = 'latest' | 'most_liked' | 'most_commented'

export function usePosts(category?: string, page: number = 1, sort: SortOption = 'latest', userId?: string, search?: string) {
  return useQuery({
    queryKey: ['posts', category, page, sort, userId, search],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      let q = supabase
        .from('posts')
        .select('*, profiles!user_id(username, avatar_url)', { count: 'exact' })
        .range(from, to)

      if (category) {
        q = q.eq('category', category)
      }
      if (userId) {
        q = q.eq('user_id', userId)
      }
      if (search) {
        q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }

      switch (sort) {
        case 'most_liked':
          q = q.order('likes', { ascending: false })
          break
        case 'most_commented':
          q = q.order('created_at', { ascending: false })
          break
        case 'latest':
        default:
          q = q.order('created_at', { ascending: false })
          break
      }

      const { data, error, count } = await q
      if (error) throw error
      return { posts: data ?? [], total: count ?? 0 }
    },
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      post: Omit<
        import('@/types/database').Database['public']['Tables']['posts']['Insert'],
        'user_id' | 'id'
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('posts')
        .insert({ ...post, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) return []
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!postId,
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (
      comment: Omit<
        import('@/types/database').Database['public']['Tables']['comments']['Insert'],
        'user_id' | 'id'
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('comments')
        .insert({ ...comment, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.post_id] })
    },
  })
}

export function useUpdateComment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string
    } & Partial<
        Omit<
          import('@/types/database').Database['public']['Tables']['comments']['Update'],
          'id'
        >
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('comments')
        .update({ ...fields, edited_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.post_id] })
    },
  })
}

export function useDeleteComment() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ id, post_id }: { id: string; post_id: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
      return { post_id }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['comments', data.post_id] })
    },
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string
    } & Partial<
        Omit<
          import('@/types/database').Database['public']['Tables']['posts']['Update'],
          'id' | 'user_id'
        >
      >
    ) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('posts')
        .update({ ...fields, edited_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: ['post', variables.id] })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) throw new Error('Not authenticated')
      // Delete associated comments (CASCADE should handle this, but we also try manually)
      await supabase.from('comments').delete().eq('post_id', id)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (error) throw error
      return { id }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}