import { useState } from 'react'
import { useSendNotification } from '@/hooks/useAdmin'
import { Bell, Send, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function Notifications() {
  const sendMutation = useSendNotification()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<'all' | 'brewers' | 'moderators'>('all')

  const handleSend = async () => {
    if (!title.trim()) return
    await sendMutation.mutateAsync({
      title: title.trim(),
      body: body.trim() || undefined,
      target,
    })
    setTitle('')
    setBody('')
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-slab text-2xl font-bold mb-1">Platform Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Send announcements to users.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={18} className="text-copper" />
            Send Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notif-title">Subject *</Label>
            <Input
              id="notif-title"
              placeholder="e.g., New feature: Recipe sharing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-body">Message</Label>
            <Textarea
              id="notif-body"
              placeholder="Optional details..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-target">Send To</Label>
            <Select
              value={target}
              onValueChange={(v) => setTarget(v as 'all' | 'brewers' | 'moderators')}
            >
              <SelectTrigger id="notif-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    All Users
                  </div>
                </SelectItem>
                <SelectItem value="brewers">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    All Brewers
                  </div>
                </SelectItem>
                <SelectItem value="moderators">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    Moderators Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSend}
              disabled={!title.trim() || sendMutation.isPending}
              className="gap-2"
            >
              <Send size={16} />
              Send Notification
            </Button>
            {sendMutation.isPending && (
              <span className="text-sm text-muted-foreground">Sending...</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}