import { useState } from 'react'
import { usePendingRecipes, useModerateRecipe } from '@/hooks/useAdmin'
import { BookOpen, Check, X, Eye, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'
import type { Database } from '@/types/database'

const typeColors: Record<string, string> = {
  beer: 'bg-copper/10 text-copper border-copper/20',
  kombucha: 'bg-teal/10 text-teal border-teal/20',
  mead: 'bg-gold/10 text-gold border-gold/20',
  cider: 'bg-copper/10 text-copper border-copper/15',
  sourdough: 'bg-gold/10 text-gold border-gold/15',
  wine: 'bg-copper/10 text-copper border-copper/20',
  ferment: 'bg-teal/10 text-teal border-teal/15',
}

export default function RecipeModeration() {
  const { data: recipes, isLoading } = usePendingRecipes()
  const moderateMutation = useModerateRecipe()

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; recipeId: string; title: string }>({
    open: false,
    recipeId: '',
    title: '',
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewDialog, setViewDialog] = useState<{ open: boolean; recipe: typeof recipes extends (infer T)[] | undefined ? T : never | null }>({
    open: false,
    recipe: null,
  })

  const handleApprove = async (recipeId: string) => {
    await moderateMutation.mutateAsync({ recipeId, status: 'approved' })
  }

  const handleReject = async () => {
    if (!rejectDialog.recipeId) return
    await moderateMutation.mutateAsync({
      recipeId: rejectDialog.recipeId,
      status: 'rejected',
      rejectionReason,
    })
    setRejectDialog({ open: false, recipeId: '', title: '' })
    setRejectionReason('')
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
        <h1 className="font-slab text-2xl font-bold mb-1">Recipe Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve submitted recipes.
        </p>
      </div>

      {recipes && recipes.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={18} className="text-copper" />
              Pending Recipes ({recipes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>
                      <div className="font-medium">{recipe.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {recipe.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeColors[recipe.type] ?? 'bg-muted text-muted-foreground'}
                      >
                        {recipe.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {recipe.profiles?.display_name || recipe.profiles?.username || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock size={12} />
                        {new Date(recipe.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewDialog({ open: true, recipe })}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-teal hover:text-teal border-teal/30"
                          onClick={() => handleApprove(recipe.id)}
                          disabled={moderateMutation.isPending}
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive border-destructive/30"
                          onClick={() => setRejectDialog({ open: true, recipeId: recipe.id, title: recipe.title })}
                          disabled={moderateMutation.isPending}
                        >
                          <X size={14} />
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
            <BookOpen size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recipes pending review</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog({ open: false, recipeId: '', title: '' })
            setRejectionReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Recipe</DialogTitle>
            <DialogDescription>
              Rejecting "{rejectDialog.title}". Provide a reason for the author.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (e.g., missing ingredients, unclear instructions)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, recipeId: '', title: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || moderateMutation.isPending}
            >
              Reject Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Recipe Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => {
          if (!open) setViewDialog({ open: false, recipe: null })
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewDialog.recipe?.title}</DialogTitle>
            <DialogDescription>
              Submitted by {viewDialog.recipe?.profiles?.username ?? 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={typeColors[viewDialog.recipe?.type ?? ''] ?? 'bg-muted'}
              >
                {viewDialog.recipe?.type}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Submitted on {viewDialog.recipe ? new Date(viewDialog.recipe.created_at).toLocaleString() : ''}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, recipe: null })}
            >
              Close
            </Button>
            {viewDialog.recipe && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    setViewDialog({ open: false, recipe: null })
                    setRejectDialog({
                      open: true,
                      recipeId: viewDialog.recipe!.id,
                      title: viewDialog.recipe!.title,
                    })
                  }}
                  disabled={moderateMutation.isPending}
                >
                  <X size={14} /> Reject
                </Button>
                <Button
                  className="bg-teal hover:bg-teal/90"
                  onClick={() => {
                    handleApprove(viewDialog.recipe!.id)
                    setViewDialog({ open: false, recipe: null })
                  }}
                  disabled={moderateMutation.isPending}
                >
                  <Check size={14} /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}