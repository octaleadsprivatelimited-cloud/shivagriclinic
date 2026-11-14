import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "@/pages/Index";
import Videos from "@/pages/Videos";
import Watch from "@/pages/Watch";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import CropManagement from "@/pages/CropManagement";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import { broadcastCmsChange, listenForCmsChanges } from "@/lib/cmsSync";

const RequireAdmin = lazy(() => import("@/shiva-admin-suite/components/RequireAdmin").then((module) => ({ default: module.RequireAdmin })));
const AdminDashboard = lazy(() => import("@/shiva-admin-suite/pages/Dashboard"));
const AdminLogin = lazy(() => import("@/shiva-admin-suite/pages/AdminLogin"));
const AdminVideosManagement = lazy(() => import("@/shiva-admin-suite/pages/VideosManagement"));
const ContentManagement = lazy(() => import("@/shiva-admin-suite/pages/ContentManagement"));

const queryClient = new QueryClient({
  mutationCache: new MutationCache({ onSuccess: () => broadcastCmsChange() }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

listenForCmsChanges(() => {
  void queryClient.invalidateQueries({ queryKey: ["cms"] });
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="channel-loading" role="status">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/about" element={<About />} />
            <Route path="/crop-management" element={<CropManagement />} />
            <Route path="/services/crop-advisory" element={<Navigate to="/crop-management" replace />} />
            <Route path="/services/crop-management" element={<Navigate to="/crop-management" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Previously indexed service pages now lead to the video library. */}
            <Route path="/services/*" element={<Navigate to="/videos" replace />} />
            <Route path="/products/*" element={<Navigate to="/videos" replace />} />
            <Route path="/solutions/*" element={<Navigate to="/videos" replace />} />
            <Route path="/blog/*" element={<Navigate to="/videos" replace />} />
            <Route path="/resources" element={<Navigate to="/videos" replace />} />
            <Route path="/gallery" element={<Navigate to="/videos" replace />} />
            <Route path="/knowledge-base" element={<Navigate to="/videos" replace />} />
            <Route path="/case-studies" element={<Navigate to="/videos" replace />} />
            <Route path="/team" element={<Navigate to="/about" replace />} />
            <Route path="/careers" element={<Navigate to="/about" replace />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAdmin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="videos" element={<AdminVideosManagement />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="*" element={<Navigate to="/admin/videos" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
