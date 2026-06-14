import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  LayoutDashboard,
  BookOpen,
  Users,
  User,
  Plus,
  Bell,
} from "lucide-react";
import BubbleBackground from "./BubbleBackground";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { path: "/", label: "Brew Bench", icon: LayoutDashboard },
  { path: "/recipes", label: "Recipes", icon: BookOpen },
  { path: "/community", label: "Community", icon: Users },
  { path: "/new-brew", label: "New Brew", icon: Plus },
  { path: "/profile", label: "Profile", icon: User },
];

function isActive(path: string, pathname: string) {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const markAsRead = useMarkNotificationAsRead();

  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.length ?? 0;

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

      {/* ─────────────────────────── Desktop Dock ─────────────────────────── */}
      <nav
        className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl mx-auto px-4"
        aria-label="Main navigation"
      >
        <div className="glass-panel-strong rounded-2xl shadow-xl border border-border/60 px-4 py-2 flex items-center justify-between w-full gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-copper to-gold flex items-center justify-center">
              <FlaskConical size={18} className="text-copper-foreground" />
            </div>
            <span className="font-slab font-bold text-base whitespace-nowrap">
              Homebrew Haven
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems
              .filter((item) => item.path !== "/profile")
              .map((item) => {
                const active = isActive(item.path, location.pathname);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[1rem] h-4 px-1 rounded-full bg-teal text-teal-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start cursor-pointer"
                      onClick={() => {
                        markAsRead.mutate(n.id)
                        if (n.link) navigate(n.link)
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
            <Link
              to="/profile"
              className={`p-2 rounded-lg transition-colors ${
                isActive("/profile", location.pathname)
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label="Profile"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────── Mobile Dock ─────────────────────────── */}
      <nav
        className="flex lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-2"
        aria-label="Mobile navigation"
      >
        <div className="glass-panel-strong rounded-2xl shadow-xl border border-border/60 px-2 py-1.5 flex items-center justify-around w-full">
          {navItems.map((item) => {
            const active = isActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-h-[44px] min-w-[44px] justify-center ${
                  active
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium leading-normal text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─────────────────────────── Main Content ─────────────────────────── */}
      <main className="flex-1 pt-6 lg:pt-20 pb-24 lg:pb-8 relative z-10 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;