import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useFollowedPosts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['followedPosts'],
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
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}
