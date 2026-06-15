import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']
type ModerationStatus = Database['public']['Enums']['moderation_status']

export interface AdminStats {
  totalUsers: number
  activeBatches: number
  recipesSubmitted: number
  postsToday: number
  pendingRecipes: number
  reportedPosts: number
  recentSignups: Array<{
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    created_at: string
  }>
}

export function useAdminStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      if (!user) throw new Error('Not authenticated')

      // Run queries in parallel
      const [
        usersResult,
        batchesResult,
        recipesResult,
        postsResult,
        pendingRecipesResult,
        reportedPostsResult,
        recentSignupsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('batches').select('id', { count: 'exact', head: true }).not('status', 'in', '("finished","batch_shelf")'),
        supabase.from('recipes').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400000).toISOString()),
        supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
        supabase.from('reported_content').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id, username, display_name, avatar_url, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      return {
        totalUsers: usersResult.count ?? 0,
        activeBatches: batchesResult.count ?? 0,
        recipesSubmitted: recipesResult.count ?? 0,
        postsToday: postsResult.count ?? 0,
        pendingRecipes: pendingRecipesResult.count ?? 0,
        reportedPosts: reportedPostsResult.count ?? 0,
        recentSignups: recentSignupsResult.data ?? [],
      }
    },
    enabled: !!user,
  })
}

export interface PendingRecipe {
  id: string
  title: string
  user_id: string
  type: Database['public']['Enums']['ferment_type']
  created_at: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
}

export function usePendingRecipes() {
  return useQuery({
    queryKey: ['admin', 'pending-recipes'],
    queryFn: async (): Promise<PendingRecipe[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          user_id,
          type,
          created_at,
          profiles:user_id ( username, display_name, avatar_url )
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useModerateRecipe() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      recipeId,
      status,
      rejectionReason,
    }: {
      recipeId: string
      status: 'approved' | 'rejected'
      rejectionReason?: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      const updates: Record<string, unknown> = {
        moderation_status: status,
      }
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason
      }

      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)

      if (error) throw error
    },
    onSuccess: (_data, { status }) => {
      toast.success(status === 'approved' ? 'Recipe approved' : 'Recipe rejected')
      qc.invalidateQueries({ queryKey: ['admin', 'pending-recipes'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to moderate recipe')
    },
  })
}

export interface ReportedPost {
  id: string
  content_id: string
  content_type: string
  reason: string
  reporter_id: string
  created_at: string
  status: string | null
  posts: {
    id: string
    title: string
    content: string
    user_id: string
    created_at: string
    profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
  } | null
  reporters: {
    profiles: { username: string } | null
  } | null
}

export function useReportedPosts() {
  return useQuery({
    queryKey: ['admin', 'reported-posts'],
    queryFn: async (): Promise<ReportedPost[]> => {
      const { data, error } = await supabase
        .from('reported_content')
        .select(`
          id,
          content_id,
          content_type,
          reason,
          reporter_id,
          created_at,
          status,
          posts:content_id (
            id,
            title,
            content,
            user_id,
            created_at,
            profiles:user_id ( username, display_name, avatar_url )
          ),
          reporters:reporter_id ( profiles:reporter_id ( username ) )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useModeratePost() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      reportId,
      action,
      postId,
    }: {
      reportId: string
      action: 'dismiss' | 'delete'
      postId?: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Update the report status
      const { error: reportError } = await supabase
        .from('reported_content')
        .update({ status: action === 'dismiss' ? 'dismissed' : 'deleted' })
        .eq('id', reportId)

      if (reportError) throw reportError

      // If delete action, also delete the post
      if (action === 'delete' && postId) {
        const { error: postError } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
        if (postError) throw postError
      }
    },
    onSuccess: (_data, { action }) => {
      toast.success(action === 'dismissed' ? 'Report dismissed' : 'Post deleted')
      qc.invalidateQueries({ queryKey: ['admin', 'reported-posts'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to moderate post')
    },
  })
}

export interface AdminUser {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  email: string | null
  role: UserRole | null
  created_at: string
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error

      // Fetch email from auth.users - this may require service role
      // For MVP, we return profiles without email (email requires server-side or service role)
      return (data ?? []).map(p => ({ ...p, email: null }))
    },
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      targetUserId,
      newRole,
    }: {
      targetUserId: string
      newRole: UserRole
    }) => {
      if (!user) throw new Error('Not authenticated')
      // Note: Role updates may require service role client for RLS bypass
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('User role updated')
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update user role')
    },
  })
}

export interface Challenge {
  id: string
  title: string
  description: string | null
  challenge_type: Database['public']['Enums']['challenge_type'] | null
  moderation_status: ModerationStatus | null
  is_active: boolean | null
  start_date: string | null
  end_date: string | null
  created_at: string | null
  created_by: string | null
  profiles: { username: string; display_name: string | null } | null
}

export function useAdminChallenges() {
  return useQuery({
    queryKey: ['admin', 'challenges'],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          challenge_type,
          moderation_status,
          is_active,
          start_date,
          end_date,
          created_at,
          created_by,
          profiles:created_by ( username, display_name )
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useModerateChallenge() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      challengeId,
      action,
      reason,
    }: {
      challengeId: string
      action: 'approve' | 'reject'
      reason?: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      const updates: Record<string, unknown> = {
        moderation_status: action === 'approve' ? 'approved' : 'rejected',
        is_active: action === 'approve',
      }

      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', challengeId)

      if (error) throw error
    },
    onSuccess: (_data, { action }) => {
      toast.success(action === 'approve' ? 'Challenge approved' : 'Challenge rejected')
      qc.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to moderate challenge')
    },
  })
}

export interface FeaturedRecipe {
  id: string
  recipe_id: string
  featured_type: string
  active: boolean | null
  sort_order: number | null
  created_at: string | null
  recipes: {
    id: string
    title: string
    type: Database['public']['Enums']['ferment_type']
    profiles: { username: string } | null
  } | null
}

export function useFeaturedRecipesAdmin() {
  return useQuery({
    queryKey: ['admin', 'featured-recipes'],
    queryFn: async (): Promise<FeaturedRecipe[]> => {
      const { data, error } = await supabase
        .from('featured_recipes')
        .select(`
          id,
          recipe_id,
          featured_type,
          active,
          sort_order,
          created_at,
          recipes:recipe_id ( id, title, type, profiles:user_id ( username ) )
        `)
        .order('sort_order', { ascending: true })
        .limit(20)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAddFeaturedRecipe() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ recipeId, featuredType }: { recipeId: string; featuredType?: string }) => {
      const { error } = await supabase
        .from('featured_recipes')
        .insert({
          recipe_id: recipeId,
          featured_type: featuredType ?? 'homepage',
          active: true,
        })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Recipe added to featured')
      qc.invalidateQueries({ queryKey: ['admin', 'featured-recipes'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add featured recipe')
    },
  })
}

export function useRemoveFeaturedRecipe() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('featured_recipes')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Recipe removed from featured')
      qc.invalidateQueries({ queryKey: ['admin', 'featured-recipes'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove featured recipe')
    },
  })
}

export interface LabPartner {
  id: string
  name: string
  logo_url: string | null
  slot: number | null
  active: boolean | null
  created_at: string | null
}

export function useLabPartners() {
  return useQuery({
    queryKey: ['admin', 'lab-partners'],
    queryFn: async (): Promise<LabPartner[]> => {
      const { data, error } = await supabase
        .from('lab_partners')
        .select('*')
        .order('slot', { ascending: true })
        .limit(20)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAddLabPartner() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, logoUrl }: { name: string; logoUrl?: string }) => {
      const { error } = await supabase
        .from('lab_partners')
        .insert({ name, logo_url: logoUrl, active: true })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Partner added')
      qc.invalidateQueries({ queryKey: ['admin', 'lab-partners'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add partner')
    },
  })
}

export function useUpdateLabPartner() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LabPartner> }) => {
      const { error } = await supabase
        .from('lab_partners')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Partner updated')
      qc.invalidateQueries({ queryKey: ['admin', 'lab-partners'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update partner')
    },
  })
}

export function useRemoveLabPartner() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('lab_partners')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Partner removed')
      qc.invalidateQueries({ queryKey: ['admin', 'lab-partners'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove partner')
    },
  })
}

export function useSendNotification() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      title,
      body,
      target,
    }: {
      title: string
      body?: string
      target: 'all' | 'brewers' | 'moderators'
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Get all user IDs for the target segment
      let query = supabase.from('profiles').select('id')
      if (target === 'moderators') {
        query = query.in('role', ['moderator', 'super_admin'])
      }
      // For 'all' and 'brewers' we fetch all profiles

      const { data: profiles, error: profilesError } = await query
      if (profilesError) throw profilesError

      const notifications = (profiles ?? []).map(p => ({
        user_id: p.id,
        title,
        body: body ?? null,
        type: 'announcement',
        is_read: false,
      }))

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Notification sent')
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send notification')
    },
  })
}

export interface AdminSettings {
  moderation_mode: 'manual' | 'auto_approve'
  maintenance_mode: boolean
  challenge_visibility: boolean
}

export function useAdminSettings() {
  // In a full implementation, these would be stored in a platform_settings table
  // For MVP, we return defaults and mutations would update that table
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async (): Promise<AdminSettings> => {
      // Placeholder - in production this would fetch from a settings table
      return {
        moderation_mode: 'manual',
        maintenance_mode: false,
        challenge_visibility: true,
      }
    },
  })
}