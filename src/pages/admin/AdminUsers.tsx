import { useState } from 'react'
import { useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin'
import { Users, Search, ShieldAlert, ShieldCheck, Ban } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-destructive/10 text-destructive border-destructive/20',
  moderator: 'bg-gold/10 text-gold border-gold/20',
  brewer: 'bg-muted text-muted-foreground',
}

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  moderator: 'Moderator',
  brewer: 'Brewer',
}

export default function Users() {
  const { data: users, isLoading } = useAdminUsers()
  const updateRoleMutation = useUpdateUserRole()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  const filteredUsers = (users ?? []).filter((u) => {
    const matchesSearch =
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateRoleMutation.mutateAsync({ targetUserId: userId, newRole })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="font-slab text-2xl font-bold mb-1">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts and roles.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="brewer">Brewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users size={18} className="text-copper" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-copper-foreground font-semibold text-sm">
                              {(user.display_name ?? user.username).slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.display_name || user.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.email ?? '—'}
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Emails are not available in public API.
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={roleColors[user.role ?? 'brewer']}
                      >
                        {roleLabels[user.role ?? 'brewer']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Role change dropdown */}
                        <Select
                          value={user.role ?? 'brewer'}
                          onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brewer">Brewer</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-copper border-copper/30"
                          onClick={() => toast('Warn user coming soon')}
                        >
                          <ShieldAlert size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-teal border-teal/30"
                          onClick={() => toast('Suspend user coming soon')}
                        >
                          <ShieldCheck size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-destructive border-destructive/30"
                          onClick={() => toast('Ban user coming soon')}
                        >
                          <Ban size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}