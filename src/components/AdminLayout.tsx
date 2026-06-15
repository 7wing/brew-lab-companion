import { Link, useLocation, Routes, Route } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Flag,
  Users,
  Trophy,
  Star,
  FlaskConical,
  Bell,
  Settings,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'
import Dashboard from '@/pages/admin/Dashboard'
import RecipeModeration from '@/pages/admin/RecipeModeration'
import PostModeration from '@/pages/admin/PostModeration'
import UsersPage from '@/pages/admin/AdminUsers'
import Challenges from '@/pages/admin/Challenges'
import FeaturedRecipes from '@/pages/admin/FeaturedRecipes'
import LabPartners from '@/pages/admin/LabPartners'
import Notifications from '@/pages/admin/Notifications'
import AdminSettings from '@/pages/admin/AdminSettings'

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/recipes', label: 'Recipes', icon: BookOpen },
  { path: '/admin/posts', label: 'Posts', icon: Flag },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/challenges', label: 'Challenges', icon: Trophy },
  { path: '/admin/featured', label: 'Featured', icon: Star },
  { path: '/admin/partners', label: 'Partners', icon: FlaskConical },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

function isActive(path: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === path
  return pathname.startsWith(path)
}

function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1 p-4">
      {adminNavItems.map((item) => {
        const active = isActive(item.path, location.pathname, item.exact)
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${active
                ? 'bg-copper/10 text-copper border border-copper/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Top Header Bar ─── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pt-4">
                <AdminNavContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-copper to-gold flex items-center justify-center">
                <Shield size={16} className="text-copper-foreground" />
              </div>
              <span className="font-slab font-bold text-sm hidden sm:inline">Homebrew Haven</span>
              <span className="font-slab font-bold text-copper text-sm sm:hidden">Admin</span>
              <span className="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                admin
              </span>
            </Link>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Admin navigation">
            {adminNavItems.map((item) => {
              const active = isActive(item.path, location.pathname, item.exact)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${active
                      ? 'bg-copper/10 text-copper border border-copper/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile title spacer */}
          <div className="lg:hidden" style={{ width: '80px' }} />
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 border-r border-border/40 bg-muted/20 min-h-[calc(100vh-3.5rem)]">
          <AdminNavContent />
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recipes" element={<RecipeModeration />} />
            <Route path="/posts" element={<PostModeration />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/featured" element={<FeaturedRecipes />} />
            <Route path="/partners" element={<LabPartners />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout