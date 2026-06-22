import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Beer,
  BookOpen,
  Users,
  User,
  Bell,
  Menu,
  LogOut,
  Settings,
} from "lucide-react";
import BubbleBackground from "./BubbleBackground";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileBatchDrawerProvider } from "@/contexts/MobileBatchDrawerContext";
import { useMobileBatchDrawer } from "@/hooks/useMobileBatchDrawer";
import { useProfile } from "@/hooks/useProfile";

const mainNavItems = [
  { path: "/", label: "Brew Bench" },
  { path: "/recipes", label: "Recipes" },
  { path: "/community", label: "Community" },
];

const mobileTabItems = [
  { path: "/", label: "Brew Bench", icon: Beer },
  { path: "/recipes", label: "Recipes", icon: BookOpen },
  { path: "/community", label: "Community", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

function isActive(path: string, pathname: string) {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

type ProfileLike = { display_name?: string | null; username?: string | null } | null | undefined;
type UserLike = { email?: string | null } | null | undefined;

function getInitials(profile: ProfileLike, user: UserLike): string {
  const displayName = profile?.display_name;
  const username = profile?.username;
  const email = user?.email;
  const raw = displayName || username || email || "?";
  const parts = String(raw).trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return String(raw)[0].toUpperCase();
}

function NotificationBell() {
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.length ?? 0;
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[1.1rem] h-4 px-1 rounded-full bg-teal text-teal-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {unreadCount > 0 && (
          <button
            className="w-full px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted transition-colors border-b border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            Mark all as read
          </button>
        )}
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start cursor-pointer"
              onClick={() => {
                markAsRead.mutate(n.id);
                if (n.link) navigate(n.link);
              }}
            >
              <span className="font-medium text-sm">{n.title}</span>
              {n.body && (
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {n.body}
                </span>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40" aria-label="User menu">
          <Avatar className="h-9 w-9 border border-border/60">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(profile, user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
          <User size={16} />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer gap-2">
          <Settings size={16} />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
          <LogOut size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const AppLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toggle } = useMobileBatchDrawer();

  // Real-time notification subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return (
    <div className="h-screen relative flex flex-col overflow-hidden">
      <BubbleBackground count={10} />

      {/* ═══════════════════ Mobile Top Bar ═══════════════════ */}
      <nav
        className="flex lg:hidden fixed top-0 left-0 right-0 z-50 h-14 items-center px-4 bg-background/80 backdrop-blur-md border-b border-border/50"
        aria-label="Top navigation"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-copper to-gold flex items-center justify-center">
            <FlaskConical size={16} className="text-copper-foreground" />
          </div>
          <span className="font-slab font-bold text-sm whitespace-nowrap">
            Homebrew Haven
          </span>
        </Link>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {location.pathname === "/" && (
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Open batch list"
            >
              <Menu size={18} />
            </button>
          )}
          <NotificationBell />
        </div>
      </nav>

      {/* ═══════════════════ Desktop Top Nav ═══════════════════ */}
      <nav
        className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-md px-4 py-2 items-center gap-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-copper to-gold flex items-center justify-center">
            <FlaskConical size={16} className="text-copper-foreground" />
          </div>
          <span className="font-slab font-bold text-sm whitespace-nowrap">
            Homebrew Haven
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell />
          <UserAvatar />
        </div>
      </nav>

      {/* ═══════════════════ Mobile Bottom Tab Bar ═══════════════════ */}
      <nav
        className="flex lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-md rounded-full border border-border/50 shadow-lg px-4 py-2 justify-center"
        aria-label="Mobile tab navigation"
      >
        <div className="flex items-center w-full justify-around">
          {mobileTabItems.map((item) => {
            const active = isActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center shrink-0 gap-0.5 px-1 py-1.5 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium leading-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════ Main Content ═══════════════════ */}
      <main className="flex-1 pt-14 lg:pt-20 pb-20 lg:pb-0 relative z-10 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <MobileBatchDrawerProvider>
    <AppLayoutInner>{children}</AppLayoutInner>
  </MobileBatchDrawerProvider>
);

export default AppLayout;
