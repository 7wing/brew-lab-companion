import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedRouteAdmin } from "@/components/ProtectedRouteAdmin";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import RecipeVault from "./pages/RecipeVault";
import Community from "./pages/Community";
import ChallengeDetail from "./pages/ChallengeDetail";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import BatchDetail from "./pages/BatchDetail";
import RecipeDetail from "./pages/RecipeDetail";
import BrewSetup from "./pages/BrewSetup";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/AdminLayout";

const queryClient = new QueryClient();

// Home route: Landing for unauthenticated users at /, Brew Bench for authenticated users,
// otherwise redirect unauthenticated users to /auth.
function HomeRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <ProtectedRoutes />;
  }

  // Unauthenticated: show landing page only on the root path
  if (location.pathname === "/") {
    return <Landing />;
  }

  // Otherwise redirect to login while preserving intended destination
  sessionStorage.setItem("redirectTo", location.pathname + location.search);
  return <Navigate to="/auth" replace />;
}

// Wrapper for authenticated app routes (inside AppLayout with dock)
function ProtectedRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <RecipeVault />
            </ProtectedRoute>
          }
        />
        <Route path="/monitor" element={<Navigate to="/" replace />} />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/challenges" element={<Navigate to="/community?tab=challenges" replace />} />
        <Route
          path="/challenge/:id"
          element={
            <ProtectedRoute>
              <ChallengeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id?"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch/:id"
          element={
            <ProtectedRoute>
              <BatchDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-brew"
          element={
            <ProtectedRoute>
              <BrewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />
<Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRouteAdmin>
              <AdminLayout />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes - no AppLayout dock */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Home route: Landing for unauthenticated, Index (Brew Bench) for authenticated */}
            <Route path="/*" element={<HomeRoute />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
