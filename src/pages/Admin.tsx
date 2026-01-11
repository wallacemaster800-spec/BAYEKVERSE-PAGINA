import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { SeriesManager } from '@/components/admin/SeriesManager';
import { CapitulosManager } from '@/components/admin/CapitulosManager';
import { LoreManager } from '@/components/admin/LoreManager';
import { GaleriaManager } from '@/components/admin/GaleriaManager';
import { Film, Video, BookOpen, Images, Shield } from 'lucide-react';

export default function Admin() {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('series');

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <Helmet>
        <title>Panel de Administración | Bayekverse</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona el contenido de Bayekverse</p>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="series" className="gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Series</span>
            </TabsTrigger>
            <TabsTrigger value="capitulos" className="gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Capítulos</span>
            </TabsTrigger>
            <TabsTrigger value="lore" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Lore</span>
            </TabsTrigger>
            <TabsTrigger value="galeria" className="gap-2">
              <Images className="w-4 h-4" />
              <span className="hidden sm:inline">Galería</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="series" className="space-y-4">
            <SeriesManager />
          </TabsContent>

          <TabsContent value="capitulos" className="space-y-4">
            <CapitulosManager />
          </TabsContent>

          <TabsContent value="lore" className="space-y-4">
            <LoreManager />
          </TabsContent>

          <TabsContent value="galeria" className="space-y-4">
            <GaleriaManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
