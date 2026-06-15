import { useState } from 'react'
import { useReportedPosts, useModeratePost } from '@/hooks/useAdmin'
import { Flag, Eye, Trash2, X, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function PostModeration() {
  const { data: reports, isLoading } = useReportedPosts()
  const moderateMutation = useModeratePost()

  const [viewDialog, setViewDialog] = useState<{
    open: boolean
    post: { title: string; content: string; username: string } | null
  }>({
    open: false,
    post: null,
  })

  const handleDelete = async (reportId: string, postId: string) => {
    await moderateMutation.mutateAsync({ reportId, action: 'delete', postId })
  }

  const handleDismiss = async (reportId: string) => {
    await moderateMutation.mutateAsync({ reportId, action: 'dismiss' })
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
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-slab text-2xl font-bold mb-1">Post Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Review reported posts and take action.
        </p>
      </div>

      {reports && reports.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag size={18} className="text-destructive" />
              Reported Posts ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium max-w-xs truncate">
                        {report.posts?.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {report.posts?.profiles?.username ?? 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {report.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.reporters?.profiles?.username ?? 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setViewDialog({
                              open: true,
                              post: report.posts
                                ? {
                                    title: report.posts.title,
                                    content: report.posts.content,
                                    username: report.posts.profiles?.username ?? 'Unknown',
                                  }
                                : null,
                            })
                          }
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-teal hover:text-teal border-teal/30"
                          onClick={() => handleDismiss(report.id)}
                          disabled={moderateMutation.isPending}
                          title="Dismiss report"
                        >
                          <X size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive border-destructive/30"
                          onClick={() =>
                            report.posts && handleDelete(report.id, report.posts.id)
                          }
                          disabled={moderateMutation.isPending}
                          title="Delete post"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reported posts pending review</p>
          </CardContent>
        </Card>
      )}

      {/* View Post Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => {
          if (!open) setViewDialog({ open: false, post: null })
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewDialog.post?.title}</DialogTitle>
            <DialogDescription>
              Posted by {viewDialog.post?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 text-sm max-h-64 overflow-y-auto">
            {viewDialog.post?.content}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, post: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}