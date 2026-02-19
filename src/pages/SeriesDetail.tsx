import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { useSeriesBySlug, Capitulo } from '@/hooks/useSeries';
import { useAllCapitulos } from '@/hooks/useAllCapitulos';
import { VideoPlayer } from '@/components/series/VideoPlayer';
import { EpisodeNavigation } from '@/components/series/EpisodeNavigation';
import { SeasonTabs } from '@/components/series/SeasonTabs';
import { LoreViewer } from '@/components/series/LoreViewer';
import { GalleryMosaic } from '@/components/series/GalleryMosaic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Play, BookOpen, Image, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { META_DEFAULTS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useAuth(); // Necesitamos saber quién es el usuario
  const { data: series, isLoading, error } = useSeriesBySlug(slug || '');
  
  const [selectedEpisode, setSelectedEpisode] = useState<Capitulo | null>(null);
  const [activeTab, setActiveTab] = useState<'episodios' | 'lore' | 'galeria'>('episodios');
  const [hasPurchased, setHasPurchased] = useState(false); // Estado de compra
  
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: allEpisodes } = useAllCapitulos(activeTab === 'episodios' ? series?.id || '' : '');

  // Efecto para scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Efecto para verificar si el usuario ya compró esta serie
  useEffect(() => {
    const checkPurchase = async () => {
      if (!session?.user?.id || !series?.id) return;
      
      // El "as any" evita el error de TypeScript para tablas nuevas
      const { data } = await (supabase as any)
        .from('compras')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('series_id', series.id)
        .maybeSingle();

      if (data) setHasPurchased(true);
    };
    checkPurchase();
  }, [session, series]);

  useEffect(() => {
    if (selectedEpisode && playerRef.current) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedEpisode]);

  // --- FUNCIÓN DE COMPRA (LEMON SQUEEZY DINÁMICO) ---
  const handlePurchase = () => {
    if (!session) {
      alert("Debes iniciar sesión para comprar.");
      return;
    }

    const lemonUrl = series?.lemon_url;

    if (!lemonUrl) {
      alert("Esta serie aún no tiene link de compra configurado.");
      return;
    }

    // Le pegamos los datos de rastreo para el Webhook
    const separator = lemonUrl.includes('?') ? '&' : '?';
    const LEMON_SQUEEZY_LINK = `${lemonUrl}${separator}checkout[custom][user_id]=${session.user.id}&checkout[custom][series_id]=${series.id}`;
    
    window.location.href = LEMON_SQUEEZY_LINK;
  };

  if (error) return <Navigate to="/" />;
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="aspect-video max-w-4xl mx-auto skeleton-shimmer rounded-lg" />
        </div>
      </Layout>
    );
  }
  if (!series) return <Navigate to="/" />;

  const metaTitle = `${series.titulo} | ${META_DEFAULTS.siteName}`;
  
  // Saber si el episodio actual está bloqueado para este usuario
  const isEpisodeLocked = selectedEpisode?.es_pago && !hasPurchased;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={series.descripcion || META_DEFAULTS.description} />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence>
            {selectedEpisode && (
              <motion.div
                ref={playerRef}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="max-w-5xl mx-auto overflow-hidden"
              >
                {/* --- LÓGICA DE PAYWALL O REPRODUCTOR --- */}
                {isEpisodeLocked ? (
                  <div className="relative w-full aspect-video bg-black rounded-xl border-2 border-amber-500/30 shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpv3kpsmt/image/upload/v1739818821/bayekverse_logo_vzr0r8.png')] bg-cover bg-center opacity-10 blur-sm mix-blend-screen" />
                    
                    <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10" />
                    <h2 className="text-3xl font-display font-bold text-white mb-2 z-10">Contenido Premium</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg z-10 text-sm md:text-base">
                      Este episodio es exclusivo. Adquiere el acceso completo a <strong className="text-amber-500">{series.titulo}</strong> para desbloquear este y todos los episodios premium para siempre.
                    </p>
                    <Button 
                      onClick={handlePurchase} 
                      size="lg" 
                      className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest px-8 py-6 z-10 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                      <Lock className="w-4 h-4 mr-2" /> Comprar Acceso
                    </Button>
                  </div>
                ) : (
                  <VideoPlayer
                    src={selectedEpisode.video_url || ''}
                    title={selectedEpisode.titulo}
                    poster={selectedEpisode.miniatura_url}
                  />
                )}

                <div className="mt-3 px-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    T{selectedEpisode.temporada || 1} · Ep. {selectedEpisode.orden}: {selectedEpisode.titulo}
                    {selectedEpisode.es_pago && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-bold tracking-wider">Premium</span>}
                  </h2>
                </div>

                {allEpisodes && (
                  <EpisodeNavigation
                    currentEpisode={selectedEpisode}
                    allEpisodes={allEpisodes}
                    onNavigate={setSelectedEpisode}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SERIES INFO */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto mb-8">
            <div className="flex items-start gap-4">
              {series.portada_url && (
                <OptimizedImage src={series.portada_url} alt={series.titulo} size="thumbnail" className="w-20 h-28 rounded-lg flex-shrink-0 hidden sm:block" />
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-display font-bold">{series.titulo}</h1>
                  {series.estado === 'En emisión' ? <span className="badge-emision">En emisión</span> : <span className="badge-finalizada">Finalizada</span>}
                </div>
                {series.descripcion && <p className="text-muted-foreground">{series.descripcion}</p>}
              </div>
            </div>
          </motion.div>

          {/* TABS */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full justify-start bg-card border border-border mb-6">
                <TabsTrigger value="episodios" className="tab-cinematic flex items-center gap-2"><Play className="w-4 h-4" /> Episodios</TabsTrigger>
                <TabsTrigger value="lore" className="tab-cinematic flex items-center gap-2"><BookOpen className="w-4 h-4" /> Lore</TabsTrigger>
                <TabsTrigger value="galeria" className="tab-cinematic flex items-center gap-2"><Image className="w-4 h-4" /> Galería</TabsTrigger>
              </TabsList>

              <TabsContent value="episodios">
                {allEpisodes ? (
                  <SeasonTabs
                    episodes={allEpisodes}
                    onSelectEpisode={setSelectedEpisode}
                    selectedEpisodeId={selectedEpisode?.id}
                    hasPurchased={hasPurchased} 
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-video skeleton-shimmer rounded-lg" /> )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lore">
                <LoreViewer seriesId={series.id} isActive={activeTab === 'lore'} />
              </TabsContent>
              <TabsContent value="galeria">
                <GalleryMosaic seriesId={series.id} isActive={activeTab === 'galeria'} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}