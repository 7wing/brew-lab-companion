import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recipes" element={<RecipeVault />} />
            <Route path="/monitor" element={<FermentationMonitor />} />
            <Route path="/community" element={<Community />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/batch/:id" element={<BatchDetail />} />
            <Route path="/new-brew" element={<BrewSetup />} />
            <Route path="/live-tasting" element={<LiveTasting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
