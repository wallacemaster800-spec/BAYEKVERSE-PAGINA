import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/integrations/supabase/client";
import TikTokDetector from "./components/TikTokDetector"; // 🔥 Importamos el detector

// Lazy pages
const Index = lazy(() => import("./pages/Index"));
const SeriesDetail = lazy(() => import("./pages/SeriesDetail"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SeriesEditor = lazy(() => import("./pages/admin/SeriesEditor"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 🔥 PÁGINAS LEGALES
const Terminos = lazy(() => import("./pages/terminos"));
const Privacidad = lazy(() => import("./pages/privacidad"));
const Reembolsos = lazy(() => import("./pages/reembolsos"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse">
      <div className="h-12 w-12 bg-muted rounded-full" />
    </div>
  </div>
);

// 🔐 ruta protegida
function Protected({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// 🔥 limpia sesiones rotas
function SessionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        await supabase.auth.signOut();
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
    };
    check();
  }, []);

  return <>{children}</>;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionGuard>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TikTokDetector /> {/* 🔥 El detector vigila la entrada desde TikTok */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  
                  <Route
                    path="/series/:slug"
                    element={
                      <Protected>
                        <SeriesDetail />
                      </Protected>
                    }
                  />

                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* 🔥 RUTAS DE PASSWORD */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* 🔥 RUTAS LEGALES (Públicas) */}
                  <Route path="/terminos" element={<Terminos />} />
                  <Route path="/privacidad" element={<Privacidad />} />
                  <Route path="/reembolsos" element={<Reembolsos />} />

                  <Route
                    path="/admin"
                    element={
                      <Protected>
                        <AdminDashboard />
                      </Protected>
                    }
                  />

                  <Route
                    path="/admin/series/:slug"
                    element={
                      <Protected>
                        <SeriesEditor />
                      </Protected>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </SessionGuard>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;