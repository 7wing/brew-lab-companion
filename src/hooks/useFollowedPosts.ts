import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { SortOption } from './usePosts'

export function useFollowedPosts(opts?: { enabled?: boolean }, sort: SortOption = 'latest', search?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['followedPosts', user?.id, sort, search],
    queryFn: async () => {
      if (!user) return []

      // First get the list of followed user IDs
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)

      if (followsError) throw followsError
      if (!follows || follows.length === 0) return []

      const followedIds = follows.map((f) => f.followed_id)

      // Then fetch posts from those users
      let q = supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .in('user_id', followedIds)

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

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: !!user && (opts?.enabled !== false),
  })
}