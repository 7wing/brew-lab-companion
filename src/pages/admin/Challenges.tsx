import { useState, useEffect, useMemo } from 'react'
import { useAdminChallenges, useModerateChallenge } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Trophy, Check, X, Plus, Users, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'
import type { Challenge } from '@/hooks/useAdmin'

type ModerationStatus = Database['public']['Enums']['moderation_status']

const statusColors: Record<ModerationStatus, string> = {
  pending: 'bg-gold/10 text-gold border-gold/20',
  approved: 'bg-teal/10 text-teal border-teal/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  needs_edits: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

const typeLabels: Record<string, string> = {
  official: 'Official',
  community: 'Community',
}

export default function Challenges() {
  const { data: challenges, isLoading } = useAdminChallenges()
  const moderateMutation = useModerateChallenge()
  const qc = useQueryClient()

  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({})
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; challengeId: string; title: string }>({
    open: false,
    challengeId: '',
    title: '',
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [editDialog, setEditDialog] = useState<{ open: boolean; challenge: Challenge | null }>({
    open: false,
    challenge: null,
  })
  const [editForm, setEditForm] = useState({ title: '', description: '', end_date: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  const pendingChallenges = useMemo(
    () => (challenges ?? []).filter((c) => c.moderation_status === 'pending'),
    [challenges]
  )
  const activeChallenges = useMemo(
    () => (challenges ?? []).filter((c) => c.is_active && c.moderation_status === 'approved'),
    [challenges]
  )

  useEffect(() => {
    if (activeChallenges.length === 0) return
    const ids = activeChallenges.map((c) => c.id)
    let cancelled = false
    supabase
      .from('challenge_submissions')
      .select('challenge_id, user_id')
      .in('challenge_id', ids)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const counts: Record<string, Set<string>> = {}
        data.forEach((row) => {
          if (!counts[row.challenge_id]) counts[row.challenge_id] = new Set()
          counts[row.challenge_id].add(row.user_id)
        })
        const result: Record<string, number> = {}
        Object.entries(counts).forEach(([cid, set]) => {
          result[cid] = set.size
        })
        setParticipantCounts(result)
      })
    return () => {
      cancelled = true
    }
  }, [activeChallenges.map((c) => c.id).join(',')])

  const handleApprove = async (challengeId: string) => {
    await moderateMutation.mutateAsync({ challengeId, action: 'approve' })
  }

  const openRejectDialog = (challengeId: string, title: string) => {
    setRejectDialog({ open: true, challengeId, title })
    setRejectionReason('')
  }

  const handleConfirmReject = async () => {
    if (!rejectDialog.challengeId || !rejectionReason.trim()) return
    await moderateMutation.mutateAsync({
      challengeId: rejectDialog.challengeId,
      action: 'reject',
      reason: rejectionReason.trim(),
    })
    setRejectDialog({ open: false, challengeId: '', title: '' })
    setRejectionReason('')
  }

  const openEditDialog = (challenge: Challenge) => {
    setEditDialog({ open: true, challenge })
    setEditForm({
      title: challenge.title ?? '',
      description: challenge.description ?? '',
      end_date: challenge.end_date ? challenge.end_date.slice(0, 10) : '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editDialog.challenge) return
    setIsUpdating(true)
    const { error } = await supabase
      .from('challenges')
      .update({
        title: editForm.title,
        description: editForm.description,
        end_date: editForm.end_date || null,
      })
      .eq('id', editDialog.challenge.id)
    setIsUpdating(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Challenge updated')
    qc.invalidateQueries({ queryKey: ['admin', 'challenges'] })
    setEditDialog({ open: false, challenge: null })
  }

  const handleEndEarly = async (challengeId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('challenges')
      .update({ is_active: false, end_date: today })
      .eq('id', challengeId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Challenge ended early')
    qc.invalidateQueries({ queryKey: ['admin', 'challenges'] })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-slab text-2xl font-bold mb-1">Challenges</h1>
          <p className="text-sm text-muted-foreground">
            Manage official and community challenges.
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} /> Create Challenge
        </Button>
      </div>

      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <section>
          <Card className="border-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy size={18} className="text-gold" />
                Pending Approval ({pendingChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingChallenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell>
                        <div className="font-medium">{challenge.title}</div>
                        {challenge.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                            {challenge.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeLabels[challenge.challenge_type ?? 'community'] ?? challenge.challenge_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {challenge.profiles?.username ?? 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-teal hover:text-teal border-teal/30"
                            onClick={() => handleApprove(challenge.id)}
                            disabled={moderateMutation.isPending}
                          >
                            <Check size={14} /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive border-destructive/30"
                            onClick={() => openRejectDialog(challenge.id, challenge.title ?? '')}
                            disabled={moderateMutation.isPending}
                          >
                            <X size={14} /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Active Challenges */}
      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy size={18} className="text-copper" />
              Active Challenges ({activeChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeChallenges.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeChallenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-medium">{challenge.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeLabels[challenge.challenge_type ?? ''] ?? challenge.challenge_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {challenge.start_date
                          ? new Date(challenge.start_date).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {challenge.end_date
                          ? new Date(challenge.end_date).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          <Users size={12} className="mr-1" />
                          {participantCounts[challenge.id] ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            challenge.is_active
                              ? 'bg-teal/10 text-teal border-teal/20'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {challenge.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-copper border-copper/30"
                            onClick={() => openEditDialog(challenge)}
                          >
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30"
                            onClick={() => handleEndEarly(challenge.id)}
                          >
                            End early
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active challenges
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog({ open: false, challengeId: '', title: '' })
            setRejectionReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Challenge</DialogTitle>
            <DialogDescription>
              Rejecting "{rejectDialog.title}". Provide a reason for the author.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, challengeId: '', title: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || moderateMutation.isPending}
            >
              Reject Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false, challenge: null })
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Update title, description, and end date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-end">End Date</Label>
              <Input
                id="edit-end"
                type="date"
                value={editForm.end_date}
                onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, challenge: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
