import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useIsFollowing(followedId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['isFollowing', followedId],
    queryFn: async () => {
      if (!user || !followedId) return false
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', followedId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!user && !!followedId && user.id !== followedId,
  })
}

export function useFollowerCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['followerCount', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
  })
}

export function useFollowingCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['followingCount', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
  })
}

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('follows')
        .select('*, profiles!follows_follower_id_fkey(username, display_name, avatar_url)')
        .eq('followed_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('follows')
        .select('*, profiles!follows_followed_id_fkey(username, display_name, avatar_url)')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useFollow() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (followedId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_id: followedId })
        .select()
        .single()
      if (error) throw error

      // Notify the followed user
      try {
        await supabase.from('notifications').insert({
          user_id: followedId,
          type: 'follow',
          title: 'New follower',
          body: 'Someone started following you',
          link: `/profile/${user.id}`,
          is_read: false,
        })
      } catch {
        // Best-effort notification; don't fail the follow if notification fails
      }

      return data
    },
    onSuccess: (_data, followedId) => {
      qc.invalidateQueries({ queryKey: ['isFollowing', followedId] })
      qc.invalidateQueries({ queryKey: ['followerCount', followedId] })
      qc.invalidateQueries({ queryKey: ['followingCount', user.id] })
      qc.invalidateQueries({ queryKey: ['followers', followedId] })
      qc.invalidateQueries({ queryKey: ['following', user.id] })
      qc.invalidateQueries({ queryKey: ['followedPosts', user.id] })
    },
  })
}

export function useUnfollow() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (followedId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', followedId)
      if (error) throw error
    },
    onSuccess: (_data, followedId) => {
      qc.invalidateQueries({ queryKey: ['isFollowing', followedId] })
      qc.invalidateQueries({ queryKey: ['followerCount', followedId] })
      qc.invalidateQueries({ queryKey: ['followingCount', user.id] })
      qc.invalidateQueries({ queryKey: ['followers', followedId] })
      qc.invalidateQueries({ queryKey: ['following', user.id] })
      qc.invalidateQueries({ queryKey: ['followedPosts', user.id] })
    },
  })
}
