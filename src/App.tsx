import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import RecipeVault from "./pages/RecipeVault";
import FermentationMonitor from "./pages/FermentationMonitor";
import Community from "./pages/Community";
import Challenges from "./pages/Challenges";
import Profile from "./pages/Profile";
import BatchDetail from "./pages/BatchDetail";
import BrewSetup from "./pages/BrewSetup";
import LiveTasting from "./pages/LiveTasting";
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
              <Route
                path="/monitor"
                element={
                  <ProtectedRoute>
                    <FermentationMonitor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <Challenges />
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
                path="/live-tasting"
                element={
                  <ProtectedRoute>
                    <LiveTasting />
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
