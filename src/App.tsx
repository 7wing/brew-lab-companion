import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import RecipeVault from "./pages/RecipeVault";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import BatchDetail from "./pages/BatchDetail";
import BrewSetup from "./pages/BrewSetup";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
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
              <Route path="/challenges" element={<Navigate to="/community?tab=challenges" replace />} />
              <Route
                path="/profile/:id?"
                element={
                  <ProtectedRoute>
                    <Profile />
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
              <Route path="/live-tasting" element={<Navigate to="/community?tab=live" replace />} />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
