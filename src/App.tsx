import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IPTVProvider } from "@/contexts/IPTVContext";
import PageTransition from "./components/PageTransition";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Watch from "./pages/Watch";
import YouTubePage from "./pages/YouTube";
import TV from "./pages/TV";
import Gaming from "./pages/Gaming";
import RetroGaming from "./pages/RetroGaming";
import SteamLink from "./pages/SteamLink";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <IPTVProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/youtube" element={<YouTubePage />} />
              <Route path="/tv" element={<TV />} />
              <Route path="/gaming" element={<Gaming />} />
              <Route path="/retro" element={<RetroGaming />} />
              <Route path="/steam" element={<SteamLink />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </TooltipProvider>
    </IPTVProvider>
  </QueryClientProvider>
);

export default App;
