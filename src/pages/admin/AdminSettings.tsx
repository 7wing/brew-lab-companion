import { useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdmin'
import { Settings, FlaskConical, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings()
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    // In a full implementation, this would call a mutation to update settings
    toast.success(`${key} set to ${value}`)
  }

  const handleSelect = (key: string, value: string) => {
    toast.success(`${key} set to ${value}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-slab text-2xl font-bold mb-1">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure platform-wide settings.
        </p>
      </div>

      {/* Moderation Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={18} className="text-copper" />
            Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mod-mode" className="font-medium">
                Recipe Moderation Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Manual requires admin approval; auto-approve publishes immediately
              </p>
            </div>
            <Select
              value={settings?.moderation_mode ?? 'manual'}
              onValueChange={(v) => handleSelect('moderation_mode', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Review</SelectItem>
                <SelectItem value="auto_approve">Auto-Approve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings size={18} className="text-teal" />
            Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance" className="font-medium">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Block non-admin users from accessing the site
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={settings?.maintenance_mode ?? false}
                onCheckedChange={(v) => handleToggle('maintenance_mode', v)}
              />
            </div>
            {settings?.maintenance_mode && (
              <div>
                <Label htmlFor="maintenance-msg" className="font-medium">
                  Maintenance message
                </Label>
                <Textarea
                  id="maintenance-msg"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Enter a message to display during maintenance..."
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="challenge-vis" className="font-medium">
                Challenge Visibility
              </Label>
              <p className="text-sm text-muted-foreground">
                Show challenges in the community page
              </p>
            </div>
            <Select
              value={settings?.challenge_visibility ?? 'community_visible'}
              onValueChange={(v) => handleSelect('challenge_visibility', v)}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="official_only">Official only</SelectItem>
                <SelectItem value="community_visible">Community challenges visible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical size={18} className="text-gold" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">App Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Database</span>
            <span>Supabase</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Build</span>
            <span>Vite + React</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}