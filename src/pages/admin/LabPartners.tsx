import { useState } from 'react'
import { useLabPartners, useAddLabPartner, useUpdateLabPartner, useRemoveLabPartner } from '@/hooks/useAdmin'
import { FlaskConical, Plus, Edit, Trash2 } from 'lucide-react'
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

export default function LabPartners() {
  const { data: partners, isLoading } = useLabPartners()
  const addMutation = useAddLabPartner()
  const updateMutation = useUpdateLabPartner()
  const removeMutation = useRemoveLabPartner()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    id: string
    name: string
    logoUrl: string
  }>({ open: false, id: '', name: '', logoUrl: '' })
  const [newName, setNewName] = useState('')
  const [newLogoUrl, setNewLogoUrl] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addMutation.mutateAsync({ name: newName.trim(), logoUrl: newLogoUrl.trim() || undefined })
    setAddDialogOpen(false)
    setNewName('')
    setNewLogoUrl('')
  }

  const handleEdit = async () => {
    if (!editDialog.name.trim()) return
    await updateMutation.mutateAsync({
      id: editDialog.id,
      updates: { name: editDialog.name, logo_url: editDialog.logoUrl || null },
    })
    setEditDialog({ open: false, id: '', name: '', logoUrl: '' })
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
          <h1 className="font-slab text-2xl font-bold mb-1">Lab Partners</h1>
          <p className="text-sm text-muted-foreground">
            Manage sponsored lab partner listings.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus size={16} /> Add Partner
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical size={18} className="text-teal" />
            Partners ({partners?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {partners && partners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <FlaskConical size={14} className="text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {partner.slot ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          partner.active
                            ? 'bg-teal/10 text-teal border-teal/20'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {partner.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setEditDialog({
                              open: true,
                              id: partner.id,
                              name: partner.name,
                              logoUrl: partner.logo_url ?? '',
                            })
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(partner.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No lab partners yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner Name</label>
              <Input
                placeholder="e.g., Northern Brewer"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL (optional)</label>
              <Input
                placeholder="https://example.com/logo.png"
                value={newLogoUrl}
                onChange={(e) => setNewLogoUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!newName.trim() || addMutation.isPending}>
              Add Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false, id: '', name: '', logoUrl: '' })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lab Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner Name</label>
              <Input
                value={editDialog.name}
                onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <Input
                value={editDialog.logoUrl}
                onChange={(e) => setEditDialog({ ...editDialog, logoUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, id: '', name: '', logoUrl: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!editDialog.name.trim() || updateMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}