import { useState } from 'react'
import { useFeaturedRecipesAdmin, useAddFeaturedRecipe, useRemoveFeaturedRecipe } from '@/hooks/useAdmin'
import { Star, Plus, Trash2, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const typeColors: Record<string, string> = {
  beer: 'bg-copper/10 text-copper border-copper/20',
  kombucha: 'bg-teal/10 text-teal border-teal/20',
  mead: 'bg-gold/10 text-gold border-gold/20',
  cider: 'bg-copper/10 text-copper border-copper/15',
  wine: 'bg-copper/10 text-copper border-copper/20',
}

export default function FeaturedRecipes() {
  const { data: featured, isLoading } = useFeaturedRecipesAdmin()
  const addMutation = useAddFeaturedRecipe()
  const removeMutation = useRemoveFeaturedRecipe()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newRecipeId, setNewRecipeId] = useState('')
  const [newFeaturedType, setNewFeaturedType] = useState('homepage')

  const handleAdd = async () => {
    if (!newRecipeId.trim()) return
    await addMutation.mutateAsync({
      recipeId: newRecipeId.trim(),
      featuredType: newFeaturedType,
    })
    setAddDialogOpen(false)
    setNewRecipeId('')
  }

  const handleRemove = async (id: string) => {
    await removeMutation.mutateAsync({ id })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-slab text-2xl font-bold mb-1">Featured Recipes</h1>
          <p className="text-sm text-muted-foreground">
            Manage the featured recipes strip on the homepage.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus size={16} /> Add to Featured
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star size={18} className="text-gold" />
            Currently Featured ({featured?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {featured && featured.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Featured Type</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featured.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.recipes?.title ?? 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">
                        by {item.recipes?.profiles?.username ?? 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeColors[item.recipes?.type ?? ''] ?? 'bg-muted'}
                      >
                        {item.recipes?.type ?? '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.featured_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No featured recipes yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Featured Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Featured Recipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe ID</label>
              <Input
                placeholder="Enter recipe ID or URL"
                value={newRecipeId}
                onChange={(e) => setNewRecipeId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find the recipe ID from the URL: /recipe/[id]
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Type</label>
              <Input
                placeholder="e.g., homepage, community, seasonal"
                value={newFeaturedType}
                onChange={(e) => setNewFeaturedType(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newRecipeId.trim() || addMutation.isPending}
            >
              Add Featured
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}