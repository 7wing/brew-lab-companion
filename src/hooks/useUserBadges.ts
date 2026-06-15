import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  criteria_key: string
  target_value: number
  created_at: string
}

export interface UserBadge extends Badge {
  awarded_at: string
}

/** Fetch all badge definitions */
export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async (): Promise<Badge[]> => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

/** Fetch earned badges for a user */
export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: ['user_badges', userId],
    queryFn: async (): Promise<UserBadge[]> => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((r: any) => ({
        ...r.badges,
        awarded_at: r.awarded_at,
      }))
    },
    enabled: !!userId,
  })
}

/** Seed initial badges into the badges table */
export function useSeedBadges() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const seedBadges = [
        {
          name: 'First Brew',
          description: 'Logged your first batch',
          icon_url: '🏆',
          criteria_key: 'first_brew',
          target_value: 1,
        },
        {
          name: '10 Batches',
          description: 'Completed 10 batches',
          icon_url: '🍺',
          criteria_key: 'batch_count',
          target_value: 10,
        },
        {
          name: '5 Recipes Shared',
          description: 'Shared 5 recipes with the community',
          icon_url: '📋',
          criteria_key: 'recipe_count',
          target_value: 5,
        },
        {
          name: 'Challenge Winner',
          description: 'Won a brewing challenge',
          icon_url: '🥇',
          criteria_key: 'challenge_win',
          target_value: 1,
        },
        {
          name: '100 Readings',
          description: 'Logged 100 gravity/temp readings',
          icon_url: '📊',
          criteria_key: 'reading_count',
          target_value: 100,
        },
        {
          name: 'Community Star',
          description: 'Received 50 likes on your posts',
          icon_url: '⭐',
          criteria_key: 'post_likes',
          target_value: 50,
        },
      ]

      for (const badge of seedBadges) {
        await supabase.from('badges').upsert(badge, { onConflict: 'criteria_key' })
      }

      await qc.invalidateQueries({ queryKey: ['badges'] })
    },
  })
}

/** Check and award badges based on current user stats */
export function useAwardBadges() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (targetUserId?: string) => {
      const uid = targetUserId ?? user?.id
      if (!uid) throw new Error('Not authenticated')

      // Fetch all badge definitions
      const { data: allBadges, error: badgeError } = await supabase.from('badges').select('*')
      if (badgeError) throw badgeError

      // Fetch already earned badges
      const { data: earned, error: earnedError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', uid)
      if (earnedError) throw earnedError

      const earnedIds = new Set((earned ?? []).map((e: any) => e.badge_id))

      // Compute user stats
      const [{ count: batchCount }, { count: recipeCount }, { count: readingCount }, { data: posts }] =
        await Promise.all([
          supabase.from('batches').select('*', { count: 'exact', head: true }).eq('user_id', uid),
          supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('user_id', uid),
          supabase.from('readings').select('*', { count: 'exact', head: true }).eq('user_id', uid),
          supabase.from('posts').select('likes, category').eq('user_id', uid),
        ])

      // Count challenge wins
      const { count: challengeWins } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('rank', 1)

      const totalLikes = (posts ?? []).reduce((sum: number, p: any) => sum + (p.likes ?? 0), 0)

      // Map criteria_key → current value
      const stats: Record<string, number> = {
        first_brew: (batchCount ?? 0) >= 1 ? 1 : 0,
        batch_count: batchCount ?? 0,
        recipe_count: recipeCount ?? 0,
        challenge_win: challengeWins ?? 0,
        reading_count: readingCount ?? 0,
        post_likes: totalLikes,
      }

      const toAward: { badge_id: string; user_id: string }[] = []

      for (const badge of allBadges ?? []) {
        if (earnedIds.has(badge.id)) continue
        const current = stats[badge.criteria_key] ?? 0
        if (current >= badge.target_value) {
          toAward.push({ badge_id: badge.id, user_id: uid })
        }
      }

      if (toAward.length > 0) {
        const { error } = await supabase.from('user_badges').insert(toAward)
        if (error) throw error
      }

      await qc.invalidateQueries({ queryKey: ['user_badges', uid] })
      return toAward.length
    },
  })
}