import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FlaskConical,
  LayoutDashboard,
  BookOpen,
  Activity,
  Users,
  User,
  Trophy,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BubbleBackground from "./BubbleBackground";

const navItems = [
  { path: "/", label: "Brew Bench", icon: LayoutDashboard },
  { path: "/recipes", label: "Recipe Vault", icon: BookOpen },
  { path: "/monitor", label: "Monitor", icon: Activity },
  { path: "/community", label: "Community", icon: Users },
  { path: "/challenges", label: "Challenges", icon: Trophy },
  { path: "/profile", label: "Profile", icon: User },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <BubbleBackground count={10} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-copper to-gold flex items-center justify-center">
                <FlaskConical size={18} className="text-copper-foreground" />
              </div>
              <span className="font-slab font-bold text-lg hidden sm:block">
                Homebrew Haven
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search recipes, batches, brewers..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30 transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal animate-pulse" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center">
              <FlaskConical size={14} className="text-copper" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 flex-col fixed top-14 bottom-0 left-0 z-40 glass-panel border-r border-border/50 py-4 px-3">
          <nav className="flex flex-col gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
          </nav>

          <div className="mt-auto pt-4 border-t border-border/50">
            <div className="glass-panel rounded-lg p-3">
              <p className="text-xs font-medium text-copper mb-1">Lab Partner</p>
              <p className="text-xs text-muted-foreground">BrewCraft Yeasts — Premium Strains</p>
            </div>
          </div>
        </aside>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <nav
              className="absolute left-0 top-14 bottom-0 w-64 glass-panel-strong border-r border-border/50 p-4 flex flex-col gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-56 relative z-10 min-h-0 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel-strong border-t border-border/50" aria-label="Mobile navigation">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
