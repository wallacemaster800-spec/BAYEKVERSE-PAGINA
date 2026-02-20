import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/integrations/supabase/client";

// --- COMPONENTE INTERNO (Para evitar errores de importación) ---
const SocialDetector = () => {
  const [isSocial, setIsSocial] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    // Si querés probarlo en PC, cambiá la siguiente línea a: setIsSocial(true);
    const detect = /TikTok|Instagram|FBAN|FBAV/i.test(ua);
    setIsSocial(detect);
  }, []);

  if (!isSocial || closed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
      backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px'
    }}>
      <div style={{
        background: '#111', border: '2px solid #ff0050', padding: '30px',
        borderRadius: '15px', textAlign: 'center', maxWidth: '400px'
      }}>
        <h2 style={{ color: '#ff0050' }}>⚠️ SALIR DE TIKTOK</h2>
        <p>Google no permite iniciar sesión aquí.</p>
        <p style={{ fontSize: '14px', background: '#222', padding: '10px', margin: '15px 0' }}>
          Tocá los <b>tres puntos (...)</b> arriba y elegí <b>"Abrir en el navegador"</b>.
        </p>
        <button onClick={() => setClosed(true)} style={{ background: '#ff0050', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};

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
const Terminos = lazy(() => import("./pages/terminos"));
const Privacidad = lazy(() => import("./pages/privacidad"));
const Reembolsos = lazy(() => import("./pages/reembolsos"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse h-12 w-12 bg-muted rounded-full" />
  </div>
);

function Protected({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SessionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        await supabase.auth.signOut();
        Object.keys(localStorage).forEach(k => k.startsWith('sb-') && localStorage.removeItem(k));
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
              <SocialDetector />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/series/:slug" element={<Protected><SeriesDetail /></Protected>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/terminos" element={<Terminos />} />
                  <Route path="/privacidad" element={<Privacidad />} />
                  <Route path="/reembolsos" element={<Reembolsos />} />
                  <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
                  <Route path="/admin/series/:slug" element={<Protected><SeriesEditor /></Protected>} />
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