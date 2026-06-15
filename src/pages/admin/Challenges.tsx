import { useAdminChallenges, useModerateChallenge } from '@/hooks/useAdmin'
import { Trophy, Check, X, Plus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

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

  const handleApprove = async (challengeId: string) => {
    await moderateMutation.mutateAsync({ challengeId, action: 'approve' })
  }

  const handleReject = async (challengeId: string) => {
    await moderateMutation.mutateAsync({ challengeId, action: 'reject' })
  }

  const pendingChallenges = (challenges ?? []).filter(
    (c) => c.moderation_status === 'pending'
  )
  const activeChallenges = (challenges ?? []).filter(
    (c) => c.is_active && c.moderation_status === 'approved'
  )

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
                            onClick={() => handleReject(challenge.id)}
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
                    <TableHead>Status</TableHead>
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
    </div>
  )
}