import { Link } from 'react-router-dom'
import { useAdminStats } from '@/hooks/useAdmin'
import { APP } from '@/constants/copy'
import {
  Users,
  FlaskConical,
  BookOpen,
  MessageSquare,
  AlertCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  accent = 'copper',
  href,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ size?: number; className?: string }>
  description?: string
  accent?: 'copper' | 'teal' | 'gold'
  href?: string
}) {
  const colors = {
    copper: 'text-copper bg-copper/10 border-copper/20',
    teal: 'text-teal bg-teal/10 border-teal/20',
    gold: 'text-gold bg-gold/10 border-gold/20',
  }
  const color = colors[accent]

  const content = (
    <Card className={`hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-slab">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

function SectionHeader({
  title,
  action,
  actionHref,
}: {
  title: string
  action?: string
  actionHref?: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-slab text-lg font-semibold">{title}</h2>
      {action && actionHref && (
        <Button variant="ghost" size="sm" asChild className="text-copper gap-1">
          <Link to={actionHref}>
            {action} <ArrowRight size={14} />
          </Link>
        </Button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="font-slab text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the {APP.appName} admin panel. Overview of platform activity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="registered brewers"
          accent="copper"
          href="/admin/users"
        />
        <MetricCard
          title="Active Batches"
          value={stats?.activeBatches ?? 0}
          icon={FlaskConical}
          description="currently fermenting"
          accent="teal"
        />
        <MetricCard
          title="Recipes Submitted"
          value={stats?.recipesSubmitted ?? 0}
          icon={BookOpen}
          description="all time"
          accent="gold"
          href="/admin/recipes"
        />
        <MetricCard
          title="Posts Today"
          value={stats?.postsToday ?? 0}
          icon={MessageSquare}
          description="in last 24 hours"
          accent="copper"
        />
      </div>

      {/* Pending Queues */}
      <section>
        <SectionHeader title="Pending Moderation" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            title="Recipe Queue"
            value={stats?.pendingRecipes ?? 0}
            icon={FileCheck}
            description="awaiting review"
            accent="gold"
            href="/admin/recipes"
          />
          <MetricCard
            title="Reported Posts"
            value={stats?.reportedPosts ?? 0}
            icon={AlertCircle}
            description="need attention"
            accent="copper"
            href="/admin/posts"
          />
        </div>
      </section>

      {/* Recent Signups */}
      <section>
        <SectionHeader title="Recent Signups" action="View all" actionHref="/admin/users" />
        <Card>
          <CardContent className="p-0">
            {stats?.recentSignups && stats.recentSignups.length > 0 ? (
              <div className="divide-y divide-border/50">
                {stats.recentSignups.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-copper-foreground font-semibold text-sm">
                          {(u.display_name ?? u.username).slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {u.display_name || u.username}
                      </p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Date(u.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent signups
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="font-slab text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Recipe Queue', href: '/admin/recipes', color: 'copper' },
            { label: 'Reported Posts', href: '/admin/posts', color: 'teal' },
            { label: 'User Management', href: '/admin/users', color: 'gold' },
            { label: 'Challenges', href: '/admin/challenges', color: 'copper' },
            { label: 'Send Notification', href: '/admin/notifications', color: 'teal' },
          ].map((item) => (
            <Button key={item.href} variant="outline" asChild className="h-auto py-3 justify-start">
              <Link to={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  )
}